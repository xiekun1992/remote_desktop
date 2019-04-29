const si = require('systeminformation');
const {ipcRenderer, desktopCapturer} = require('electron');
const targetUser = require('electron').remote.getGlobal('targetUser');
const SignalConnection = require('../signal_connection');
const RTC = require('../rtc');

const connection = new SignalConnection().connect('192.168.1.101', 8080);
let signalConn, serialNum, rtcConnection;
Promise
    .all([connection, si.diskLayout()])
    .then(([conn, data]) => {
        signalConn = conn;
        signalConn.message(handler);
        serialNum = data[0].serialNum;
        //sn.innerText = serialNum;
        signalConn.send({
            type: 'login',
            name: serialNum
        });
        // 初始化rtc连接
        rtcConnection = new RTC();
        rtcConnection.init(function(candidate) {
          send({
            type: 'candidate',
            candidate: candidate
          });
        }, video);
        rtcConnection.createOffer().then(offer => {
          send({
            type: 'offer',
            offer: offer
          });
        })
    })
    .catch(console.log);
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
      // let html = '';
      // data.list && data.list.forEach((item) => {
      //     html += `<li><a href="javascript:call('${item}')">${item}</a></li>`;
      // });
      // ul.innerHTML = html;
      break;
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
    case 'leave': rtcConnection.close(); break;
  }
}
function send(message) {
    if (targetUser) {
        message.name = targetUser;
    }
    signalConn.send(message);
}