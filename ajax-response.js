var fs = require('fs');
var system = require('system');

var route = system.args[1];
console.log('start route', route);
harvest(route);

function harvest(route) {
  var self = this;
  self.page = require('webpage').create();
  self.page.open('http://www.theride.org/SchedulesMapsTools/tabid/62/ctl/InteractiveMap/mid/2257/#RideTrak', function (status) {
    if (status === 'success') {
      console.log(route);
      captureAjaxResponsesToConsole(route);
    }
  });

  function captureAjaxResponsesToConsole(route) {
    self.page.evaluate(function(route) {
      jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').val(route);
      jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').trigger('change');

      (function(open) {
        XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
          this.addEventListener("readystatechange", function() {
            if (this.readyState === 4) {
              var res={'route': route, 'response':this.responseText, 'url':url};
              try {
                console.log(JSON.stringify(res));
              }
              catch(e) {
                var error = e;
              }
            }
          }, false);
          open.call(this, method, url, async, user, pass);
        };
      })(XMLHttpRequest.prototype.open);
      return 1;
    }, route);
  }

  self.page.onConsoleMessage = function (msg) {
    try {
      var res=JSON.parse(msg);
      var html = unescape(JSON.parse(res.response.slice(1)).Html);

      // begin attempts to gather all html data
      // need to tease out multiple bus data packed into one html blob
      // probably need to use Vehicle Number
      var el = document.createElement('div');
      el.innerHTML = html;
      // use all to determine number of entries
      var directions = el.querySelectorAll('table');

      var result = JSON.parse(res.response.slice(1)).Result;
      var route = res.route;
      for (var i = 0; i < result.length; i += 1) {
        result[i]['timestamp'] = Date.now();
        var htmlBusNumber = directions[i].querySelector('td.bus_number').innerHTML
        
        if (htmlBusNumber == result[i].VehicleNumber) {
          result[i].direction = directions[i].querySelector('td.direction').innerHTML
          result[i].html = directions[i].outerHTML;
        }

      }
      // console.log('--------------------');
      // console.log('URL:' + res.url);
      // console.log('HTML: ' + html);
      //        fs.write('route' + route + '.html', html.replace('none', 'block'), 'w');
      //
//      fs.write('./data.txt',  JSON.stringify(result)+ '\n', 'a');
      fs.write('./public/data/route' + route + '.json', JSON.stringify(result), 'w');
    } catch(e) {
      console.log(e);
      var err = e;
    }
  };
}
