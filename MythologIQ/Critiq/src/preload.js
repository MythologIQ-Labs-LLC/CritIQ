const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('critiqAPI', {
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  saveFile: (data, path) => ipcRenderer.invoke('save-file', data, path),
  onCaptureComplete: (callback) => ipcRenderer.on('capture-complete', callback)
});
