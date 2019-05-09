const dgram = require('dgram');
const server = dgram.createSocket({
  type: 'udp4',
  recvBufferSize: 1024 * 1024 * 64
});


let mediaSource;
let mimeCodec = 'video/webm; codecs="vp9"'
var sourceBuffer
function createSource () {
  mediaSource = new MediaSource();
  video.src = URL.createObjectURL(mediaSource);
  video.onloadedmetadata = (e) => video.play()
  
  mediaSource.onsourceopen = function() {
    sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    sourceBuffer.addEventListener('updateend', function (_) {
      // mediaSource.endOfStream();
      // video.play();
      console.log(mediaSource.readyState); // ended
      if (mediaSource.readyState == 'ended' || mediaSource.readyState == 'closed') {
        createSource();
      }
    });
  
  }
}
createSource();

server.on('error', err => {
  console.log(`server error:\n${err.stack}`)
  server.close();
})
server.on('message', (msg, rinfo) => {
  // console.log(`server got: from ${rinfo.address}:${rinfo.port}`);
  if (mediaSource.readyState == 'open') {
    let buf = msg;
    let arraybuffer = Uint8Array.from(buf).buffer;
    sourceBuffer.appendBuffer(arraybuffer);
  }
})
server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
})
server.bind(41234, '192.168.1.104');
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
// video.onloadedmetadata = (e) => video.play()
