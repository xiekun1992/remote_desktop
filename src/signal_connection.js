const WebSocket = require('ws');

class SignalConnection {
  constructor() {
    this.connection = null;
    this.handler = null;
  }
  connect(ip, port) {
    return new Promise((resolve, reject) => {
      this.connection = new WebSocket(`wss://${ip}:${port}`);
      this.connection.onopen = () => {
        console.log('signal server connected');
        resolve(this);
      };
      this.connection.onmessage = (message) => {
        console.log(`Got message ${message.data}`);
        this.handler && this.handler(message);
      }
      this.connection.onerror = (err) => {
        console.log('Get error', err);
        reject(err);
      };
    });
  }
  message(callback) {
    this.handler = callback;
    return this;
  }
  send(message) {
    if (this.connection) {
      this.connection.send(JSON.stringify(message));
    }
    return this;
  }
}

module.exports = SignalConnection;