// src/main.js
// Entry point for the Electron application

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { captureScreen } = require('./core/capture-engine');
const { saveAnnotatedImage } = require('./utils/file-handler');

// Security: Define allowed output directory for saved files
const ALLOWED_OUTPUT_DIR = app.getPath('pictures');

function validateOutputPath(outputPath) {
  const resolved = path.resolve(outputPath);
  const normalized = path.normalize(resolved);

  // Prevent path traversal: must be within allowed directory
  if (!normalized.startsWith(ALLOWED_OUTPUT_DIR)) {
    throw new Error(`Invalid path: must be within ${ALLOWED_OUTPUT_DIR}`);
  }

  // Reject paths with traversal sequences
  if (outputPath.includes('..')) {
    throw new Error('Path traversal not allowed');
  }

  return normalized;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  mainWindow.loadFile('index.html');
}

function registerIpcHandlers() {
  ipcMain.handle('capture-screen', async () => {
    try {
      return await captureScreen();
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('save-file', async (event, data, outputPath) => {
    try {
      const safePath = validateOutputPath(outputPath);
      return await saveAnnotatedImage(data, safePath);
    } catch (error) {
      return { error: error.message };
    }
  });
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

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
