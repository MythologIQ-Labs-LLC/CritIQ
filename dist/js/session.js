// CritIQ - Storyboard session management

import { session, state, generateId } from './state.js';
import { cloneAnnotations } from './annotations.js';
import { renderFilmstrip, generateThumbnail, updateExportButton } from './filmstrip.js';
import { updatePreview, clearPreview, getCompositeImage, loadAnnotations } from './markup.js';
import { renderNotes } from './notes.js';
import { resetViewport } from './viewer.js';
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

function resetSession() {
  clearPreview();
  resetViewport();
  startSession();
}

function addCaptureToSession(imageData, metadata = {}) {
  const capture = {
    id: generateId(),
    image: imageData,
    compositeImage: imageData,
    thumbnail: null,
    notes: [],
    annotations: [],
    timestamp: new Date().toISOString(),
    metadata
  };

  generateThumbnail(imageData).then((thumbnail) => {
    capture.thumbnail = thumbnail;
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
  current.notes = state.notes.map((note) => ({ ...note }));
  current.metadata = { ...(state.metadata || {}) };
  current.annotations = cloneAnnotations(state.markup.annotations);

  const composite = getCompositeImage('png');
  if (!composite) return;

  current.compositeImage = composite;
  generateThumbnail(composite).then((thumbnail) => {
    current.thumbnail = thumbnail;
    renderFilmstrip();
  });
}

function switchCapture(index) {
  if (index < 0 || index >= session.captures.length) return;
  if (index === session.activeIndex) return;

  persistActiveCapture();
  session.activeIndex = index;
  activateCapture(session.captures[index]);
}

function activateCapture(capture) {
  state.currentImage = capture.image;
  state.originalImage = capture.image;
  state.notes = capture.notes.map((note) => ({ ...note }));
  state.metadata = { ...(capture.metadata || {}) };

  resetViewport();
  updatePreview(capture.image);
  loadAnnotations(capture.annotations || []);
  renderNotes();
  renderFilmstrip();
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

function moveCapture(index, direction) {
  const target = index + direction;
  if (
    index < 0 ||
    index >= session.captures.length ||
    target < 0 ||
    target >= session.captures.length
  ) {
    return;
  }

  persistActiveCapture();
  [session.captures[index], session.captures[target]] =
    [session.captures[target], session.captures[index]];

  if (session.activeIndex === index) session.activeIndex = target;
  else if (session.activeIndex === target) session.activeIndex = index;

  renderFilmstrip();
}

export {
  addCaptureToSession,
  moveCapture,
  persistActiveCapture,
  removeCapture,
  resetSession,
  startSession,
  switchCapture
};
