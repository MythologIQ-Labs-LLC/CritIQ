// CritIQ - Session Management Module

import { session, state, generateId, getCanvas } from './state.js';
import { renderFilmstrip, generateThumbnail, updateExportButton } from './filmstrip.js';
import { updatePreview, clearPreview, getCompositeImage } from './markup.js';
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
    compositeImage: imageData,
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

function persistActiveCapture() {
  const index = session.activeIndex;
  if (index < 0 || index >= session.captures.length) return;

  const current = session.captures[index];
  const { canvas, ctx } = getCanvas();
  current.notes = [...state.notes];
  current.metadata = state.metadata || {};

  if (canvas && ctx) {
    current.markup = ctx.getImageData(0, 0, canvas.width, canvas.height);
    current.compositeImage = getCompositeImage();
  }
}

function switchCapture(index) {
  if (index < 0 || index >= session.captures.length) return;
  if (index === session.activeIndex) return;

  persistActiveCapture();
  session.activeIndex = index;
  const capture = session.captures[index];

  state.currentImage = capture.image;
  state.originalImage = capture.image;
  state.notes = [...capture.notes];
  state.metadata = capture.metadata || {};
  state.markup.history = [];

  updatePreview(capture.image);
  restoreMarkupWhenReady(capture);

  renderNotes();
  renderFilmstrip();
}

function restoreMarkupWhenReady(capture, attempts = 0) {
  if (!capture.markup) return;

  const { canvas, ctx } = getCanvas();
  const previewCanvas = document.querySelector('#preview canvas');
  if (canvas && ctx && canvas === previewCanvas) {
    ctx.putImageData(capture.markup, 0, 0);
    return;
  }

  if (attempts < 30) {
    requestAnimationFrame(() => restoreMarkupWhenReady(capture, attempts + 1));
  }
}

function removeCapture(index) {
  if (index < 0 || index >= session.captures.length) return;

  const activeIndex = session.activeIndex;
  const removingActive = activeIndex === index;
  session.captures.splice(index, 1);

  if (session.captures.length === 0) {
    session.activeIndex = -1;
    clearPreview();
  } else if (removingActive) {
    session.activeIndex = -1;
    switchCapture(Math.min(index, session.captures.length - 1));
  } else if (index < activeIndex) {
    session.activeIndex = activeIndex - 1;
  }

  renderFilmstrip();
  updateExportButton();
}

export {
  startSession,
  addCaptureToSession,
  persistActiveCapture,
  switchCapture,
  removeCapture
};
