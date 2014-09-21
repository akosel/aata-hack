var Transportation = Transportation || {};

Transportation.sendNotification = function(msg) {
  document.getElementById('notifications').innerHTML = '<strong>' + msg + '</strong><br>';
}

Transportation.addNotification = function(msg) {
  document.getElementById('notifications').innerHTML += '<br><strong>' + msg + '</strong><br>';
}

Transportation.clearNotifications = function() {
  document.getElementById('notifications').innerHTML = "";
}

Transportation.User = (function() {
  var user = {};
  Transportation.sendNotification('Attempting to get your current position. Map will load soon after');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) { 
      Transportation.sendNotification('Click anywhere outside of this box to view the map!');

      Transportation.Map.initialize(position.coords.latitude, position.coords.longitude);
      Transportation.Map.addUserMarker(position.coords.latitude, position.coords.longitude);
      Transportation.Bus.updatePositions();
      Transportation.Bus.listen;

      user.position = position;

    }, 
    function() { 
      Transportation.sendNotification('Click anywhere outside of this box to view the map!');
      Transportation.addNotification('While your browser does allow for geolocation, we couldn\'t access it, so we centered it on a default.');
      user.position = { timestamp: Date.now(), coords: { latitude: 42.2775, longitude: -83.7398 } }; 

      Transportation.Map.initialize(user.position.coords.latitude, user.position.coords.longitude);
      Transportation.Map.addUserMarker(user.position.coords.latitude, user.position.coords.longitude);
      Transportation.Bus.updatePositions();
      Transportation.Bus.listen;
    });
  } else {
    Transportation.sendNotification('Click anywhere outside of this box to view the map!');
    Transportation.addNotification('No geolocation data available');
      
    user.position = { timestamp: Date.now(), coords: { latitude: 42.2775, longitude: -83.7398 } }; 

    Transportation.Map.initialize(user.position.coords.latitude, user.position.coords.longitude);
    Transportation.Map.addUserMarker(user.position.coords.latitude, user.position.coords.longitude);
    Transportation.Bus.updatePositions();
    Transportation.Bus.listen;
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
          try {
            var json = JSON.parse(data.responseText);
            for (var i = 0; i < json.length; i += 1) {
              Transportation.Map.addRouteMarker(json[i].Lat, json[i].Lon, json[i].RouteAbbreviation, json[i].html);
            }
          } catch(e) {
            var err = e;
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
    map.container = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('http://{s}.tiles.mapbox.com/v3/akosel.i5522e6e/{z}/{x}/{y}.png', {
      maxZoom: 18
      }).addTo(map.container);
  };

  map.distance = function(lat1, lat2, lon1, lon2) {
    console.log('distance');
    var R = 3959; // mi
    var r1 = Math.PI * lat1 / 180;
    var r2 = Math.PI * lat2 / 180;
    var deltaLat = Math.PI * (lat2-lat1) / 180;
    var deltaLon = Math.PI * (lon2-lon1) / 180;

    var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
          Math.cos(r1) * Math.cos(r2) *
          Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;

    return d;
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

  map.addRouteMarker = function(latitude, longitude, route, msg) {
    if (!map.container) {
      Transportation.sendNotification('Sorry, there is no map yet. Please load a map and try again');
      return;
    }

    var distance = Transportation.Map.distance(Transportation.User.position.coords.latitude, latitude, Transportation.User.position.coords.longitude, longitude);
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
    
    var msg = msg || 'Route ' + 1;
    msg += '<p>' + distance.toPrecision(2) + ' miles away</p>';
    circle.bindPopup(msg, { 'minWidth': '300'});
    // if (distance < 3) {
    //   circle.openPopup();
    // }

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
