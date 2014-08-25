var page = require('webpage').create();
var fs = require('fs');

page.open('http://www.theride.org/SchedulesMapsTools/tabid/62/ctl/InteractiveMap/mid/2257/#RideTrak', function (status) {
    if (status === 'success') {
          captureAjaxResponsesToConsole("1");
    }
});

function captureAjaxResponsesToConsole(r) {
    // logs ajax response contents to console so sublime's onConsoleMessage can use the contents
    // credit to Ionuț G. Stan
    // http://stackoverflow.com/questions/629671/how-can-i-intercept-xmlhttprequests-from-a-greasemonkey-script
    page.evaluate(function() {
        jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').val("4");
        jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').trigger('change');
        (function(open) {
            XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                this.addEventListener("readystatechange", function() {
                    if (this.readyState === 4) {
                        var res={'response':this.responseText, 'url':url};
                        try {
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
    });
}

page.onConsoleMessage = function (msg) {
    try {
        var res=JSON.parse(msg);
        var html = unescape(JSON.parse(res.response.slice(1)).Html);
        var result = JSON.stringify(JSON.parse(res.response.slice(1)).Result);
        console.log(result);
        console.log('--------------------');
        console.log('URL:' + res.url);
        console.log('Result: ' + result);
        console.log('HTML: ' + html);
        fs.write('index.html', html, 'w');
        fs.write('data.txt', result, 'a');
    } catch(e) {
        console.log('ERROR:', e);
    }
};

