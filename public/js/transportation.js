
var Transportation = Transportation || {};

Transportation.sendNotification = function(msg) {
  document.querySelector('header').style.display = 'block';
  document.getElementById('notifications').innerHTML = '<strong>' + msg + '</strong><br>';
}

Transportation.addNotification = function(msg) {
  document.getElementById('notifications').innerHTML += '<br><strong>' + msg + '</strong><br>';
}

Transportation.clearNotifications = function() {
  document.querySelctor('header').innerHTML = "";
}

Transportation.build = function(latitude, longitude) {
  Transportation.Map.initialize(latitude, longitude);
  Transportation.Map.addUserMarker(latitude, longitude);
  Transportation.BusSystem.updatePositions();
  Transportation.BusSystem.listen;
}

Transportation.User = (function() {
  var user = {};
  Transportation.sendNotification('Attempting to get your current position. Map will load soon after');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) { 
      Transportation.sendNotification('Click anywhere outside of this box to view the map!');
      
      var distance = Transportation.Map.getDistance(position.coords.latitude, 42.2775, position.coords.longitude, -83.7398);
      if (distance > 20) {
        Transportation.addNotification('Woah nelly! You are far away from Ann Arbor. This page may not be too useful for you, but we are centering the map on Ann Arbor anyways.');
        user.position = { timestamp: Date.now(), coords: { latitude: 42.2775, longitude: -83.7398 } }; 
      } else {
        user.position = position;
      }

      Transportation.build(user.position.coords.latitude, user.position.coords.longitude);


    }, 
    function() { 
      Transportation.sendNotification('Click anywhere outside of this box to view the map!');
      Transportation.addNotification('While your browser does allow for geolocation, we couldn\'t access it, so we centered it on a default.');
      user.position = { timestamp: Date.now(), coords: { latitude: 42.2775, longitude: -83.7398 } }; 

      Transportation.build(user.position.coords.latitude, user.position.coords.longitude);
    });
  } else {
    Transportation.sendNotification('Click anywhere outside of this box to view the map!');
    Transportation.addNotification('No geolocation data available');
      
    user.position = { timestamp: Date.now(), coords: { latitude: 42.2775, longitude: -83.7398 } }; 

    Transportation.build(user.position.coords.latitude, user.position.coords.longitude);
  }

  return user; 
})();

Transportation.BusSystem = (function() {
  var bus = {};

  // basic properties for the bus system
  bus.currentRouteIdx = 0;
  bus.routeFilenames = [];
  bus.routes = ["1", "1U", "2", "2C", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12A", "12B", "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710"];
  bus.routeFilenames = _(bus.routes).map(function(r) { return '/data/route' + r + '.json'; });

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
              Transportation.Map.addRouteMarker(json[i], json[i].html);
            }
          } catch(e) {
            var err = e;
          }
          bus.updatePositions();
        }
      };
      data.send();
    }
  };

  bus.listen = setInterval(bus.updatePositions, 3000);

  return bus;
}());

Transportation.Map = (function() {
  var map = {};

  map.initialize = function(latitude, longitude) {
    map.container = L.map('map').setView([latitude, longitude], 14);

    L.tileLayer('http://{s}.tiles.mapbox.com/v3/akosel.i5522e6e/{z}/{x}/{y}.png', {
      maxZoom: 18
      }).addTo(map.container);
  };

  map.getDistance = function(lat1, lat2, lon1, lon2) {
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
  
  map.getMarkerColor = function(direction) {
    var upD = direction.toUpperCase();
    if (upD === "TO DOWNTOWN" || upD === "TO ANN ARBOR") {
      return '#FF701E';
    } else if (upD === "LOOP") {
      return '#20B37E';
    } else {
      return '#2192CC';
    }

  };

  map.getMarkerIcon = function(direction) {
    var upD = direction.toUpperCase();
    if (upD === "TO DOWNTOWN" || upD === "TO ANN ARBOR") {
      return '/assets/img/in-bus-icon.png';
    } else if (upD === "LOOP") {
      return '/assets/img/loop-bus-icon.png';
    } else {
      return '/assets/img/from-bus-icon.png';
    }

  };

  map.addRouteMarker = function(busStats, msg) {
    if (!map.container) {
      return;
    }

    var distance = Transportation.Map.getDistance(Transportation.User.position.coords.latitude, busStats.Lat, Transportation.User.position.coords.longitude, busStats.Lon);
    
    var head = document.querySelector('.head-' + busStats.VehicleNumber);
    if (head) { 
      head.parentNode.removeChild(head);
    }

    // var circle = L.circle([busStats.Lat, busStats.Lon], 100, {
    //   className: 'head-' + busStats.VehicleNumber,
    //   fillColor: map.getMarkerColor(busStats.direction),
    //   color: 'black',
    //   fillOpacity: 0.8
    // }).addTo(map.container);
    var icon = L.icon({
      iconUrl: map.getMarkerIcon(busStats.direction),
      iconSize: [50, 50],
      className: 'head-' + busStats.VehicleNumber
    });

    L.marker([busStats.Lat, busStats.Lon], { icon: icon }).addTo(map.container).bindPopup(msg, { 'minWidth': '300'});
    
    var msg = msg || 'Route ' + 1;
    msg += '<p>' + distance.toPrecision(2) + ' miles away</p>';
    circle.bindPopup(msg, { 'minWidth': '300'});


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
