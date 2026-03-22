// src/ui/main-window.js
// Main UI container - coordinates capture and save events

let bus = null;

function init(eventBus) {
  bus = eventBus;
  bus.on('capture-complete', handleCaptureComplete);
  bus.on('save-complete', handleSaveComplete);
}

function handleCaptureComplete(imageData) {
  bus.emit('preview-update', imageData);
}

function handleSaveComplete(filePath) {
  bus.emit('notification', { type: 'success', message: `Saved: ${filePath}` });
}

module.exports = { init };
