// CritIQ - Main application orchestration

import { session, state } from './state.js';
import { resetSession, startSession } from './session.js';
import { renderFilmstrip } from './filmstrip.js';
import {
  clearCanvas,
  deleteSelected,
  renderMarkup,
  undo
} from './markup.js';
import { initSTT, renderNoteTarget, toggleRecording, handleNoteSubmit } from './notes.js';
import {
  captureAllScreens,
  captureScreen,
  loadScreens,
  quickRegionCapture,
  startRegionSelection
} from './capture.js';
import { exportSession, saveAnnotatedImage } from './export.js';
import {
  resetViewport,
  setPanMode,
  setupViewport,
  togglePanMode,
  zoomBy
} from './viewer.js';
import { setupModalHandlers, openModal } from './utils.js';

function handleToolbarClick(event) {
  const tool = event.target.dataset.tool || event.target.closest('[data-tool]')?.dataset.tool;
  if (!tool) return;

  const actions = {
    capture: captureScreen,
    'capture-all': captureAllScreens,
    region: startRegionSelection,
    'quick-region': quickRegionCapture,
    save: saveAnnotatedImage,
    export: () => openModal('export-modal'),
    'new-session': startNewSession
  };
  actions[tool]?.();
}

function startNewSession() {
  const hasFrames = session.captures.length > 0;
  if (hasFrames && !window.confirm('Start a new session? Unsaved storyboard frames will be cleared.')) {
    return;
  }
  resetSession();
}

function handleMarkupClick(event) {
  const markup = event.target.dataset.markup;
  if (!markup) return;

  if (markup === 'undo') return undo();
  if (markup === 'clear') return clearCanvas();
  if (markup === 'delete') return deleteSelected();

  setPanMode(false);
  state.markup.tool = markup;
  if (markup !== 'select') state.markup.selectedId = null;
  updateMarkupButtons();
  renderMarkup();
  renderNoteTarget();
}

function updateMarkupButtons() {
  document.querySelectorAll('.markup-btn[data-markup]').forEach((button) => {
    const utility = ['undo', 'clear', 'delete'].includes(button.dataset.markup);
    if (!utility) button.classList.toggle('active', button.dataset.markup === state.markup.tool);
  });
}

function handleViewClick(event) {
  const view = event.target.dataset.view;
  if (!view) return;

  if (view === 'pan') togglePanMode();
  else if (view === 'zoom-in') zoomBy(0.1);
  else if (view === 'zoom-out') zoomBy(-0.1);
  else if (view === 'reset') resetViewport();
}

function setupSpeechAvailability() {
  const micButton = document.getElementById('mic-btn');
  if (!micButton) return;

  const available = initSTT();
  micButton.hidden = !available;
  micButton.setAttribute('aria-hidden', available ? 'false' : 'true');
}

function setupPreferences() {
  const format = document.getElementById('image-format');
  const quality = document.getElementById('jpeg-quality');
  const scale = document.getElementById('image-scale');

  format?.addEventListener('change', (event) => {
    state.preferences.imageFormat = event.target.value;
    updateQualityVisibility();
  });
  quality?.addEventListener('input', (event) => {
    state.preferences.jpegQuality = parseInt(event.target.value);
    document.getElementById('jpeg-quality-value').textContent = `${event.target.value}%`;
  });
  scale?.addEventListener('change', (event) => {
    state.preferences.imageScale = parseInt(event.target.value);
  });
  updateQualityVisibility();
}

function updateQualityVisibility() {
  const row = document.getElementById('jpeg-quality-row');
  if (row) row.hidden = state.preferences.imageFormat !== 'jpeg';
}

function isTypingTarget(target) {
  return target.matches?.('input, textarea, select, [contenteditable="true"]');
}

function handleKeyboard(event) {
  if (isTypingTarget(event.target)) return;

  if (event.ctrlKey || event.metaKey) {
    if (handleCommandShortcut(event)) event.preventDefault();
    return;
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    deleteSelected();
    return;
  }

  const tool = {
    v: 'select',
    p: 'pen',
    a: 'arrow',
    l: 'line',
    r: 'rect',
    e: 'ellipse',
    t: 'text'
  }[event.key.toLowerCase()];

  if (tool) {
    state.markup.tool = tool;
    setPanMode(false);
    if (tool !== 'select') state.markup.selectedId = null;
    updateMarkupButtons();
    renderMarkup();
    renderNoteTarget();
  }
}

function handleCommandShortcut(event) {
  const key = event.key.toLowerCase();
  if (key === 's' && !document.getElementById('save-btn').disabled) {
    saveAnnotatedImage();
    return true;
  }
  if (key === 'z') {
    undo();
    return true;
  }
  if (key === 'e' && !document.getElementById('export-btn').disabled) {
    openModal('export-modal');
    return true;
  }
  if (key === '0') {
    resetViewport();
    return true;
  }
  if (['+', '='].includes(event.key)) {
    zoomBy(0.1);
    return true;
  }
  if (event.key === '-') {
    zoomBy(-0.1);
    return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  startSession();
  loadScreens();
  setupModalHandlers();
  setupViewport();
  setupPreferences();
  setupSpeechAvailability();

  document.getElementById('toolbar')?.addEventListener('click', handleToolbarClick);
  document.getElementById('markup-tools')?.addEventListener('click', handleMarkupClick);
  document.getElementById('view-tools')?.addEventListener('click', handleViewClick);
  document.getElementById('markup-color')?.addEventListener('input', (event) => {
    state.markup.color = event.target.value;
  });
  document.getElementById('markup-size')?.addEventListener('input', (event) => {
    state.markup.size = parseInt(event.target.value);
  });
  document.getElementById('note-form')?.addEventListener('submit', handleNoteSubmit);
  document.getElementById('mic-btn')?.addEventListener('click', toggleRecording);
  document.getElementById('export-confirm')?.addEventListener('click', exportSession);
  document.addEventListener('keydown', handleKeyboard);

  renderFilmstrip();
});
