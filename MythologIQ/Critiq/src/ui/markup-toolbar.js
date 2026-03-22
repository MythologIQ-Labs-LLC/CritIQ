// src/ui/markup-toolbar.js
// Toolbar for selecting markup tools

let bus = null;

function init(eventBus) {
  bus = eventBus;
  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    toolbar.addEventListener('click', handleToolClick);
  }
}

function handleToolClick(event) {
  const tool = event.target.dataset.tool;
  if (tool) {
    bus.emit('tool-selected', { tool });
  }
}

module.exports = { init };
