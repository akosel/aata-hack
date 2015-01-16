var exec = require('child_process').exec;
var assert = require('assert');

// expose harvest to the application
module.exports = harvest;

// function to start connections based on routeList provided. default to include around half of bus routes available.
function harvest(routeList) {
  var routes = routeList || ["1"]; //, "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710", "711"];

  assert(routes, 'routes should exist');
  var routeIdx = 0;
  // var phantom = spawn('phantomjs', ['ajax-response.js', routes[3]]);

  var id = setInterval(function() { 
    console.log(routes[routeIdx]);

    exec('phantomjs easy-request.js ' + routes[routeIdx]);
  }, 5000);

  setInterval(function() {
    exec('killall phantomjs');
  }, 100000);
}
