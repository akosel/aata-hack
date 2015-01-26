var express = require('express');
var harvest = require('./harvest');
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
  res.render('busAlert');
});

// only page for application renders are map template
app.get('/map', function(req, res) {
  res.render('map');
});

io.on('connection', function(socket) {
  console.log('connection established');

  harvest(socket);
  try {
    var piLight = require('./piLight');
    piLight(socket);
  } catch(e) {
    console.log(e); 
  }

  socket.emit('route', 1);
  console.log('listening on ' + (process.env.PORT || 8000));

});
