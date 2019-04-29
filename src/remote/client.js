const { desktopCapturer } = require('electron')
var robot, screenSize;
try {
  robot = require('robotjs');
  screenSize = robot.getScreenSize();
  robot.keyTap('up');
} catch(e) {
  alert(e);
}

var name, connectedUser, isMaster = false;
var connection = new WebSocket('wss://192.168.1.101:8080');

connection.onopen = function() {
  console.log('Connected');
};
connection.onmessage = function(message) {
  console.log(`Got message ${message.data}`);
  var data = JSON.parse(message.data);
  switch(data.type) {
    case 'login':
      onLogin(data.success);
      break;
    case 'offer':
      isMaster = false;
      onOffer(data.offer, data.name);
      break;
    case 'answer':
      onAnswer(data.answer);
      break;
    case 'candidate':
      onCandidate(data.candidate);
      break;
    case 'leave':
      onLeave();
      break;
    default: break;
  }
}
connection.onerror = function(err) {
  console.log('Get error', err);
};

function send(message) {
  if (connectedUser) {
    message.name = connectedUser;
  }
  connection.send(JSON.stringify(message));
}

function hasUserMedia() {
  navigator.getUserMedia = 
    navigator.getUserMedia || 
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || 
    navigator.msGetUserMedia;
  return !!navigator.getUserMedia;
}
function hasRTCPeerConnection() {
  window.RTCPeerConnection = window.RTCPeerConnection || 
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection || 
    window.msRTCPeerConnection;
    return !!window.RTCPeerConnection;
}

var loginPage = document.querySelector('#login-page'),
  usernameInput = document.querySelector('#username'),
  loginButton = document.querySelector('#login'),
  callPage = document.querySelector('#call-page'),
  theirUsernameInput = document.querySelector('#their-username'),
  callButton = document.querySelector('#call'),
  hangUpButton = document.querySelector('#hang-up');

callPage.style.display = 'none';
loginButton.addEventListener('click', function(event) {
  name = usernameInput.value;
  // alert(name)
  if (name.length > 0) {
    send({
      type: 'login',
      name: name
    });
  }
  // alert('login in')
});
callButton.addEventListener('click', function(event) {
  isMaster = true;
  var theirUsername = theirUsernameInput.value;
  if (theirUsername.length > 0) {
    // startConnection();
    startPeerConnection(theirUsername);
    loginPage.style.display = 'none';
    callPage.style.display = 'block';
  }
});
hangUpButton.addEventListener('click', function() {
  send({
    type: 'leave'
  });
  onLeave();
});
function onLogin(success) {
  if (success === false) {
    alert('Login unsuccessful, please try a different name.');
  } else {
    // loginPage.style.display = 'none';
    // callPage.style.display = 'block';
    startConnection();
  }
}

var yourVideo = document.querySelector('#yours'),
  theirVideo = document.querySelector('#theirs'),
  yourConnection, connectedUser, stream, dataChannel;

function startConnection() {
  if (!isMaster) {
    if (hasUserMedia()) {
      desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
        if (error) throw error
        for (let i = 0; i < sources.length; ++i) {
          if (sources[i].name === "Entire screen") {
            navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sources[i].id,
                  minFrameRate: 18,
                  minWidth: screen.width,
                  maxWidth: screen.width,
                  minHeight: screen.height,
                  maxHeight: screen.height
                },
                // optional: [  
                //   { width: { max: screen.width }},
                //   { frameRate: 18 }
                // ]
              }
            }).then(function(myStream) {
                stream = myStream;
                // yourVideo.src = window.URL.createObjectURL(stream); 存在一些问题
                yourVideo.srcObject = myStream;
                if (hasRTCPeerConnection()) {
                  setupPeerConnection(stream);
                } else {
                  alert('Sorry, your browser does not support WebRTC.');
                }
              })
              .catch(function(error) {
                  console.log(error);
                  alert(error);
                })
            return
          }
        }
      })
    } else {
      alert('Sorry, your browser does not support WebRTC.');
    }
  } else {
    if (hasRTCPeerConnection()) {
      setupPeerConnection(null);
    } else {
      alert('Sorry, your browser does not support WebRTC.');
    }
  }
}
var receiveChannel
function setupPeerConnection(stream) {
  var configuration = {
    'iceServers': [
      {url: 'stun:stun.freeswitch.org'}
    ]
  };
  yourConnection = new RTCPeerConnection(configuration);
  if (isMaster) {
    yourConnection.addStream(new MediaStream());
  } else {
    stream && yourConnection.addStream(stream);
  }
  yourConnection.onaddstream = function(e) {
    // theirVideo.src = window.URL.createObjectURL(e.stream);
    theirVideo.srcObject = e.stream;
  };
  yourConnection.onicecandidate = function(event) {
    if (event.candidate) {
      send({
        type: 'candidate',
        candidate: event.candidate
      });
    }
  }
  openDataChannel();
  // startPeerConnection(theirUsernameInput.value);
}
function startPeerConnection(user) {
  connectedUser = user;
  yourConnection.createOffer(function(offer) {
    send({
      type: 'offer',
      offer: offer
    });
    yourConnection.setLocalDescription(offer);
  }, function(error) {
    alert('An error has occurred');
  });
}
function onOffer(offer, name) {
  if (!isMaster) {
    loginPage.style.display = 'none';
    callPage.style.display = 'block';
  }
  connectedUser = name;
  yourConnection.setRemoteDescription(new RTCSessionDescription(offer));
  yourConnection.createAnswer(function(answer) {
    yourConnection.setLocalDescription(answer);
    send({
      type: 'answer',
      answer: answer
    });
  }, function(error) {
    alert('An error has occurred');
  });
}

function onAnswer(answer) {
  yourConnection.setRemoteDescription(new RTCSessionDescription(answer));
}
function onCandidate(candidate) {
  yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
function onLeave() {
  connectedUser = null;
  theirVideo.src = null;
  yourConnection.close();
  yourConnection.onicecandidate = null;
  yourConnection.onaddstream = null;
  setupPeerConnection(stream);
}
// 有些情况会导致WebRTC连接失败，如技术不支持，防火墙阻拦，没有足够的带宽进行视频通话

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