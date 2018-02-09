const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err) throw err;
    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
    	const myAwesomeDB = db.db('mongochat')
  		 var chat = myAwesomeDB.collection('chats')
       // var chat = db.collection('chats');

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data){
            var name = data.name;
            var message = data.message;;
            var date = data.date

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                chat.insert({name: name, message: message, date: new Date(date)}, function(){
                    client.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', function(data){
            // Remove all chats from collection
            chat.remove({}, function(){
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});

// http.listen(4000, function(){
//   console.log('listening on *:4000');
// });