const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cron = require('node-cron');
var result = [];
var dbAction = require('./dbActionHandler.js')

app.get('/', function(req, res){    
  res.sendFile(__dirname + '/index.html');
});
var port = process.env.PORT || 3000;
http.listen(port, function(){

    mongo.connect('mongodb://mukhil:mukhil@ds231658.mlab.com:31658/locochat', function(err, db){   // Connect to mongo .  mongodb://127.0.0.1/mongochat     mongodb://mukhil:mukhil@ds231658.mlab.com:31658/locochat
        if(err) throw err;
        client.on('connection', function(socket){
         const myAwesomeDB = db.db('locochat')
         var chat = myAwesomeDB.collection('chats');
         sendStatus = function(status) {
         socket.emit('status', status);
        }
        var query = {
            "date":{"$lte": new Date()}
        }
        new cron.schedule('0,30 * * * * *', function () {
            console.log("CRON running....")
            dbAction.dbController(chat, 'find' , query , 'output', socket);
            socket.emit('cleared');   
        });
        dbAction.dbController(chat, 'find' , query , 'output', socket);
            

            // Handle input events
        socket.on('input', function(data){
            var name = data.name;
            var message = data.message;
            var date = data.date;
            if(name == '' || message == '' || date == '')sendStatus('Please enter a name, date and message');
            else {
                var toInsert = {
                    name: name, 
                    message: message, 
                    date: new Date(date).toUTCString()
            }
                dbAction.dbController(chat, 'insert' , toInsert , 'output', socket);
                sendStatus({
                    message: `Message scheduled to be sent on ${toInsert.date}`,
                    clear: true
                });
            }
        });
        socket.on('clear', function(data){
            chat.remove({}, function(){
                socket.emit('cleared');
            });
        });
        });
    });
});
