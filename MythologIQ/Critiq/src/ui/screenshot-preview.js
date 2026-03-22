// src/ui/screenshot-preview.js
// Displays captured screenshot with markup overlay

let bus = null;

function init(eventBus) {
  bus = eventBus;
  bus.on('preview-update', renderPreview);
}

function renderPreview(imageData) {
  const container = document.getElementById('preview');
  if (container && imageData) {
    container.innerHTML = `<img src="${imageData}" alt="Screenshot preview">`;
  }
}

module.exports = { init };
