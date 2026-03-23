// CritIQ - Settings Module

import { state } from './state.js';

function loadSettings() {
  const sttSelect = document.getElementById('stt-engine');
  const autoSave = document.getElementById('auto-save');
  const captureFormat = document.getElementById('capture-format');

  if (sttSelect) sttSelect.value = state.settings.sttEngine;
  if (autoSave) autoSave.checked = state.settings.autoSave;
  if (captureFormat) captureFormat.value = state.settings.captureFormat;
}

function saveSettings() {
  const sttSelect = document.getElementById('stt-engine');
  const autoSave = document.getElementById('auto-save');
  const captureFormat = document.getElementById('capture-format');

  if (sttSelect) {
    state.settings.sttEngine = sttSelect.value;
    localStorage.setItem('stt-engine', sttSelect.value);
  }

  if (autoSave) {
    state.settings.autoSave = autoSave.checked;
    localStorage.setItem('auto-save', autoSave.checked);
  }

  if (captureFormat) {
    state.settings.captureFormat = captureFormat.value;
    localStorage.setItem('capture-format', captureFormat.value);
  }
}

export {
  loadSettings,
  saveSettings
};
