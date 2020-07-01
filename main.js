const { app, BrowserWindow, Tray, dialog, ipcRenderer } = require('electron')
const electron = require('electron')
const { shell } = require('electron')
const { clipboard } = require('electron')
const qr = require('qr-image')
const Store = require('electron-store')
var fs = require('fs');
var store = new Store()
var port = '9998'
const username = require('os').userInfo().username
const file_rec = 'C:/Users/' + username + '/Downloads/Airsend'
const file_send = 'C:/Users/' + username + '/Downloads/Airsend/send'
if (!store.get('folder')) {
  store.set('folder', file_rec)
  fs.access(file_rec, err => {
    err ? fs.mkdir(file_rec, errr => {
      console.log(errr)
    }) : console.log('file exsited')
  })
  store.set('autostart', true)
  store.set('autoopen', true)
  store.set('sendpath', file_send)
}
app.FILEPATH = store.get('folder')
app.AUTOSTART = store.get('autostart')
app.AUTOOPEN = store.get('autoopen')
app.SENDPATH = store.get('sendpath')

var path = require('path');
const Menu = electron.Menu

const exeName = path.basename(process.execPath)//开机启动
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
  path: process.execPath,
  args: [
    '--processStart', `"${exeName}"`,
  ]
})
function clipboardChange() {
  setInterval(() => {
    let clippath = app.SENDPATH + '\\clipboard.txt'
    var cliptxt = clipboard.readText()

    if (!fs.existsSync(clippath)) fs.writeFileSync(clippath, cliptxt)
    var cliplocal = fs.readFileSync(clippath).toString()
    if (cliptxt != cliplocal) {
      console.log('clip changed')
      fs.writeFileSync(clippath, cliptxt)
    }
  }, 100);
}
clipboardChange()

function createWindow() {
  // 创建浏览器窗口
  Menu.setApplicationMenu(null)
  var win = new BrowserWindow({
    width: 530,
    height: 470,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.hide()
  win.setSkipTaskbar(true)
  //win.webContents.openDevTools({mode:'detach'})//打开开发者工具
  const { ipcMain } = require('electron')
  ipcMain.on('app:hide', (e, arg) => {
    win.hide()
    win.setSkipTaskbar(true)
  })
  if (!fs.existsSync(app.SENDPATH)) fs.mkdirSync(app.SENDPATH)
  ipcMain.on('dragstart', (e, filepath) => {
    let filename = filepath.split('\\')[filepath.split('\\').length - 1]
    console.log(filepath, filename)
    console.log(app.SENDPATH)
    if (!fs.existsSync(app.SENDPATH)) fs.mkdirSync(app.SENDPATH)
    fs.copyFile(filepath, app.SENDPATH + '/' + filename, err => {
      if (err) console.log(err)
      else console.log('copy successs at' + app.SENDPATH + '/' + filename)
    })
  })
  // 并且为你的应用加载index.html
  win.loadFile('index.html')
  win.on('close', (e) => {
    win.hide()
    win.setSkipTaskbar(true)
    e.preventDefault()
  })
  var ipaddress = getIp() + ':' + port
  app.ipaddress = ipaddress
  var image = qr.imageSync(ipaddress)
  app.qrimage = image.toString('base64')


  // openExec = exec('node ./server.js', function (error, stdout, stderr) {
  //   if (error) {
  //     console.log(error.stack);
  //     console.log('Error code: ' + error.code);
  //     return;
  //   }
  //   console.log('exec output: ' + stdout);
  // });
  // // clientxx.init(event);
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出', click: () => { win.destroy() } },//在这里有一个真正的退出（这里直接强制退出）
  ])
  tray.setToolTip('Airsend')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => { //这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
    win.isVisible() ? win.hide() : win.show()
    win.isVisible() ? win.setSkipTaskbar(false) : win.setSkipTaskbar(true);
  })

}


// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

//当所有窗口都被关闭后退出
app.on('quit', (e) => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  console.log('exited')
})



app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})




// 您可以把应用程序其他的流程写在在此文件中
// 代码 也可以拆分成几个文件，然后用 require 导入。


const multer = require('multer');
var bodyParser = require('body-parser');
const express = require('express');
var router = express.Router()
const e_app = express()
var e_path = require('path')
const e = require('express')
const { LOADIPHLPAPI } = require('dns')
e_app.use(bodyParser.json());

// 访问静态资源文件 这里是访问所有server目录下的静态资源文件
e_app.use(express.static(e_path.resolve(__dirname, './server')))
e_app.use(express.static('public'));
e_app.use(multer({ dest: e_path.resolve(__dirname, './server') }).array('file'));
e_app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

e_app.use('/get', function (req, res) {
  let filename = req.query.name
  if (!filename) {
    console.log('GET request')
    var filePath = app.SENDPATH;
    fs.readdir(filePath, function (err, results) {
      if (err) throw err;
      if (results.length > 0) {
        var files = [];
        var tags = ''
        results.forEach(function (file) {
          if (fs.statSync(path.join(filePath, file)).isFile() && file != 'clipboard.txt') {
            files.push(file);
            tags += '<a href="/get?name=' + file + '">' + file + '</a><br>'
          }
        })

        let html = '<!DOCTYPE html><html><head></head><body>' + tags + '</body></html>'
        res.send(html)
      } else {
        res.end('no file');
      }
    });
  }
  else {
    let filepath = app.SENDPATH + '/' + filename
    console.log('download start:' + filepath)
    res.download(filepath, filename, function (err) {
      if (err) {
        // 错误处理，注意他可能会部分发送响应
        // 因此请检查好  res.headersSent
      } else {
        // 减少下载验证

      }
    });
  }


})

// e_app.use('/get',function(req,res){
//   res.send('hello')
// })

e_app.get('download/:name', function (req, res) {

})

e_app.post('/', function (req, res, next) {
  var query = req.body;
  console.log(JSON.stringify(req.files))
  fs.readFile(req.files[0].path, function (err, data) {
    if (err) {
      console.log('Error');
    } else {
      var dir_file = app.FILEPATH + '/' + req.files[0].originalname
      console.log(dir_file);
      fs.writeFile(dir_file, data, function (err) {
        var obj = {
          msg: 'upload success',
          filename: req.files[0].originalname
        }
        res.send(JSON.stringify(obj));
        fs.unlink('./server/' + req.files[0].filename, function (err) {
          if (err) {
            console.log(err)
            return false
          } else {
            console.log('del tmp file success')
            return true
          }
        })
        if (req.files[0].originalname == 'clipboard.txt') {//复制剪贴板
          fs.readFile(dir_file, (err, data) => {
            if (!err) {
              clipboard.writeText(data.toString())
              console.log('copy:' + data)

            }
            else console.log(err)
          })
        }
        else if (req.files[0].originalname == 'url.txt') {//打开链接
          fs.readFile(dir_file, (err, data) => {
            if (!err) {
              shell.openExternal(data.toString())
              console.log('url:' + data)
            }
            else console.log(err)
          })

        } else {
          if (app.AUTOOPEN) {//自动打开文件
            shell.openPath(dir_file)
            console.log('file:' + dir_file)
          }
        }

      })

    }
  })


})

//处理请求跨域

e_app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Content-Type", "e_application/json;charset=utf-8");
  res.header("Access-Control-Allow-Headers", "content-type");
  next();
});

e_app.listen(port, function () {
  console.log('express started:' + getIp())

})
function getIp() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }

}