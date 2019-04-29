module.exports = class RTC {
  constructor() {
    this.configuration = {
      'iceServers': [
        {url: 'stun:stun.freeswitch.org'}
      ]
    };
    this.dataChannelOptions = {
      // reliable: true
      reliable: false
    };
    this.dataChannel = null;
    this.connection = null;
  }
  init(fn, videoEl) {
    console.log('init')
    return new Promise((resolve, reject) => {
      this.connection = new RTCPeerConnection(this.configuration);
      // this.connection.onconnectionstatechange = () => {
      //   console.log(this.connection.connectionState)
      //   switch(this.connection.connectionState) {
      //     case "connected":
      //       // The connection has become fully connected
      //       resolve(true);
      //       break;
      //     case "disconnected":
      //       resolve(false);
      //       break;
      //     case "failed":
      //       reject();
      //       // One or more transports has terminated unexpectedly or in an error
      //       break;
      //     case "closed":
      //       reject();
      //       // The connection has been closed
      //       break;
      //   }
      // }
      this.connection.onaddstream = (e) => {
        videoEl && (videoEl.srcObject = e.stream);
      };
      this.connection.onicecandidate = (event) => {
        if (event.candidate) {
          fn && fn(event.candidate);
        }
      }
      resolve()
    });
  }
  addStream(stream) {
    stream && this.connection.addStream(stream);
  }
  createOffer() {
    return new Promise((resolve, reject) => {
      this.connection.createOffer((offer) => {
        this.connection.setLocalDescription(offer);
        resolve(offer);
      }, (error) => {
        // alert('An error has occurred');
        reject(error);
      });
    });
  }
  setRemoteOffer(offer) {
    this.connection.setRemoteDescription(new RTCSessionDescription(offer));
  }
  createAnswer() {
    return new Promise((resolve, reject) => {
      this.connection.createAnswer((answer) => {
        this.connection.setLocalDescription(answer);
        resolve(answer);
      }, (error) => {
        reject(error);
      });
    });
  }
  setRemoteAnswer(answer) {
    this.connection.setRemoteDescription(new RTCSessionDescription(answer));
  }
  setCandidate(candidate) {
    this.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  close() {
    this.connection.close();
    this.connection.onicecandidate = null;
    this.connection.onaddstream = null;
  }
  setDataChannel() {
    this.connection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.dataChannel.onopen = (event) => {
        // dataChannel.send('Hi back!');
      }
      this.dataChannel.onmessage = (event) => {
        // mouseHandler(JSON.parse(event.data));
      }
      this.dataChannel.onerror = (error) => {
      };
      this.dataChannel.onclose = () => {
      }
    }
  }
  createDataChannel() {
    this.dataChannel = this.connection.createDataChannel('myLabel', this.dataChannelOptions);
    this.dataChannel.onerror = (error) => {

    };
    this.dataChannel.onmessage = (event) => {
      // mouseHandler(JSON.parse(event.data));
    };
    this.dataChannel.onopen = () => {
      // dataChannel.send(`${name} has connected.`);
    };
    this.dataChannel.onclose = () => {
    }
  }
}