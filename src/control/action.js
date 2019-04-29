robot = require('robotjs');
  screenSize = robot.getScreenSize();

function openDataChannel() {
    var dataChannelOptions = {
      reliable: true
    };
    yourConnection.ondatachannel = function(event) {
      dataChannel = event.channel;
      dataChannel.onopen = function(event) {
        // dataChannel.send('Hi back!');
      }
      dataChannel.onmessage = function(event) {
        console.log('Got Data Channel Message:', event.data);
        received.innerHTML += `recv: ${event.data}<br/>`;
        received.scrollTop = received.scrollHeight;
        mouseHandler(JSON.parse(event.data));
      }
      dataChannel.onerror = function(error) {
        console.log('Data Channel Error', error);
      };
      dataChannel.onclose = function() {
        console.log('The Data Channel is Closed');
      }
    }
  
    dataChannel = yourConnection.createDataChannel('myLabel', dataChannelOptions);
    dataChannel.onerror = function(error) {
      console.log('Data Channel Error', error);
    };
    dataChannel.onmessage = function(event) {
      console.log('Got Data Channel Message:', event.data);
      received.innerHTML += `recv: ${event.data}<br/>`;
      received.scrollTop = received.scrollHeight;
      mouseHandler(JSON.parse(event.data));
    };
    dataChannel.onopen = function() {
      // dataChannel.send(`${name} has connected.`);
    };
    dataChannel.onclose = function() {
      console.log('The Data Channel is Closed');
    }
  }
  sendButton.addEventListener('click', function(event) {
    var val = message.value;
    received.innerHTML += `send: ${val}<br/>`;
    received.scrollTop = received.scrollHeight;
    // dataChannel.send(val);
  });
  function mouseHandler(action) {
    switch(action.type) {
      case 'move': {
          var screenX = screenSize.width * action.screenX / action.width, 
              screenY = screenSize.height * action.screenY / action.height;
  
          robot.moveMouse(screenX, screenY);
        }; break;
      case 'click': {
          var button = 'left';
          switch (action.button) {
            case 'left': button = 'left'; break;
            case 'middle': button = 'middle'; break;
            case 'right': button = 'right'; break;
          }
          if (action.double == 'true') {
            robot.mouseClick(button, true);
          } else {
            robot.mouseClick(button, false);
          }
        }; break;
      case 'scroll': {
          var x = 1 * (+action.x / Math.abs(+action.x));
          var y = 1 * (+action.y / Math.abs(+action.y));
          robot.scrollMouse(x, y);
        }; break;
      case 'down': {
        robot.mouseToggle('down');
        }; break;
      case 'up': {
        robot.mouseToggle('up');
        }; break;
      // key
      case 'tap': {
          if (action.modifier) {
            robot.keyTap(action.key, action.modifier.split(','));
          } else {
            robot.keyTap(action.key);
          }
        }; break;
    }
  }