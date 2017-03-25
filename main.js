/**
 * Created by Pedo on 20.3.2017.
 */

// ./main.js
const { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const url = require('url');

require('dotenv').config();

let win = null;



app.on('ready', function () {

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({width: 1000, height: 600, backgroundColor: '#333333'});

  // Specify entry point
  if (process.env.PACKAGE === 'true'){
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  } else {
    win.loadURL(process.env.HOST);
    // Show dev tools
    win.webContents.openDevTools();
  }

  // Register shortcuts
  globalShortcut.register('CommandOrControl+Y', () => {
    // Do stuff when Y and either Command/Control is pressed.
    console.log("CTRL + Y pressed");
  });


  // Remove window once app is closed
  win.on('closed', function () {
    win = null;
  });

  //ipcMain handles messaging between main and render processes
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    event.sender.send('asynchronous-reply', 'pong')
  });

  ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg);
    event.returnValue = 'pong';
  });

  // Tray: Add icons and context menus to the system’s notification area
  let tray = new Tray('C:\\Users\\Pedo\\WebstormProjects\\gull-s-nest\\src\\favicon.ico');
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Item1', type: 'radio'},
    {label: 'Item2', type: 'radio'},
    {label: 'Item3', type: 'radio', checked: true},
    {label: 'Item4', type: 'radio'}
  ]);
  tray.setToolTip('Gull\'s Nest');
  tray.setContextMenu(contextMenu);


});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
