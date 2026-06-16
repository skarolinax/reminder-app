import { app, BrowserWindow, ipcMain, Tray, Menu, powerMonitor } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';

import { createOverlay } from "./logic/overlay.js";
import { act } from 'react';

let tray; 
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
 mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
    color: '#9436ae',
    symbolColor: '#f4dbfd'
  },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  // } else {
  //   mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  // }

  mainWindow.loadURL("http://localhost:5173");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.on('close', (event) => {
  if (!app.isQuitting) {
    event.preventDefault(); // Prevent the default behavior of closing the window
    mainWindow.hide(); // Hide the window instead of closing it
  }
});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  //Tray allows me to run popups without main window being open
  tray = new Tray(
    path.join(app.getAppPath(), "public/images/icon.png") // Build the tray icon path using app.getAppPath() to ensure it works in production (vite issues)
  );

  const menu = Menu.buildFromTemplate([
    { 
      label: "Open ReMiddy",
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: "Quit ReMiddy",
      click: () => {
        app.isQuitting = true; // Set a flag to indicate that the app is quitting
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(menu);
  tray.setToolTip("ReMiddy - Your virtual assistant");

  tray.on("click", ()=> {
    mainWindow.show();
  })
  
  ipcMain.on('show-overlay', (event, message) => {
    createOverlay(message);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', (e) => {
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  e.preventDefault(); // Prevent the default behavior of quitting the app when all windows are closed
});

// Track for how long the user was not idle 
let activeSeconds = 0;
let reminderShown = false;

setInterval(() => {
  const idleTime = powerMonitor.getSystemIdleTime();

  const breakThreshold = 60 * 5 // min 5 minutes idle so 
  const activityLimit = 60 * 50 // max 50 minutes without a break, reset only when breakThreshold was achieved

  const isInBreak = idleTime >= breakThreshold; //Check if the break happened 

  if (isInBreak) {
    console.log("5 min break was detected and is happening"); 
    reminderShown = false;
    activeSeconds = 0;
  } else {
    activeSeconds += 1;
    console.log(activeSeconds, reminderShown, isInBreak)
    reminderShown = false;
  }

  if (activeSeconds >= activityLimit && !reminderShown ) {
    createOverlay("You need to take a break!") // No 5 min break detected in 50 minutes, fire reminder
    console.log("No break (idle time) detected in 50 minutes. Firing a reminder.")
    activeSeconds = 0;
    reminderShown = true; //reset to not fire multiple times
  }
}, 1000)