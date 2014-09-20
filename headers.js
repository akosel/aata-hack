var page = require('webpage').create();
var fs = require('fs');
var system = require('system');

route = system.args[1];
page.open('http://www.theride.org/SchedulesMapsTools/tabid/62/ctl/InteractiveMap/mid/2257/#RideTrak', function (status) {
    if (status === 'success') {
          captureAjaxResponsesToConsole();
    }
});

function captureAjaxResponsesToConsole() {
    page.evaluate(function(route) {
        jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').val(route);
        jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').trigger('change');

        (function(open) {
            XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                this.addEventListener("readystatechange", function() {
                    if (this.readyState === 4) {
                        try {
                            var res={'response':this.responseText, 'url':url};
                            console.log(JSON.stringify(res));
                        }
                        catch(e) {
                            console.log('listener error', e);
                        }
                    }
                }, false);
                open.call(this, method, url, async, user, pass);
            };
        })(XMLHttpRequest.prototype.open);
        return 1;
    }, route);
}

page.onConsoleMessage = function (msg) {
    try {
        var res=JSON.parse(msg);
        page.close();
        var html = unescape(JSON.parse(res.response.slice(1)).Html);
        var result = JSON.parse(res.response.slice(1)).Result;
        for (var i = 0; i < result.length; i += 1) {
            result[i]['timestamp'] = Date.now();
        }
        console.log('--------------------');
        console.log('URL:' + res.url);
        console.log('Result: ' + JSON.stringify(result));
        fs.write('route' + route + '.json', JSON.stringify(result), 'a');
    } catch(e) {
        console.log('ERROR:', e, msg);
    }
};

