
var https = require('https');
var fs = require('fs');
var path = require('path');
var WebSocketServer = require('ws').Server;

var cert = fs.readFileSync(path.resolve(__dirname, 'src/assets', 'cert.pem'));
var key = fs.readFileSync(path.resolve(__dirname, 'src/assets', 'key.pem'));
var options = {
  key,
  cert
};
function launch() {
  return new Promise((resolve) => {

    var server = https.createServer(options, function(req, res) {
      res.end('websocket server');
      // console.log(req.url);
      // if (req.url == '/') {
      //   var html = fs.readFileSync(path.resolve(__dirname, 'index.html'));
      //   res.setHeader('content-type', 'text/html');
      //   res.writeHead(200);
      //   res.end(html);
      // } else {
      //   var html = fs.readFileSync(path.resolve(__dirname, req.url.slice(1)));
      //   res.setHeader('content-type', 'application/json');
      //   res.writeHead(200);
      //   res.end(html);
      // }
    }).listen(8080);
    
    var wss = new WebSocketServer({server: server}),
      users = {};
    
    wss.on('connection', connection => {
      console.log(connection._socket.remoteAddress, connection._socket.remotePort);
      connection.on('message', message => {
        var data;
        try {
          data = JSON.parse(message);
        } catch(e) {
          console.log('Error parsing JSON');
          data = {};
        }
        switch(data.type) {
          // case 'users':
          //   var conn = users[data.name];
          //   if (conn != null) {
          //     sendTo(conn, {
          //       type: 'users',
          //       list: Object.keys(users)
          //     });
          //   }
          //   break;
          case 'login': 
            console.log('User logged in as', data.name);
            // if (users[data.name]) { // 已经登陆了
            //   sendTo(connection, {
            //     type: 'login',
            //     success: false
            //   });
            // } else { // 第一次登陆
              users[data.name] = connection;
              connection.name = data.name;
              connection.screen = data.screen;
              sendTo(connection, {
                type: 'login',
                success: true
              });
              notifyOthers(users);
            // }
            break;
          case 'resize': 
            users[data.name] = connection;
            connection.name = data.name;
            connection.screen = data.screen;
            notifyOthers(users);
            break;
          case 'offer': 
            console.log('Sending offer to', data.name);
            var conn = users[data.name];
            if (conn != null) {
              connection.otherName = data.name;
              sendTo(conn, {
                type: 'offer',
                offer: data.offer,
                name: connection.name
              });
            }
            break;
          case 'answer':
            console.log('Sending answer to', data.name);
            var conn = users[data.name];
            if (conn != null) {
              connection.otherName = data.name;
              sendTo(conn, {
                type: 'answer',
                answer: data.answer
              });
            }
            break;
          case 'candidate':
            console.log('Sending candidate to', data.name);
            var conn = users[data.name];
            if (conn != null) {
              sendTo(conn, {
                type: 'candidate',
                candidate: data.candidate
              });
            }
            break;
          case 'leave':
            console.log('Disconnecting user from', data.name);
            var conn = users[data.name];
            conn.otherName = null;
            if (conn != null) {
              sendTo(conn, {
                type: 'leave'
              });
            }
            break;
          default: 
            sendTo(connection, {
              type: 'error',
              message: `Unrecognized command: ${data.type}`
            });
        }
      });
      connection.on('close', () => {
        if (connection.name) {
          delete users[connection.name];
          if (connection.otherName) {
            console.log('Disconnecting user from', connection.otherName);
            var conn = users[connection.otherName];
            conn.otherName = null;
            if (conn != null) {
              sendTo(conn, {
                type: 'leave'
              });
            }
          }
        }
      });
    });
    
    function sendTo(conn, message) {
      conn.send(JSON.stringify(message));
    }
    
    function notifyOthers(users) {
      // 通知其他用户
      for (let name in users) {
        let userArr = [];
        for (let key in users) {
          if (key != name) {
            userArr.push({
              name: users[key].name, 
              screen: users[key].screen 
            });
          }
        }
        let conn = users[name];
        if (conn) {
          sendTo(conn, {
            type: 'users',
            list: userArr
          });
        }
      }
    }
    wss.on('listening', () => {
      console.log('Server started...');
      resolve();
    });
  });
}


module.exports = {
  launch
}