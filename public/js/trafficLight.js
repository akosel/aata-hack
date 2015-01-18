var socket = io.connect(window.location.origin);

socket.on('busData', function(json) {
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
  
  var updateValues = ['adherence', 'direction'];

  _(updateValues).each(function(val) {
    updateElement(val, bus[val]); 
  });

});

function getLateBy(adherence) {
  var lateBy = Number(adherence[0]) || 0;

  if (adherence.match('ahead')) {
      lateBy = lateBy * -1;
  }
  return lateBy;
}

function updateElement(className, textContent) {
  var $element = document.querySelector('.' + className);
  $element.textContent = textContent;
}

function startClock() {
  var lateBy = 0;
  socket.on('busData', function(data) { 
    lateBy = getLateBy(data[0].adherence);
  });
  setInterval(function() {
    var fmt = 'HH:mm';
    var hour = moment().hour();
    var minute = moment().minute();
    var second = moment().second();
    var $timestamp = document.querySelector('.timestamp');
    var stopMinutes = JSON.parse(getStopMinutes()).map(function(v) { return Number(v); });

    var timeToNextStop = stopMinutes.map(function(v) { var next = v - minute + lateBy < 0 ? v + 59 - minute + lateBy : v - minute + lateBy - 1; return next; });

    var minutesLeft = _(timeToNextStop).min();

    $timestamp.textContent = minutesLeft + ':' + moment((59 - second) * 1000).format('ss');
    setTrafficLight(minutesLeft);
  }, 1000);
}

function setTrafficLight(minutesLeft) {
  var walkTime = Number(getWalkTime());

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

}

function addInput(buttonText, type, isLimit) {
  if ((document.querySelector('.' + type) && isLimit)) {
    return;
  }
  
  var $notifications = document.querySelector('#notifications')
  var $input = document.createElement('input');
  var $button = document.createElement('button');
  $button.textContent = buttonText;

  $input.className = type;
  $input.type = 'number';
  $button.className = type;

  $notifications.appendChild($input);
  $notifications.appendChild($button);

  if (type === 'stopMinutes') {
    $button.onclick = function(e) {
      if (!$input.value) {
          return;
      }
      var stopMinutes = JSON.parse(getStopMinutes());
          
      console.log(stopMinutes);
      if (stopMinutes) {
          stopMinutes.push($input.value);
      } else {
          stopMinutes = [$input.value];
      }

      setStopMinutes(JSON.stringify(stopMinutes));

      $button.remove();
      $input.remove();
      pageSetup();
    };
  } else if (type === 'walkTime') {
    $button.onclick = function(e) {
      if (!$input.value) {
          return;
      }

      setWalkTime($input.value);

      $button.remove();
      $input.remove();
      pageSetup();
    }
  } else if (type === 'route') {
    $button.onclick = function(e) {
      if (!$input.value) {
          return;
      }

      setRoute($input.value);

      $button.remove();
      $input.remove();
      pageSetup();
    }
  }
}

function pageSetup() {
  if (!getStopMinutes()) {
    document.querySelector('header').style.display = 'block';
    addInput('Set the first stop minute', 'stopMinutes', false);
    addInput('Set the second stop minute (optional)', 'stopMinutes', false);
  }
  if (!getWalkTime()) {
    document.querySelector('header').style.display = 'block';
    addInput('Set walk time', 'walkTime', true);
  }
  if (!getRoute()) {
    document.querySelector('header').style.display = 'block';
    addInput('Set route', 'route', true);
  }
  if (getWalkTime() && getStopMinutes() && getRoute()) {
    document.querySelector('header').style.display = 'none';
    startClock();
    socket.emit('route', getRoute());

    $reset = document.querySelector('.controls a');
    $reset.onclick = function (e) {
      e.preventDefault();

      localStorage.clear();
      pageSetup();
    };
  }
}

function setStopMinutes(minutes) {
  localStorage.setItem('stopMinutes', minutes); 
}

function setWalkTime(walkTime) {
  localStorage.setItem('walkTime', walkTime); 
}

function setRoute(route) {
  localStorage.setItem('route', route); 
  socket.emit('route', route);
}

function getStopMinutes() {
  return localStorage.getItem('stopMinutes'); 
}

function getWalkTime() {
  return localStorage.getItem('walkTime'); 
}

function getRoute() {
  return localStorage.getItem('route'); 
}

pageSetup();
