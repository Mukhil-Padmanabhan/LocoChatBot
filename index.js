const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cron = require('node-cron');
var Moment = require('moment');
var result = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
http.listen(3000, function(){
// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err) throw err;
    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        const myAwesomeDB = db.db('mongochat')
         var chat = myAwesomeDB.collection('chats')
       // var chat = db.collection('chats');    // depreceated

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

//new Moment(dateValue, 'DD-MM-YYYY').format('DD-MM-YYYY');

        // Get chats from mongo collection
//new Moment(vacationData.startDate).format('DD-MM-YYYY')

        new cron.schedule('0,30 * * * * *', function () {
        console.log('running a task every minute');
        //new Moment(vacationData.startDate + ' ' + vacationData.startTime, 'DD-MM-YYYY HH:mm:ss');

      chat.find({"date":{"$lte": new Date()}}).limit(100).toArray(function(err, res){
            if(err) throw err;
            // Emit the messagesq
            //console.log("res", res);
            socket.emit('cleared');
            socket.emit('output', res);             
            
        });
});

        chat.find({"date":{"$lte": new Date()}}).limit(100).toArray(function(err, res){
            if(err) throw err;
            // Emit the messagesq
            //console.log("res", res);
            socket.emit('output', res);           
        });

        // Handle input events
        socket.on('input', function(data){
            var name = data.name;
            var message = data.message;
            var date = new Date(data.date);

            // Check for name and message
            if(name == '' || message == '' || date == ''){
                // Send error status
                sendStatus('Please enter a name, date and message');
            } else {
                var temp = [];
                // Insert message
                chat.insert({name: name, message: message, date: date}, function(){
                    
                    temp.push(data)
                    var x = temp.filter(function(info){
                    info.date = new Date(info.date).toUTCString();
                    var diff = Date.parse(new Date()) - Date.parse(new Date(info.date));
                    //console.log("diff", diff)
                    if(diff >= 0) return info;
                });

                    client.emit('output', temp);

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
  console.log('listening on *:3000');
});










        // var x = res.map(function(info){
            //  info.date = new Date(info.date).toUTCString();
            //  var diff = Date.parse(new Date()) - Date.parse(new Date(info.date));
            //  console.log("diff", diff)
            //  if(diff >= 0) return info;
            // });