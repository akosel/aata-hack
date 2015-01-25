var gpio = require('pi-gpio');

var classToPinNumber = {
  'go': 11,
  'set': 13,
  'ready': 15
};

module.exports = function(socket) {
  socket.on('lightData', function(data) {
    var pinNumber = classToPinNumber[data.className],
        pinState  = Number(data.pinState);
    gpio.open(pinNumber, 'output', function(err) {
      gpio.write(pinNumber, pinState, function(err) {
        console.log('written', pinNumber, pinState);
        gpio.close(pinNumber);
      });
    });
  });
};
