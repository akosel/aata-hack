var page = require('webpage').create(),
    system = require('system'),
    address;

var system = require('system');

page.onConsoleMessage = function(msg) {
        system.stderr.writeLine('console: ' + msg);
};



if (system.args.length === 1) {
    console.log('Usage: netlog.js <some URL>');
    phantom.exit(1);
} else {
    address = system.args[1];

    page.onResourceRequested = function (req) {
        console.log('requested: ' + JSON.stringify(req, undefined, 4));
    };

    page.onResourceReceived = function (res) {
        console.log('received: ' + JSON.stringify(res, undefined, 4));
    };

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
        }
        console.log('ajax request')
        page.evaluate(function() {
            var o = $ajax.InvokeCallback;
            
            $ajax.InvokeCallback = (function(o) {
                return function(control, options, params) {
                    o.apply(o, arguments);
                    console.log('Invoke', control, JSON.stringify(options), params);
                    console.log(ajaxRequest);
                };
            })($ajax.InvokeCallback);
//            console.log($ajax.InvokeCallback('a','a','a'));
            console.log('foo');
            jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').val('1');
            jQuery('#dnn_ucInteractiveMapSideNav_ucRideTrakSideNav_ucStopSelection_ddlRoute').trigger('change');
        });
        wait();
    });
}

var wait = function() {
    setTimeout(function() {
        phantom.exit();
    }, 10000);
};
