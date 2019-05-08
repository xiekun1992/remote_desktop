const {ipcRenderer, desktopCapturer} = require('electron');
const RTC = require('../rtc');

let rtcConnection, targetUser, userList = [];
// 初始化rtc连接
rtcConnection = new RTC();
rtcConnection.init(function(candidate) {
  send({
    type: 'candidate',
    candidate: candidate
  });
});
ipcRenderer.on('ws-handle', (event, args) => {
  handler(args)
})
function handler(message) {
  let data = JSON.parse(message.data);
  console.log(data)
  switch(data.type) {
    case 'login':
      break;
    case 'serialNumber':
      sn.innerText = data.data;
      break;
    case 'users': 
      let html = '';
      userList = data.list;
      data.list && data.list.forEach((item, i) => {
          html += `<li><a href="javascript:call(${i})">${item.name}</a></li>`;
          if (item.name == targetUser) {
            ipcRenderer.send('change-user', item);
          }
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
  ipcRenderer.send('ws-send', message);
}
function call(index) {
  if (userList[index]) {
    let name = userList[index].name;
    targetUser = name;
    // 打开视频窗口
    ipcRenderer.send('open-control-window', userList[index]);
  }
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
              cursor: 'never',
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