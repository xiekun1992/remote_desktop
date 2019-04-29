const si = require('systeminformation');
const {ipcRenderer, desktopCapturer} = require('electron');
const SignalConnection = require('../signal_connection');
const RTC = require('../rtc');

// const connection = new SignalConnection().connect('192.168.3.31', 8080);
const connection = new SignalConnection().connect('13.231.201.110', 8080);
let signalConn, serialNum, rtcConnection, targetUser;
Promise
    .all([connection, si.diskLayout()])
    .then(([conn, data]) => {
        signalConn = conn;
        signalConn.message(handler);
        serialNum = data[0].serialNum;
        sn.innerText = serialNum;
        signalConn.send({
            type: 'login',
            name: serialNum
        });
    })
    .catch(console.log);
// 初始化rtc连接
rtcConnection = new RTC();
rtcConnection.init(function(candidate) {
  send({
    type: 'candidate',
    candidate: candidate
  });
});
function handler(message) {
  const data = JSON.parse(message.data);
  switch(data.type) {
    case 'login':
      // signalConn.send({
      //     name: serialNum,
      //     type: 'users'
      // });
      break;
    case 'users': 
      let html = '';
      data.list && data.list.forEach((item) => {
          html += `<li><a href="javascript:call('${item}')">${item}</a></li>`;
      });
      ul.innerHTML = html;
      break;
    case 'offer':
      targetUser = data.name;
      rtcConnection.setRemoteOffer(data.offer);
      rtcConnection.createAnswer().then(answer => {
        send({
          type: 'answer',
          answer: answer
        });
      }).then(() => {
        captureScreen().then((stream) => {
          rtcConnection.addStream(stream);
        })
        .catch((error) => {
          console.log(error);
        });
      });
      break;
    case 'answer': rtcConnection.setRemoteAnswer(data.answer); break;
    case 'candidate': rtcConnection.setCandidate(data.candidate); break;
    // case 'leave': rtcConnection.close(); break;
  }
}
function send(message) {
    if (targetUser) {
        message.name = targetUser;
    }
    signalConn.send(message);
}
function call(name) {
    targetUser = name;
    // 打开视频窗口
    ipcRenderer.send('open-control-window', targetUser);
}
function captureScreen() {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
      if (error) reject(error);
      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].id === "screen:0:0") { // 获取主显示器的图像
          resolve(navigator.mediaDevices.getUserMedia({
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
              }
            }
          }));
        }
      }
    })
  })
}