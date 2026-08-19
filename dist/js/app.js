// CritIQ - Main Application Entry Point
// Orchestrates all modules and sets up event handlers

import { state } from './state.js';
import { startSession } from './session.js';
import { renderFilmstrip } from './filmstrip.js';
import { undo, clearCanvas } from './markup.js';
import { toggleRecording, renderNotes, handleNoteSubmit } from './notes.js';
import { loadScreens, captureScreen, captureAllScreens, startRegionSelection, quickRegionCapture } from './capture.js';
import { saveAnnotatedImage, exportSession } from './export.js';
import { setupModalHandlers, openModal } from './utils.js';

function handleToolbarClick(event) {
  const tool = event.target.dataset.tool || event.target.closest('[data-tool]')?.dataset.tool;
  if (!tool) return;

  switch (tool) {
    case 'capture': captureScreen(); break;
    case 'capture-all': captureAllScreens(); break;
    case 'region': startRegionSelection(); break;
    case 'quick-region': quickRegionCapture(); break;
    case 'save': saveAnnotatedImage(); break;
    case 'export': openModal('export-modal'); break;
  }
}

function handleMarkupClick(event) {
  const markup = event.target.dataset.markup;
  if (!markup) return;

  if (markup === 'undo') { undo(); return; }
  if (markup === 'clear') { clearCanvas(); return; }

  state.markup.tool = markup;
  document.querySelectorAll('.markup-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.markup === markup);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  startSession();
  loadScreens();
  setupModalHandlers();

  document.getElementById('toolbar')?.addEventListener('click', handleToolbarClick);
  document.getElementById('markup-tools')?.addEventListener('click', handleMarkupClick);
  document.getElementById('markup-color')?.addEventListener('input', (e) => state.markup.color = e.target.value);
  document.getElementById('markup-size')?.addEventListener('input', (e) => state.markup.size = parseInt(e.target.value));
  document.getElementById('note-form')?.addEventListener('submit', handleNoteSubmit);
  document.getElementById('mic-btn')?.addEventListener('click', toggleRecording);
  document.getElementById('export-confirm')?.addEventListener('click', exportSession);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') { e.preventDefault(); if (!document.getElementById('save-btn').disabled) saveAnnotatedImage(); }
      else if (e.key === 'z') { e.preventDefault(); undo(); }
      else if (e.key === 'e') { e.preventDefault(); if (!document.getElementById('export-btn').disabled) openModal('export-modal'); }
    }
  });

  renderFilmstrip();
});
