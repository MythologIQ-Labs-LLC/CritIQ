// CritIQ - Session Management Module

import { session, state, generateId, getCanvas } from './state.js';
import { renderFilmstrip, generateThumbnail, updateExportButton } from './filmstrip.js';
import { updatePreview, clearPreview } from './markup.js';
import { renderNotes } from './notes.js';
import { showNotification } from './utils.js';

function startSession() {
  session.id = generateId();
  session.captures = [];
  session.activeIndex = -1;
  session.created = new Date().toISOString();
  renderFilmstrip();
  updateExportButton();
  showNotification('New session started');
}

function addCaptureToSession(imageData, metadata = {}) {
  const capture = {
    id: generateId(),
    image: imageData,
    thumbnail: null,
    notes: [],
    markup: null,
    timestamp: new Date().toISOString(),
    metadata
  };

  generateThumbnail(imageData).then(thumb => {
    capture.thumbnail = thumb;
    renderFilmstrip();
  });

  session.captures.push(capture);
  session.activeIndex = session.captures.length - 1;

  renderFilmstrip();
  updateExportButton();

  return capture;
}

function switchCapture(index) {
  if (index < 0 || index >= session.captures.length) return;

  const { canvas, ctx } = getCanvas();

  if (session.activeIndex >= 0 && session.activeIndex < session.captures.length && canvas) {
    const current = session.captures[session.activeIndex];
    current.markup = ctx.getImageData(0, 0, canvas.width, canvas.height);
    current.notes = [...state.notes];
  }

  session.activeIndex = index;
  const capture = session.captures[index];

  state.currentImage = capture.image;
  state.originalImage = capture.image;
  state.notes = [...capture.notes];
  state.metadata = capture.metadata || {};
  state.markup.history = [];

  updatePreview(capture.image);

  if (capture.markup && canvas) {
    setTimeout(() => {
      const { ctx } = getCanvas();
      if (ctx && capture.markup) {
        ctx.putImageData(capture.markup, 0, 0);
      }
    }, 100);
  }

  renderNotes();
  renderFilmstrip();
}

function removeCapture(index) {
  if (index < 0 || index >= session.captures.length) return;

  session.captures.splice(index, 1);

  if (session.captures.length === 0) {
    session.activeIndex = -1;
    clearPreview();
  } else if (session.activeIndex >= session.captures.length) {
    session.activeIndex = session.captures.length - 1;
    switchCapture(session.activeIndex);
  } else if (session.activeIndex === index) {
    switchCapture(Math.min(index, session.captures.length - 1));
  }

  renderFilmstrip();
  updateExportButton();
}

export {
  startSession,
  addCaptureToSession,
  switchCapture,
  removeCapture
};
