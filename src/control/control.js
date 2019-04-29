function sendData(params) {
  rtcConnection && rtcConnection.sendData(params);
}
let width, height, offsetLeft, offsetTop;
let main = video;
// 调整容器元素的大小
function resize() {
  let delta = window.innerHeight * 16 - window.innerWidth * 9;
  if (delta == 0) {
    height = window.innerHeight;
    width = window.innerWidth;
  } else if (delta > 0) {
    width = window.innerWidth;
    height = Math.round(window.innerWidth * 9 / 16);
  } else {
    height = window.innerHeight;
    width = Math.round(window.innerHeight * 16 / 9);
  }
  //mainBg.style.height = 
  main.style.height = height + 'px';
  //mainBg.style.width = 
  main.style.width = width + 'px';
  offsetLeft = (window.innerWidth - width) / 2;
  offsetTop = (window.innerHeight - height) / 2;
}
resize();
window.onresize = resize;
main.oncontextmenu = function() {
  // console.log('oncontextmenu');
  sendData({
    type: 'click',
    button: 'right',
    double: false
  })
}
// main.onclick = function(e) {
//   console.log(e)
//   sendData({
//     type: 'click',
//     button: 'left',
//     double: false
//   })
// }
main.onmousewheel = function(e) {
  console.log(e)
  sendData({
    type: 'scroll',
    x: e.wheelDeltaX,
    y: e.wheelDeltaY
  })
}
let mousebutton = 0;
main.onmousedown = function(e) {
  mousebutton = e.button;
  if (e.button == 0) {
    sendData({
      type: 'down',
      screenX: e.pageX - offsetLeft,
      screenY: e.pageY - offsetTop,
      width,
      height
    });
  }
}
main.onmousemove = function(e) {
  sendData({
    type: 'move',
    screenX: e.pageX - offsetLeft,
    screenY: e.pageY - offsetTop,
    width,
    height
  });
}
main.onmouseup = function(e) {
  // let button = '';
  // if (e.button == 1) {
  //     button = 'middle';
  // } else if (e.button == 2) {
  //     button = 'right';
  // }
  if (mousebutton != 0) {
    // sendData({
    //   type: 'click',
    //   button,
    //   double: false
    // })
  } else {
    sendData({
      type: 'up',
      screenX: e.pageX - offsetLeft,
      screenY: e.pageY - offsetTop,
      width,
      height
    });
  }
}
window.onkeydown = function(e) {
  console.log(e)
  if (['Shift', 'Alt', 'Control'].indexOf(e.key) > -1) {
    return;
  }
  let modifiers = [];
  e.altKey && modifiers.push('alt');
  e.ctrlKey && modifiers.push('control');
  e.shiftKey && modifiers.push('shift');
  key = e.key;
  if (key == 'ArrowUp') {
    key = 'up';
  }
  if (key == 'ArrowDown') {
    key = 'down';
  }
  if (key == 'ArrowRight') {
    key = 'right';
  }
  if (key == 'ArrowLeft') {
    key = 'left';
  }
  if (key == ' ') {
    key = 'space';
  }
  sendData({
    type: 'tap',
    key: key.toLowerCase(),
    modifier: modifiers.join()
  })
}