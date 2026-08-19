// CritIQ - Settings Module

import { state } from './state.js';

function loadSettings() {
  const autoSave = document.getElementById('auto-save');
  const captureFormat = document.getElementById('capture-format');

  if (autoSave) autoSave.checked = state.settings.autoSave;
  if (captureFormat) captureFormat.value = state.settings.captureFormat;
}

function saveSettings() {
  const autoSave = document.getElementById('auto-save');
  const captureFormat = document.getElementById('capture-format');

  if (autoSave) {
    state.settings.autoSave = autoSave.checked;
    localStorage.setItem('auto-save', autoSave.checked);
  }

  if (captureFormat) {
    state.settings.captureFormat = captureFormat.value;
    localStorage.setItem('capture-format', captureFormat.value);
  }
}

export { loadSettings, saveSettings };
