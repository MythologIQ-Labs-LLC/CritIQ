// src/ui/note-input-panel.js
// Panel for entering text and voice notes

let bus = null;

function init(eventBus) {
  bus = eventBus;
  const notesPanel = document.getElementById('notes');
  if (notesPanel) {
    notesPanel.addEventListener('submit', handleNoteSubmit);
  }
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const textarea = event.target.querySelector('textarea');
  if (textarea && textarea.value) {
    bus.emit('note-added', {
      text: textarea.value,
      timestamp: new Date().toISOString()
    });
    textarea.value = '';
  }
}

module.exports = { init };
