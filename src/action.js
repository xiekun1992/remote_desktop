const robot = require('robotjs');

module.exports = class Actions {
  constructor() {
    this.screenSize = robot.getScreenSize();
  }
  handleActions(action) {
    switch(action.type) {
      case 'move': {
          var screenX = this.screenSize.width * action.screenX / action.width, 
              screenY = this.screenSize.height * action.screenY / action.height;
  
          robot.moveMouse(screenX, screenY);
        }; break;
      case 'click': {
          var button = 'left';
          switch (action.button) {
            case 'left': button = 'left'; break;
            case 'middle': button = 'middle'; break;
            case 'right': button = 'right'; break;
          }
          if (action.double == 'true') {
            robot.mouseClick(button, true);
          } else {
            robot.mouseClick(button, false);
          }
        }; break;
      case 'scroll': {
          var x = 1 * (+action.x / Math.abs(+action.x));
          var y = 1 * (+action.y / Math.abs(+action.y));
          robot.scrollMouse(x, y);
        }; break;
      case 'down': {
        robot.mouseToggle('down');
        }; break;
      case 'up': {
        robot.mouseToggle('up');
        }; break;
      // key
      case 'tap': {
          if (action.modifier) {
            robot.keyTap(action.key, action.modifier.split(','));
          } else {
            robot.keyTap(action.key);
          }
        }; break;
    }
  }

}