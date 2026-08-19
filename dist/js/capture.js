// CritIQ - Screen Capture Module

import { invoke, state } from './state.js';
import { addCaptureToSession, persistActiveCapture } from './session.js';
import { updatePreview } from './markup.js';
import { renderNotes } from './notes.js';
import { showNotification, showCountdown } from './utils.js';

async function loadScreens() {
  try {
    const screens = await invoke('get_screens');
    const select = document.getElementById('screen-select');
    select.innerHTML = '';

    screens.forEach((screen, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = screen.name + (screen.is_primary ? ' (Primary)' : '');
      select.appendChild(option);
    });

    if (screens.length > 1) {
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = `All Screens (${screens.length} monitors)`;
      select.appendChild(allOption);
    }
  } catch (error) {
    // Screen loading failed silently
  }
}

async function captureScreen() {
  try {
    const delay = parseInt(document.getElementById('delay-select').value) || 0;
    const screenSelect = document.getElementById('screen-select');
    const screenValue = screenSelect.value;

    await showCountdown(delay);

    let result;
    if (screenValue === 'all') {
      result = await invoke('capture_all_screens');
    } else {
      result = await invoke('capture_screen', { screenIndex: parseInt(screenValue) });
    }

    persistActiveCapture();
    addCaptureToSession(result.image, {
      width: result.width,
      height: result.height,
      timestamp: result.timestamp
    });

    state.currentImage = result.image;
    state.originalImage = result.image;
    state.metadata = { width: result.width, height: result.height, timestamp: result.timestamp };
    state.markup.history = [];
    state.notes = [];
    updatePreview(result.image);
    renderNotes();
    showNotification('Screenshot captured!');
  } catch (error) {
    showNotification('Capture failed: ' + (error.message || error), 'error');
  }
}

async function captureAllScreens() {
  try {
    const delay = parseInt(document.getElementById('delay-select').value) || 0;
    await showCountdown(delay);

    const result = await invoke('capture_all_screens');

    persistActiveCapture();
    addCaptureToSession(result.image, {
      width: result.width,
      height: result.height,
      timestamp: result.timestamp
    });

    state.currentImage = result.image;
    state.originalImage = result.image;
    state.metadata = { width: result.width, height: result.height, timestamp: result.timestamp };
    state.markup.history = [];
    state.notes = [];
    updatePreview(result.image);
    renderNotes();
    showNotification('All screens captured!');
  } catch (error) {
    showNotification('Capture failed: ' + (error.message || error), 'error');
  }
}

async function startRegionSelection() {
  try {
    const result = await invoke('capture_all_screens_fast');
    showRegionSelector(result.image, result.width, result.height);
  } catch (error) {
    showNotification('Failed to start region selection: ' + (error.message || error), 'error');
  }
}

async function quickRegionCapture() {
  try {
    const result = await invoke('capture_screen_fast', { screenIndex: 0 });
    showRegionSelector(result.image, result.width, result.height);
  } catch (error) {
    showNotification('Quick capture failed: ' + (error.message || error), 'error');
  }
}

function showRegionSelector(imageData, imgWidth, imgHeight) {
  const existingOverlay = document.getElementById('region-selector-overlay');
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  overlay.id = 'region-selector-overlay';

  const instructions = document.createElement('div');
  instructions.className = 'region-instructions';
  instructions.textContent = 'Click and drag to select a region. Press ESC to cancel.';

  const img = document.createElement('img');
  img.src = imageData;
  img.alt = 'Screen capture';

  const selectionBox = document.createElement('div');
  selectionBox.id = 'region-selection-box';

  overlay.appendChild(instructions);
  overlay.appendChild(img);
  overlay.appendChild(selectionBox);
  document.body.appendChild(overlay);

  const scaleX = imgWidth / window.innerWidth;
  const scaleY = imgHeight / window.innerHeight;

  let startX = 0, startY = 0, isSelecting = false;

  const onMouseDown = (e) => {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0';
    selectionBox.style.height = '0';
    selectionBox.style.display = 'block';
  };

  const onMouseMove = (e) => {
    if (!isSelecting) return;
    const left = Math.min(startX, e.clientX);
    const top = Math.min(startY, e.clientY);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  };

  const onMouseUp = (e) => {
    if (!isSelecting) return;
    isSelecting = false;

    const left = Math.min(startX, e.clientX);
    const top = Math.min(startY, e.clientY);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    cleanup();

    if (width > 10 && height > 10) {
      cropAndAddToSession(imageData,
        Math.round(left * scaleX),
        Math.round(top * scaleY),
        Math.round(width * scaleX),
        Math.round(height * scaleY)
      );
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };

  const cleanup = () => {
    overlay.removeEventListener('mousedown', onMouseDown);
    overlay.removeEventListener('mousemove', onMouseMove);
    overlay.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
  };

  overlay.addEventListener('mousedown', onMouseDown);
  overlay.addEventListener('mousemove', onMouseMove);
  overlay.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
}

function cropAndAddToSession(imageData, x, y, width, height) {
  const img = new Image();
  img.onload = () => {
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = width;
    cropCanvas.height = height;
    const cropCtx = cropCanvas.getContext('2d');

    cropCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

    const croppedImage = cropCanvas.toDataURL('image/png');
    const timestamp = new Date().toISOString();

    persistActiveCapture();
    addCaptureToSession(croppedImage, { width, height, timestamp });

    state.currentImage = croppedImage;
    state.originalImage = croppedImage;
    state.metadata = { width, height, timestamp };
    state.markup.history = [];
    state.notes = [];
    updatePreview(croppedImage);
    renderNotes();
    showNotification('Region captured!');
  };
  img.src = imageData;
}

export {
  loadScreens,
  captureScreen,
  captureAllScreens,
  startRegionSelection,
  quickRegionCapture
};
