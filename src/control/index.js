const {ipcRenderer, desktopCapturer} = require('electron');
const RTC = require('../rtc');

let rtcConnection;
captureScreen().then(stream => {
  // 初始化rtc连接
  rtcConnection = new RTC();
  rtcConnection.init(function(candidate) {
    send({
      type: 'candidate',
      candidate: candidate
    });
  }, video, stream).then(() => {
    console.log('init end')
    // setTimeout(() => {
      rtcConnection.createOffer().then(offer => {
        send({
          type: 'offer',
          offer: offer
        });
      })
    // }, 3000);
  });
})
ipcRenderer.on('ws-handle', (event, args) => {
  handler(args)
})
function handler(message) {
  const data = JSON.parse(message.data);
  switch(data.type) {
    case 'offer':
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
function captureScreen() {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
      if (error) reject(error);
      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].name === "xremote-tmp-window") { // 获取主显示器的图像
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