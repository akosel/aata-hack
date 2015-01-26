var assert = require('assert');
var request = require('request');
var fs = require('fs');

// expose harvest to the application
module.exports = function(socket) {

  var intervals   = [],
      abbrToId    = {},
      routeList   = [],
      abbrToIdUrl = 'http://mobile.theride.org/new/models/mdlGetRouteNames.aspx';

  // callback hell. this is not pretty.
  request(abbrToIdUrl, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      routeList = JSON.parse(body);

      // basically, if we get new data, overwrite the old file. if we don't get any data, read the old file.
      if (routeList.length) {
        abbrToId = {};
        for (var i = 0; i < routeList.length; i += 1) {
          abbrToId[routeList[i].routeAbbr] = routeList[i].routeOffsetID;  
        }
        
        fs.writeFile('./public/data/abbrToId.json', JSON.stringify(abbrToId), function(err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        fs.readFile('./public/data/abbrToId.json', function(err, data) {
          if (err) {
            console.log(err);
          }

          abbrToId = JSON.parse(data);
        });
      }
    } else {
      socket.emit('error', 'Something went wrong with the request');
    }
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
        routeId = abbrToId[route];
        console.log(routeId);

        request('http://mobile.theride.org/new//models/mdlGetBusLocation.aspx?routeID=' + routeId, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              try {
                console.log(body);
                var result = JSON.parse(body);
                socket.emit('busData', result);
              } catch(e) {
                socket.emit('news', 'It doesn\'t look like there is any information about route ' + route + ' right now. Until more info is available, the countdown timer will assume that the bus is on time.');
              }
            }
        });

    }, 5000);

    intervals.push(id);
  });

  socket.on('userConfig', function(data) {
    fs.writeFile('./public/data/userConfig.json', JSON.stringify(data));
  });

};
