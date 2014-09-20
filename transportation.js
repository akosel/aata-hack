var Transportation = Transportation || {};

Transportation.sendNotification = function(msg) {
  document.getElementById('notifications').innerHTML += msg + '\n';
}

Transportation.clearNotifications = function() {
  document.getElementById('notifications').innerHTML = "";
}

Transportation.User = (function() {
  var user = {};
  Transportation.sendNotification('Attempting to get your current position. Map will load soon after');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) { 
      Transportation.clearNotifications();

      Transportation.Map.initialize(position.coords.latitude, position.coords.longitude);
      Transportation.Map.addUserMarker(position.coords.latitude, position.coords.longitude);
      Transportation.Bus.updatePositions();
      Transportation.Bus.listen;

      user.position = position;

    }, 
    function() { 
      Transportation.sendMessage('While your browser does allow for geolocation, there is no data available');
    });
  } else {
    Transportation.sendMessage('No geolocation data available');
  }

  return user; 
}());

Transportation.Bus = (function() {
  var bus = {};

  bus.currentRouteIdx = 0;

  bus.routes = ["1", "1U", "2", "2C", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12A", "12B", "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710", "711"];
  bus.routeFilenames = [];
  for (var i = 0; i < bus.routes.length; i += 1) {
    bus.routeFilenames.push('/data/route' + bus.routes[i] + '.json');
  }
  // setInterval(done, 10000);

  bus.updatePositions = function() {
    if (bus.currentRouteIdx === bus.routeFilenames.length) {
      bus.currentRouteIdx = 0;
      return;
    } else {
      var data = new XMLHttpRequest();
      data.open('GET', bus.routeFilenames[bus.currentRouteIdx]);
      bus.currentRouteIdx += 1;
      data.onreadystatechange = function() {
        if (data.readyState === 4) {
          console.log('response', data.responseText);
          try {
            var json = JSON.parse(data.responseText);
            for (var i = 0; i < json.length; i += 1) {
              Transportation.Map.addRouteMarker(json[i].Lat, json[i].Lon, json[i].RouteAbbreviation);
            }
            console.log(json);
          } catch(e) {
            console.log(e);
          }
          bus.updatePositions();
        }
      };
      data.send();
    }
  };

  bus.listen = setInterval(bus.updatePositions, 10000);

  return bus;
}());

Transportation.Map = (function() {
  var map = {};

  map.initialize = function(latitude, longitude) {
    map.container = L.map('map').setView([latitude, longitude], 12);

    L.tileLayer('http://{s}.tiles.mapbox.com/v3/akosel.i5522e6e/{z}/{x}/{y}.png', {
      maxZoom: 18
      }).addTo(map.container);
  };

  map.addUserMarker = function(latitude, longitude) {
    if (!map.container) {
      Transportation.sendNotification('Sorry, there is no map yet. Please load a map and try again');
      return;
    }

    var circle = L.circle([latitude, longitude], 200, {
      color: 'red',
      className: 'user',
      fillColor: 'red',
      fillOpacity: 1
    }).addTo(map.container);
    circle.bindPopup('This is you!');

  }

  map.addRouteMarker = function(latitude, longitude, route) {
    if (!map.container) {
      Transportation.sendNotification('Sorry, there is no map yet. Please load a map and try again');
      return;
    }

// XXX need a way of cleaning up routes, but it'sa little tricky
//    var heads = document.getElementsByClassName('head ' + route);
//    for (var i = 0; i < heads.length; i += 1) {
//      heads[i].parentNode.removeChild(heads[i]);
//    }
    var circle = L.circle([latitude, longitude], 50, {
      className: 'head ' + route,
      fillColor: '#f03',
      fillOpacity: 0.8
    }).addTo(map.container);
    circle.bindPopup('Route ' + route);

  };

  return map;

}());

// var token = '7vN38Zz-DZqHdOm7VhhYPl6hcFYfLB_VSGbbkLeM';
// var url = 'https://api.uber.com/v1/estimates/time';
// var params = {
//     'server_token': token,
//     'latitude': 42.288,
//     'longitude': -83.7311
// };
// 
// var xhr = new XMLHttpRequest();
// var paramUrl = url + '?start_latitude=' + params.latitude + '&start_longitude=' + params.longitude;
// xhr.open('GET', paramUrl);
// xhr.setRequestHeader('Authorization', "Token " + token)
// xhr.onreadystatechange = function() {
//     if (xhr.readyState === 4) {
//         var resp = JSON.parse(xhr.responseText);
//     }
// };
