const { app, BrowserWindow, ipcMain } = require('electron')
// const server = require('./server');

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win, cwin, tmpwin;

global.targetUser = null;

function createWindow (width = 200, height = 100) {
  // 创建浏览器窗口。
  win = new BrowserWindow({ width: 400, height: 300 })
  // 然后加载应用的 index.html。
  // server.launch().then(() => {
    win.loadFile('./src/index/index.html')
  //   win.loadURL('https://127.0.0.1:8080/')
  // });
  // 打开开发者工具
  // win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});

ipcMain.on('open-control-window', (event, args) => {
  // console.log(args)
  global.targetUser = args;
  cwin = new BrowserWindow({ width: 800, height: 600 })
  cwin.loadFile('./src/control/index.html')
  tmpwin = new BrowserWindow({ x: -1000, y: -1000, width: 10, height: 10, title: 'xremote-tmp-window', frame: false, skipTaskbar: true })
  cwin.on('closed', () => {
    cwin = null
    tmpwin.destroy();
  })
  tmpwin.on('closed', () => {
    tmpwin = null
  })
});

exports.setGlobal = (key, value) => {
  global[key] = value;
}