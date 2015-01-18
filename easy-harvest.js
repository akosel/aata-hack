var exec = require('child_process').exec;
var assert = require('assert');


// expose harvest to the application
module.exports = function(socket) {
  var intervals = [];
  var routeToRouteId = { 1: 1 };

  socket.on('route', function(route) {
    console.log('route event fired');
    if (intervals.length) {
      console.log('clearing intervals');
      while (intervals.length) {
        clearTimeout(intervals.pop());
      }
    }
    var id = setInterval(function() { 
        routeId = routeToRouteId[route];

        exec('phantomjs easy-request.js ' + routeId, function(error, stdout, stderr) {
            console.log('stderr', stderr, error);
            try {
                var result = JSON.parse(stdout);
                socket.emit('busData', result);
            } catch(e) {
                socket.emit('news', e);
            }
        });

    }, 5000);

    intervals.push(id);
  });

};
