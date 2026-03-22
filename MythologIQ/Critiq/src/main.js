// src/main.js
// Entry point for the Electron application

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { captureScreen } = require('./core/capture-engine');
const { saveAnnotatedImage } = require('./utils/file-handler');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

function registerIpcHandlers() {
  ipcMain.handle('capture-screen', async () => {
    return await captureScreen();
  });

  ipcMain.handle('save-file', async (event, data, outputPath) => {
    return await saveAnnotatedImage(data, outputPath);
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
