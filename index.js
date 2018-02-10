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

mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){   // Connect to mongo
    if(err) throw err;
    client.on('connection', function(socket){
        const myAwesomeDB = db.db('mongochat')
         var chat = myAwesomeDB.collection('chats');
        sendStatus = function(status) {
            socket.emit('status', status);
        }
        new cron.schedule('0,30 * * * * *', function () {
        console.log('running a task every minute');
        chat.find({"date":{"$lte": new Date().toUTCString()}}).limit(100).toArray(function(err, res){
            if(err) throw err;
            socket.emit('cleared');
            socket.emit('output', res);              
        });
    });

        chat.find({"date":{"$lte": new Date().toUTCString()+(+0530)+' '+'(IST)'}}).limit(100).toArray(function(err, res){
            if(err) throw err;
            socket.emit('output', res);           
        });

        // Handle input events
        socket.on('input', function(data){
            var name = data.name;
            var message = data.message;
            var date = new Date(data.date);
            if(name == '' || message == ''){  // Check for name and message
                sendStatus('Please enter a name and message');
            } else {
                var temp = [];
                chat.insert({name: name, message: message, date: date}, function(){ // Insert message
                    
                temp.push(data)
                var x = temp.filter(function(info){
                info.date = new Date(info.date).toUTCString();
                var diff = Date.parse(new Date()) - Date.parse(new Date(info.date));
                //console.log("diff", diff)
                if(diff >= 0) return info;
                });
                client.emit('output', temp);
                sendStatus({
                    message: 'Message sent',
                    clear: true
                });
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







//new Moment(dateValue, 'DD-MM-YYYY').format('DD-MM-YYYY');

        // Get chats from mongo collection
//new Moment(vacationData.startDate).format('DD-MM-YYYY')

//new Moment(vacationData.startDate + ' ' + vacationData.startTime, 'DD-MM-YYYY HH:mm:ss');

        // var x = res.map(function(info){
            //  info.date = new Date(info.date).toUTCString();
            //  var diff = Date.parse(new Date()) - Date.parse(new Date(info.date));
            //  console.log("diff", diff)
            //  if(diff >= 0) return info;
            // });