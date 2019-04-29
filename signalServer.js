const server = require('./server');
server.launch().then(() => {
  console.log('signal server running...');
});