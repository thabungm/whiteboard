/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();
var io = require('socket.io')(app);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('register', function(msg){
    console.log('message: ' + JSON.stringify(msg));
  });
  socket.on('draw', function(msg){
    console.log('message: ' + JSON.stringify(msg));
    socket.broadcast.emit("remote_draw",{x:msg.x,y:msg.y});
  });
  socket.on('remote_draw', function(msg){
    console.log('remote_draw: ' + JSON.stringify(msg));
    socket.broadcast.emit("remote_draw",msg);
  });
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat:text', function(msg){
    socket.broadcast.emit("chat:text",msg);
  });


  socket.on('video', function(msg){
    console.log('video: ' + JSON.stringify(msg));
    socket.broadcast.emit("video",msg);
  });
  //socket.on('video');

  
});




// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});
app.get('/', routes.index);

app.listen(3007, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
