// Modules to control application life and create native browser window
const { app, BrowserWindow, WebContentsView, session } = require('electron')
const path = require('node:path')
const fs = require('fs')

var config = {}

reload = () => { }

const configFilePath = 'config.json';

if (fs.existsSync(configFilePath)) {
  config = require(`./${configFilePath}`);
} else {
  config = {
    "NetInterface": "Wi-Fi",
    "OBS": {
      "Address": "127.0.0.1",
      "Port": 4455,
      "Password": null
    },
    "Castmate": {
      "Address": "127.0.0.1",
      "Port": 8181
    }
  }
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

configFileChangedList = [
  "renderer.js",
  "deck/scripts/script.js",
  "camera/script.js"
]

// Proxy to watch for changes to the config variable
function reloadconfig() {
  reload()
  reloadOBS()
  return true;
}

// Watch for changes to the config file
fs.watch(configFilePath, (eventType, filename) => {
  if (eventType === 'change') {
    try {
      const newConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
      config = newConfig;

      reloadconfig();
    } catch (err) {
    }
  }
});

function getip(interface) {
  const { networkInterfaces } = require('os');

  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  return results[interface] ? results[interface][0] : null;
}

const { OBSWebSocket } = require('obs-websocket-js');
const obsws = new OBSWebSocket();

obsws.connect(`ws://${config.OBS.Address}:${config.OBS.Port}`, config.OBS.Password).then(() => {
  console.log(`Connected to OBS on ${config.OBS.Address}:${config.OBS.Port}`);
}).catch((err) => {
});

reloadOBS = () => {
  obsws.disconnect();
  obsws.connect(`ws://${config.OBS.Address}:${config.OBS.Port}`, config.OBS.Password).then(() => {
    console.log(`Connected to OBS on ${config.OBS.Address}:${config.OBS.Port}`);
  }).catch((err) => {
  }
  );
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#19171c',
      symbolColor: '#efeff1',
      height: 30
    }
  })

  // and load the index.html of the app.
  const view1 = new WebContentsView({ webPreferences: { preload: path.join(__dirname, "preload.js"), nodeIntegration: true } })

  // Toutes les autres url seront bloquées.
  view1.webContents.setWindowOpenHandler(({ url }) => {
    if (decodeURI(url) == "file:///" + path.join(__dirname, "settings/index.html").toString().split('\\').join('/')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
          },
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: '#19171c',
            symbolColor: '#efeff1',
            height: 30
          }
        }
      }
    }
    return { action: 'deny' }
  })


  const view2 = new WebContentsView()

  const view3 = new WebContentsView({ webPreferences: { preload: path.join(__dirname, "preload.js"), nodeIntegration: true } })

  const view4 = new WebContentsView({ webPreferences: { preload: path.join(__dirname, "preload.js"), nodeIntegration: true } })

  reload = () => {
    view1.webContents.loadFile('topbar/index.html')
    view2.webContents.loadURL('https://dashboard.twitch.tv/u/moonligopsone/stream-manager')
    //view3.webContents.loadURL('https://player.twitch.tv/?channel=moonligopsone&enableExtensions=true&muted=true&parent=twitch.tv&player=popout&quality=auto&volume=0.5')
    view3.webContents.loadFile("camera/index.html")
    view4.webContents.loadFile("deck/index.html")
  }

  // Open the DevTools.
  view4.webContents.openDevTools()

  reload()

  win.contentView.addChildView(view1)
  win.contentView.addChildView(view2)
  win.contentView.addChildView(view4)
  win.contentView.addChildView(view3)

  win.on('resize', function () {
    resize();
  });
  resize()

  function resize() {
    var size = win.getSize();
    var width = size[0];
    var height = size[1];
    view1.setBounds({ x: 0, y: 0, width: width, height: 50 });
    view2.setBounds({ x: 500, y: 50, width: width - 500, height: height - 50 });
    view3.setBounds({ x: 0, y: 50, width: 500, height: 350 });
    view4.setBounds({ x: 0, y: 400, width: 500, height: height - 400 });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const express = require('express')
const { decode } = require('node:punycode')
const appExpress = express()
const port = 3000

appExpress.get('/script.js', (req, res) => {
  fs.readFile('deck/script.js', 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    configData = fs.readFileSync(configFilePath, 'utf-8').split("127.0.0.1").join(getip(config.NetInterface))
    data = data.replace("window.API.getSettings()", configData)
    data = data.replace("{{shareURL}}", config.sharedURL)
    res.send(data)
  })
})

appExpress.use(express.static('deck'))

appExpress.listen(port, () => {
  config.sharedURL = `http://${getip(config.NetInterface)}:${port}`
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  console.log(`Example app listening at http://${getip(config.NetInterface)}:${port}`)
})