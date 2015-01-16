var fs = require('fs');
var system = require('system');

var route = system.args[1] || 1;
console.log('start route', route);
harvest(route);

function harvest(route) {
  var self = this;
  self.page = require('webpage').create();
  self.page.open('http://mobile.theride.org/new/models/mdlGetBusLocation.aspx?routeID=' + route, function (status) {
    if (status === 'success') {
        var json = page.evaluate(function() {
            return document.querySelector('body').innerHTML;
        });
        console.log(json);
    }   
    fs.write('./public/data/bus.json', json);
  });
}
