var assert = require('assert');
var request = require('request');
var fs = require('fs');


// expose harvest to the application
module.exports = function(socket) {
  var intervals = [];
  var idToAbbr = {"1":"1","2":"11","3":"14","4":"22","5":"25","6":"29","7":"32","8":"38","9":"23","10":"2","11":"3","13":"5","14":"30","15":"6","16":"7","17":"8","18":"9","20":"4","22":"13","33":"15","36":"20","39":"21","46":"24","351":"16","352":"17","353":"18","354":"19","501":"26","502":"27","505":"28","609":"31","710":"33","711":"34","787":"35","12A":"36","12B":"37","1U":"10","2C":"12"}

  fs.readFile('./public/data/idToAbbr.json', function(err, data) {
    if (err) {
      console.log(err);
    }

    idToAbbr = data;
  });

  socket.on('route', function(route) {
    console.log('route event fired');
    if (intervals.length) {
      console.log('clearing intervals');
      while (intervals.length) {
        clearTimeout(intervals.pop());
      }
    }
    var id = setInterval(function() { 
        routeId = idToAbbr[route];

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
