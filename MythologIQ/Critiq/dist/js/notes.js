// CritIQ - Notes Management Module

import { state, session } from './state.js';
import { toggleRecording, initSTT } from './stt.js';

function renderNotes() {
  const list = document.getElementById('notes-list');
  if (!list) return;

  list.innerHTML = '';
  state.notes.forEach((note, index) => {
    const li = document.createElement('li');
    const noteText = document.createElement('span');
    noteText.className = 'note-text';
    noteText.textContent = note.text;

    const noteTime = document.createElement('span');
    noteTime.className = 'note-time';
    noteTime.textContent = new Date(note.timestamp).toLocaleTimeString();

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'note-delete';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.dataset.index = index;

    li.appendChild(noteText);
    li.appendChild(noteTime);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  list.querySelectorAll('.note-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      state.notes.splice(idx, 1);
      renderNotes();
    });
  });
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const textarea = event.target.querySelector('textarea');
  if (textarea && textarea.value.trim()) {
    const note = {
      text: textarea.value.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    state.notes.push(note);

    if (session.activeIndex >= 0 && session.activeIndex < session.captures.length) {
      session.captures[session.activeIndex].notes.push(note);
    }

    textarea.value = '';
    renderNotes();
  }
}

export {
  toggleRecording,
  renderNotes,
  handleNoteSubmit,
  initSTT
};
