// yeah, it's on the window. what are you going to do about it?
(function(window) {

window.BusAlertMgr = function(args) {
  this.defaults = {
    dashItems: ['adherence', 'direction'],
    userConfig: {
      stopMinutes: {
        placeholderText: 'Add stop minute (i.e. if the bus leaves at four after the hour, write 4)',
        allowMultiple: true,
        $inputs: []
      }, 
      walkTime: {
        placeholderText: 'Set the time it takes you to walk to the bus stop',
        allowMultiple: false,
        $inputs: []
      }, 
      route: {
        placeholderText: 'Set the route you care about',
        allowMultiple: false,
        $inputs: []
      }
    },
    selectorClasses: ['config', 'notifications', 'reset']
  };
  this.options = _({}).extend(this.defaults, args);
  this.socket = io.connect(window.location.origin);
  this.$selectors = {};
  this.init();
};

_(BusAlertMgr.prototype).extend({

  init: function() {
    var self = this;
    console.log('init');
    
    // listen to the server for changes to the bus data
    this.socket.on('busData', function(json) {
      var toBusGroup = [];
      _(json).each(function(v) {
          if (v.direction === 'To Downtown') {
            toBusGroup.push(v);
          }
      });
      if (!toBusGroup.length) {
          toBusGroup.push(json[0]);
      }

      var bus = toBusGroup[0];
      
      var updateValues = self.options.dashItems;

      _(updateValues).each(function(val) {
        self._updateElement(val, bus[val]); 
      });

    });

    _(self.options.selectorClasses).each(function(c) {
      self.$selectors[c] = document.querySelector('.' + c);
    });

    this._pageSetup();

  },

  _pageSetup: function() {
    var self = this;
    var userConfigKeys = _(this.options.userConfig).keys();
    var isReady = _(userConfigKeys).every(function(val) {
      if (!self._getItem(val)) {
        console.log('MISSING: ', val);
        self.showConfig(val);
        return false;
      } 
      return true;
    });

    if(!isReady) {
      return false;
    }

    this.$selectors['reset'].onclick = function (e) {
      e.preventDefault();

      localStorage.clear();
      self._pageSetup();
    };

    this.socket.emit('route', this._getItem('route'));
    this._startClock();
  },

  _addInput: function(val) {
    $input = document.createElement('input');
    $input.type = 'number';
    $input.placeholder = this.options.userConfig[val].placeholderText;
    $input.required = true;
    $input.className = val;
    
    this.options.userConfig[val].$inputs.push($input);
    this.$selectors[val].appendChild($input);
  },

  _addButton: function(args, clickFn) {
    $button = document.createElement('button');
    $button.type = 'button';
    $button.textContent = args.text;
    $button.className = args.className || '';

    $button.onclick = clickFn.bind(this);

    this.$selectors[args.context].appendChild($button);
  },

  _addBox: function(val) {
    $div = document.createElement('div');
    $div.className = val + ' box';

    this.$selectors[val] = $div;
    this.$selectors['notifications'].appendChild($div);
  },

  showConfig: function() {
    var self = this;
    this.$selectors['config'].style.display = 'block';
    var userConfigKeys = _(this.options.userConfig).keys();

    _(userConfigKeys).each(function(val) {
      self._addBox(val);
      self._addInput(val);
      if (self.options.userConfig[val].allowMultiple) {
        self._addButton({
          text: '+Add another',
          context: val,
          className: 'helper'
        }, function() {
          self._addInput(val);
          document.querySelector('.' + val + '.box .helper').remove();
        });
      }
    });


    this._addButton({
      text: 'All done',
      context: 'notifications' 
    }, function() {
      var self = this;

      _(userConfigKeys).each(function(key) {
        var value;
        if (self.options.userConfig[key].allowMultiple) {
          $input = document.querySelectorAll('input.' + key);
          value = [];
          _($input).each(function($numberInput) {
            value.push($numberInput.value);
          })
          value = JSON.stringify(value);
        } else {
          $input = document.querySelector('input.' + key);
          value = $input.value;
        }

        self._setItem(key, value);
      });
      self.$selectors['notifications'].innerHTML = null;
      self.$selectors['config'].style.display = 'none';
      self._pageSetup();
    });

  },

  _getLateBy: function(adherence) {
    var lateBy = Number(adherence[0]) || 0;

    if (adherence.match('ahead')) {
        lateBy = lateBy * -1;
    }
    return lateBy;
  },


  _startClock: function() {
    var self = this;
    var lateBy = 0;
    this.socket.on('busData', function(data) { 
      lateBy = self._getLateBy(data[0].adherence);
    });
    setInterval(function() {
      var fmt = 'HH:mm';
      var hour = moment().hour();
      var minute = moment().minute();
      var second = moment().second();
      var $timestamp = document.querySelector('.timestamp');
      var stopMinutesStr = self._getItem('stopMinutes');
      var stopMinutes = JSON.parse(stopMinutesStr).map(function(v) { return Number(v); });

      var timeToNextStop = stopMinutes.map(function(v) { var next = v - minute + lateBy < 0 ? v + 59 - minute + lateBy : v - minute + lateBy - 1; return next; });

      var minutesLeft = _(timeToNextStop).min();

      $timestamp.textContent = minutesLeft + ':' + moment((59 - second) * 1000).format('ss');
      self._setTrafficLight(minutesLeft);
    }, 1000);
  },


  _setTrafficLight: function(minutesLeft) {
    var walkTime = Number(this._getItem('walkTime'));

    if (minutesLeft < walkTime) {
        document.querySelector('.go').style.display = 'block';
    } else {
        document.querySelector('.go').style.display = 'none';
    }

    if (minutesLeft < walkTime + 2) {
        document.querySelector('.set').style.display = 'block';
    } else {
        document.querySelector('.set').style.display = 'none';
    }

    if (minutesLeft < walkTime + 5) {
        document.querySelector('.ready').style.display = 'block';
    } else {
        document.querySelector('.ready').style.display = 'none';
    }

  },

  _updateElement: function(className, textContent) {
    var $element = document.querySelector('.' + className);
    $element.textContent = textContent;
  },

  _setItem: function(item, value) {
    localStorage.setItem(item, value);
  },

  _getItem: function(item) {
    return localStorage.getItem(item);
  }

});

})(window);
