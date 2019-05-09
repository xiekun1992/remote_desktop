const dgram = require('dgram');
const server = dgram.createSocket({
  type: 'udp4',
  sendBufferSize: 1024 * 1024 * 64
});

const { desktopCapturer } = require('electron')
var robot = require("robotjs");

//Get a 100x100 screen capture starting at 0, 0.
var img = robot.screen.capture(0, 0, 1920, 1080);
console.log(img)

let counter = 0;
server.on('error', err => {
  console.log(`server error:\n${err.stack}`)
  server.close();
})
server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
})
server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
})
server.bind(41235, '192.168.1.104');
// const message = Buffer.from('Some bytes');
// setInterval(() => {
//   server.send(message, 41234, '13.231.201.110', (err) => {
//     err && console.log(err)
//   });
// //   server.send(message, 41235, '36.36.88.208', (err) => {
// //     err && console.log(err)
// //   });
//   server.send(message, 41233, '36.36.88.208', (err, bytes) => {
//     console.log(err, bytes)
//   });
// }, 3000)


desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
  if (error) throw error
  console.log(sources)
  for (let i = 0; i < sources.length; ++i) {
    // if (sources[i].name === 'sender') {
    if (sources[i].id === 'screen:0:0') {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[i].id,
          }
        }
      }).then((stream) => handleStream(stream))
        .catch((e) => handleError(e))
      return
    }
  }
})
let rec, mediaSource;
let mimeCodec = 'video/webm; codecs="vp9"'
var sourceBuffer

function handleStream (stream) {
  // const video = document.querySelector('video')
//   video.srcObject = stream
  // video.onloadedmetadata = (e) => video.play()
  // mediaSource = new MediaSource();
  // video.src = URL.createObjectURL(mediaSource);

  // mediaSource.onsourceopen = function() {
  //   sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  //   sourceBuffer.addEventListener('updateend', function (_) {
  //     // mediaSource.endOfStream();
  //     // video.play();
  //     console.log(mediaSource.readyState); // ended
  //   });

  // }
  rec = new MediaRecorder(stream, {
    mimeType: mimeCodec
  });
  rec.ondataavailable = function(e) {
    let blob = e.data;
    var fileReader = new FileReader();
    fileReader.onload = function(event) {
      let buf = Buffer.from(event.target.result);
      // sourceBuffer.appendBuffer(buf);
      sendPacket(buf)
    };
    fileReader.readAsArrayBuffer(blob);
  }
  rec.start(5);
  
}

function handleError (e) {
  console.log(e)
}
// https://nodejs.org/dist/latest-v8.x/docs/api/dgram.html#dgram_socket_send_msg_offset_length_port_address_callback
let mtu = 65507
function sendPacket(buf) {
  let tmpbuf = buf.slice(0, mtu);
  server.send(tmpbuf, 41234, '192.168.1.104', (err, bytes) => {
    err && console.log(err, bytes)
  });
  if (buf.length > mtu) {
    sendPacket(buf.slice(mtu));
  }
}