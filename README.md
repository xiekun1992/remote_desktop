# remote_desktop

打包
---
- `npm install`
- `npm run rebuild`根据electron版本重新安装robotjs
- `npx electron-packager .`生成当前平台的程序包

linux下先运行`sudo apt install libxtst-dev -y`否则会报`fatal error: X11/extensions/XTest.h: No such file or directory`的错误，导致`npm run rebuild`失败
