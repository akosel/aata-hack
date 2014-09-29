var spawn = require('child_process').spawn;
var assert = require('assert');

// expose harvest to the application
module.exports = harvest;

// function to start connections based on routeList provided. default to include around half of bus routes available.
function harvest(routeList) {
  var routes = routeList || ["1", "1U", "2", "2C", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12A", "12B"]; //, "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710", "711"];

  assert(routes, 'routes should exist');
  var routeIdx = 0;
  // var phantom = spawn('phantomjs', ['ajax-response.js', routes[3]]);

  var id = setInterval(function() { 
    console.log(routes[routeIdx]);

    // create a new phantomjs process to retrieve data from aata. close connection when each route provided is processed
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
}
