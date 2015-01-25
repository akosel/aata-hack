var express = require('express');
var harvest = require('./harvest');
var piLight = require('./piLight');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

// server starts, running the harvester. 
server.listen(process.env.PORT || 8000); 

// only page for application renders are map template
app.get('/', function(req, res) {
  res.render('map');
});

// only page for application renders are map template
app.get('/tl', function(req, res) {
  res.render('busAlert');
});

io.on('connection', function(socket) {
  console.log('connection established');

  socket.on('news', function(data) {
    console.log(data);
  });
  harvest(socket);
  try {
    piLight(socket);
  } catch(e) {
    console.log('gpio not available in this context'); 
  }
  console.log('listening on ' + (process.env.PORT || 8000));

});
