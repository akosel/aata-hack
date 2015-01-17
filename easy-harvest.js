var exec = require('child_process').exec;
var assert = require('assert');


// expose harvest to the application
module.exports = function(socket) {
  var routes = ["1"]; //, "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710", "711"];

  assert(routes, 'routes should exist');
  var routeIdx = 0;

  var id = setInterval(function() { 

    console.log('harvest function');
    socket.emit('news', 'requesting');
    exec('phantomjs easy-request.js ' + routes[routeIdx], function(error, stdout, stderr) {
        console.log('stderr', stderr, error);
        try {
            var result = JSON.parse(stdout);
            socket.emit('busData', result);
        } catch(e) {
            socket.emit('news', e);
        }
    });
  }, 5000);

};
