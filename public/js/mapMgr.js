(function(window) {

  window.MapMgr = function(args) {
    this.defaults = {

    };

    this.options = _({}).extend(this.defaults, args);
    this.socket = io.connect(window.location.origin);
    this.$selectors = {};
    this.init();

  };

  _(MapMgr.prototype).extend({

    init: function() {
      var self = this;
      console.log('init MapMgr');
      this.socket.on('busData', function(data) {
        console.log('data', data);
      });
    },

    _processCoordinates: function(lat, lng) {
      
    }

  });

})(window);
