var express = require('express');
var harvest = require('./harvest');
var app = express();
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

// only page for application renders are map template
app.get('/', function(req, res) {
  res.render('map');
});

// server starts, running the harvester. 
var server = app.listen(process.env.PORT || 8000, function() {

  console.log('harvesting');
  // calls harvest
  harvest();
  // var routes = ["1", "1U", "2", "2C", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12A", "12B"]; //, "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710"];
  // var routeIdx = 0;

  // var id = setInterval(function() { 
  //   console.log(routes[routeIdx]);
  //   if (routeIdx < routes.length - 1) { 
  //     var phantom = spawn('phantomjs', ['ajax-response.js', routes[routeIdx]]);
  //     phantom.stdout.on('data', function(data) {
  //       console.log(data);
  //     });
  //     routeIdx += 1;
  //   } else {
  //     clearInterval(id);
  //   } 
  // }, 2000);
  console.log('listening');
});
