// declare the Transportation namespace
var Transportation = Transportation || {};

Transportation.sendNotification = function(msg) {
  document.querySelector('header').style.display = 'block';
  document.getElementById('notifications').innerHTML = '<strong>' + msg + '</strong><br>';
};

Transportation.addNotification = function(msg) {
  document.getElementById('notifications').innerHTML += '<br><strong>' + msg + '</strong><br>';
};

Transportation.clearNotifications = function() {
  document.querySelector('#notifications').innerHTML = "";
};

Transportation.clearHelp = function() {
  document.querySelector('#help').innerHTML = "";
};

Transportation.build = function(latitude, longitude) {
  Transportation.Map.initialize(latitude, longitude);
  Transportation.Map.addUserMarker(latitude, longitude);
  Transportation.BusSystem.initialize();
};

// Create a namespace for the user. initializing on page load
Transportation.User = (function() {
  var user = {};
  Transportation.sendNotification('Attempting to get your current position. Map will load soon after');

  // find their location if possible. performs a few sanity checks
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

// the busSystem is the container for all bus related activities 
Transportation.BusSystem = (function() {
  var busSystem = {};

  // basic properties for the bus system
  busSystem.currentRouteIdx = 0;
  busSystem.routeFilenames = [];
  busSystem.routes = ["1", "1U", "2", "2C", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12A", "12B"]; //, "13", "14", "15", "16", "17", "18", "20", "22", "33", "36", "46", "609", "710"];
  busSystem.routeFilenames = _(busSystem.routes).map(function(r) { return '/data/route' + r + '.json'; });
  busSystem.buses = {};
  busSystem.routeWaypoints = {};

  // load the route waypoints
  busSystem.loadRouteWaypoints = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/data/routeSystem.json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        busSystem.routeWaypoints = JSON.parse(xhr.responseText) || {};
      }
    };
    xhr.send();
  };

  // function to check if a waypoint exists already, and if not adds it in
  busSystem.updateRouteWaypoints = function(busStats) {
    var route = busStats.RouteAbbreviation;

    if (!busSystem.routeWaypoints[route]) {
      busSystem.routeWaypoints[route] = [[busStats.Lat, busStats.Lon]]; 
    } else {
      for (var j = 0; j < busSystem.routeWaypoints[route].length; j += 1) {
        if (_(busSystem.routeWaypoints[route][j]).isEqual([busStats.Lat, busStats.Lon])) {
          // break;
        } else if (j === busSystem.routeWaypoints[route].length - 1) {
          busSystem.routeWaypoints[route].push([busStats.Lat, busStats.Lon]); 
        }
      }
    }


  };

  // updates positions of the buses and does a quick waypoint check using long-polling. probably should switch to SSE.
  busSystem.updatePositions = function() {
    if (busSystem.currentRouteIdx === busSystem.routeFilenames.length) {
      busSystem.currentRouteIdx = 0;
      return;
    } else {
      var data = new XMLHttpRequest();
      data.open('GET', busSystem.routeFilenames[busSystem.currentRouteIdx]);
      busSystem.currentRouteIdx += 1;
      data.onreadystatechange = function() {
        if (data.readyState === 4) {
          try {
            var json = JSON.parse(data.responseText);


            for (var i = 0; i < json.length; i += 1) {
              busSystem.buses[json[i].RouteAbbreviation + '-' + json[i].VehicleNumber] = json[i];

              busSystem.updateRouteWaypoints(json[i]);
              
              Transportation.Map.addBusMarker(json[i], json[i].html);
            }
          } catch(e) {
            console.log(e);
          }
          busSystem.updatePositions();
        }
      };
      data.send();
    }
  };

  busSystem.initialize = function() {
    busSystem.loadRouteWaypoints();
    busSystem.listen = setInterval(busSystem.updatePositions, 10000);
  };

  return busSystem;
}());

Transportation.Map = (function() {
  var map = {};

  // map properties
  map.routeMarkers = [];

  // map initializer
  map.initialize = function(latitude, longitude) {
    map.container = L.map('map').setView([latitude, longitude], 14);

    L.tileLayer('http://{s}.tiles.mapbox.com/v3/akosel.i5522e6e/{z}/{x}/{y}.png', {
      maxZoom: 18
      }).addTo(map.container);

  };

  // basic haversine distance calc. probably should use built-in leaflet 
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

  // adds markers with route waypoints to the map for a given route
  map.addRouteMarkers  = function(route) {
    _(Transportation.BusSystem.routeWaypoints[route]).each(function(p) { 
      try {
        map.routeMarkers[map.routeMarkers.length] = L.circle(p, route).addTo(map.container);
      } catch(e) {
        console.log(e);
      }
    });
  };

  // removes any markers for route waypoints
  map.removeRouteMarkers  = function() {
    _(map.routeMarkers).each(function() {
      map.container.removeLayer(map.routeMarkers.pop());
    });
  };

  // add the marker for our user to the map
  map.addUserMarker = function(latitude, longitude) {
    if (!map.container) {
      return;
    }

    map.userMarker = L.circle([latitude, longitude], 200, {
      color: 'red',
      className: 'user',
      fillColor: 'red',
      fillOpacity: .8
    }).addTo(map.container);
    Transportation.Map.userMarker.bindPopup('This is you!');

  };
  
  // function to set our marker color
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

  // function to set bus icon based on direction
  // improvement would be to not use png, and try to do this with css alone
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

  // adds bus to the map
  //
  // busStats is an object containing information about the given bus received from the AATA
  map.addBusMarker = function(busStats, msg) {
    if (!map.container) {
      return;
    }

    // use to get a naive idea of how far the nearest bus is from the user.
    var distance = Transportation.Map.getDistance(Transportation.User.position.coords.latitude, busStats.Lat, Transportation.User.position.coords.longitude, busStats.Lon);

    Transportation.User.currentMinDistance = distance < Transportation.User.currentMinDistance || !Transportation.User.currentMinDistance ? distance : Transportation.User.currentMaxDistance;

    if (Transportation.User.currentMinDistance < 0) {
      var uber = new Transportation.Uber();
      uber.getTime(uber.params);
    }
    
    // remove existing bus point from the map
    var head = document.querySelector('.head-' + busStats.VehicleNumber);
    if (head) { 
      head.parentNode.removeChild(head);
    }

    // set up our icon
    var icon = L.icon({
      iconUrl: map.getMarkerIcon(busStats.direction),
      iconSize: [50, 50],
      className: 'head-' + busStats.VehicleNumber
    });

    // create a message to be display in a popup
    var msg = msg || 'Route ' + 1;
    msg += '<p>' + distance.toPrecision(2) + ' miles away</p>';
    var marker = L.marker([busStats.Lat, busStats.Lon], { icon: icon })

    // add a few event listeners to display the route map on hover over
    marker.on('mouseover', function() {
      map.removeRouteMarkers()
      map.addRouteMarkers(busStats.RouteAbbreviation)
    });
    marker.on('click', function() {
      map.removeRouteMarkers()
      map.addRouteMarkers(busStats.RouteAbbreviation)
    });
      
    // and finally, add the marker and bind the popup
    marker.addTo(map.container).bindPopup(msg, { 'minWidth': '300'});
    
  };

  return map;

})();

// basic uber api wrapper. 
Transportation.Uber = function(latitude, longitude) {
  var uber = this;

  uber.token = '7vN38Zz-DZqHdOm7VhhYPl6hcFYfLB_VSGbbkLeM';

  uber.queryUrl = {
    time: 'https://api.uber.com/v1/estimates/time',
    price: 'https://api.uber.com/v1/estimates/price',
    products: 'https://api.uber.com/v1/products'
  };
  uber.params = {
     'server_token': uber.token,
     'latitude': latitude || Transportation.User.position.coords.latitude,
     'longitude': longitude || Transportation.User.position.coords.longitude,
     'endLatitude': 42.2775,  
     'endLongitude': -83.7398
  };

  uber.updateInfo = function(params) {
    uber.getTime(params);
    uber.getProduct(params);
    uber.getPrice(params);
  };

  uber.getTime = function(params) {
    var url = uber.queryUrl.time + '?start_latitude=' + params.latitude + '&start_longitude=' + params.longitude;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', "Token " + uber.token)
    xhr.onreadystatechange = function() {
       if (xhr.readyState === 4) {
           var resp = JSON.parse(xhr.responseText);
           uber.time = resp.times;
           Transportation.Map.userMarker.bindPopup(JSON.stringify(resp));
           Transportation.sendNotification('An Uber driver can be to you in about ' + Math.round(resp.times[0].estimate / 60) + ' minutes');
       }
    };
    xhr.send();
  };

  uber.getProduct = function(params) {
    var url = uber.queryUrl.products + '?latitude=' + params.latitude + '&longitude=' + params.longitude;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', "Token " + uber.token)
    xhr.onreadystatechange = function() {
       if (xhr.readyState === 4) {
           var resp = JSON.parse(xhr.responseText);
           uber.products = resp.products;
//           Transportation.addNotification('Here are some currently available products:\n ' + JSON.stringify(resp));
       }
    };
    xhr.send();
  };

  uber.getPrice = function(params) {
    var url = uber.queryUrl.price + '?start_latitude=' + params.latitude + '&start_longitude=' + params.longitude + '&end_latitude=' + params.endLatitude + '&end_longitude=' + params.endLongitude;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', "Token " + uber.token)
    xhr.onreadystatechange = function() {
       if (xhr.readyState === 4) {
           var resp = JSON.parse(xhr.responseText);
           uber.prices = resp.prices;
           Transportation.addNotification('Getting to downtown Ann Arbor would cost around ' + JSON.stringify(resp.prices[0].estimate));
       }
    };
    xhr.send();
  };

};
