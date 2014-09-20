var spawn = require('child_process').spawn;

var routes = ["1", "1U", "2", "2C", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12A", "12B", "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710", "711"];
var routeIdx = 0;
// var phantom = spawn('phantomjs', ['ajax-response.js', routes[3]]);

var id = setInterval(function() { 
  console.log(routes[routeIdx]);
  if (routeIdx < routes.length - 1) { 
    var phantom = spawn('phantomjs', ['ajax-response.js', routes[routeIdx]]);
    phantom.stdout.on('data', function(data) {
      console.log(data);
    });
    routeIdx += 1;
  } else {
    clearInterval(id);
  } 
}, 2000);