var assert = require('assert');
var request = require('request');


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

        request('http://mobile.theride.org/new//models/mdlGetBusLocation.aspx?routeID=' + routeId, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              try {
                console.log(body);
                var result = JSON.parse(body);
                socket.emit('busData', result);
              } catch(e) {
                socket.emit('news', 'No information');
              }
            }
        });

    }, 5000);

    intervals.push(id);
  });

};
