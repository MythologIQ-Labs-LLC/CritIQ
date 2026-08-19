// CritIQ - Frame and annotation-linked notes

import { state, session } from './state.js';
import { toggleRecording, initSTT } from './stt.js';

function renderNotes() {
  const list = document.getElementById('notes-list');
  if (!list) return;

  list.innerHTML = '';
  state.notes.forEach((note, index) => {
    const item = document.createElement('li');
    item.appendChild(noteText(note));
    if (note.annotationId) item.appendChild(annotationBadge(note.annotationId));
    item.appendChild(noteTime(note.timestamp));
    item.appendChild(deleteButton(index));
    list.appendChild(item);
  });

  list.querySelectorAll('.note-delete').forEach((button) => {
    button.addEventListener('click', (event) => {
      state.notes.splice(parseInt(event.currentTarget.dataset.index), 1);
      renderNotes();
    });
  });

  renderNoteTarget();
}

function noteText(note) {
  const span = document.createElement('span');
  span.className = 'note-text';
  span.textContent = note.text;
  return span;
}

function annotationBadge(annotationId) {
  const badge = document.createElement('span');
  badge.className = 'annotation-badge';
  badge.textContent = `↳ ${shortId(annotationId)}`;
  badge.title = `Linked to annotation ${annotationId}`;
  return badge;
}

function noteTime(timestamp) {
  const span = document.createElement('span');
  span.className = 'note-time';
  span.textContent = new Date(timestamp).toLocaleTimeString();
  return span;
}

function deleteButton(index) {
  const button = document.createElement('button');
  button.className = 'note-delete';
  button.innerHTML = '&times;';
  button.dataset.index = index;
  button.title = 'Delete note';
  button.setAttribute('aria-label', 'Delete note');
  return button;
}

function renderNoteTarget() {
  const target = document.getElementById('note-target');
  if (!target) return;

  const selectedId = state.markup.selectedId;
  target.textContent = selectedId
    ? `Notes link to selected annotation ${shortId(selectedId)}`
    : 'Notes attach to this frame';
  target.classList.toggle('linked', !!selectedId);
}

function shortId(id) {
  return id.length > 8 ? id.slice(-8) : id;
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const textarea = event.target.querySelector('textarea');
  const text = textarea?.value.trim();
  if (!text) return;

  const note = {
    text,
    timestamp: new Date().toISOString(),
    type: 'text'
  };
  if (state.markup.selectedId) note.annotationId = state.markup.selectedId;

  state.notes.push(note);
  if (session.activeIndex >= 0 && session.activeIndex < session.captures.length) {
    session.captures[session.activeIndex].notes = state.notes.map((item) => ({ ...item }));
  }

  textarea.value = '';
  renderNotes();
}

export {
  handleNoteSubmit,
  initSTT,
  renderNotes,
  renderNoteTarget,
  toggleRecording
};
