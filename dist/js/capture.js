// CritIQ - Screen and region capture

import { invoke, state } from './state.js';
import { addCaptureToSession, persistActiveCapture } from './session.js';
import { resetMarkupState, updatePreview } from './markup.js';
import { renderNotes } from './notes.js';
import { resetViewport } from './viewer.js';
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
      const all = document.createElement('option');
      all.value = 'all';
      all.textContent = `All Screens (${screens.length} monitors)`;
      select.appendChild(all);
    }
  } catch {
    showNotification('Unable to enumerate screens', 'error');
  }
}

async function captureScreen() {
  try {
    await showCountdown(selectedDelay());
    const value = document.getElementById('screen-select').value;
    const allScreens = value === 'all';
    const result = allScreens
      ? await invoke('capture_all_screens')
      : await invoke('capture_screen', { screenIndex: parseInt(value) });

    acceptCapture(result.image, result, {
      mode: allScreens ? 'all-screens' : 'screen',
      screenIndex: allScreens ? null : parseInt(value)
    });
    showNotification(allScreens ? 'All screens captured!' : 'Screenshot captured!');
  } catch (error) {
    showNotification('Capture failed: ' + (error.message || error), 'error');
  }
}

async function captureAllScreens() {
  try {
    await showCountdown(selectedDelay());
    const result = await invoke('capture_all_screens');
    acceptCapture(result.image, result, { mode: 'all-screens' });
    showNotification('All screens captured!');
  } catch (error) {
    showNotification('Capture failed: ' + (error.message || error), 'error');
  }
}

function selectedDelay() {
  return parseInt(document.getElementById('delay-select').value) || 0;
}

async function startRegionSelection() {
  try {
    const result = await invoke('capture_all_screens_fast');
    showRegionSelector(result.image, result.width, result.height, 'region-all');
  } catch (error) {
    showNotification('Failed to start region selection: ' + (error.message || error), 'error');
  }
}

async function quickRegionCapture() {
  try {
    const result = await invoke('capture_screen_fast', { screenIndex: 0 });
    showRegionSelector(result.image, result.width, result.height, 'region-primary');
  } catch (error) {
    showNotification('Quick capture failed: ' + (error.message || error), 'error');
  }
}

function acceptCapture(image, result, extraMetadata = {}) {
  persistActiveCapture();

  const metadata = {
    width: result.width,
    height: result.height,
    timestamp: result.timestamp || new Date().toISOString(),
    ...extraMetadata
  };
  addCaptureToSession(image, metadata);

  state.currentImage = image;
  state.originalImage = image;
  state.metadata = metadata;
  state.notes = [];
  resetMarkupState();
  resetViewport();
  updatePreview(image);
  renderNotes();
}

function showRegionSelector(imageData, imgWidth, imgHeight, mode) {
  document.getElementById('region-selector-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'region-selector-overlay';
  overlay.innerHTML = '<div class="region-instructions">Drag to select a region. Press ESC to cancel.</div>';

  const img = document.createElement('img');
  img.src = imageData;
  img.alt = 'Screen capture for region selection';

  const selectionBox = document.createElement('div');
  selectionBox.id = 'region-selection-box';

  overlay.appendChild(img);
  overlay.appendChild(selectionBox);
  document.body.appendChild(overlay);

  const selection = createRegionInteraction(
    overlay,
    selectionBox,
    imgWidth / window.innerWidth,
    imgHeight / window.innerHeight
  );

  selection.done.then((rect) => {
    if (!rect) return;
    cropAndAddToSession(imageData, rect, mode);
  });
}

function createRegionInteraction(overlay, selectionBox, scaleX, scaleY) {
  let startX = 0;
  let startY = 0;
  let selecting = false;
  let resolveDone;

  const done = new Promise((resolve) => { resolveDone = resolve; });

  const finish = (rect) => {
    overlay.remove();
    document.removeEventListener('keydown', onKeyDown);
    resolveDone(rect);
  };

  const onPointerDown = (event) => {
    selecting = true;
    startX = event.clientX;
    startY = event.clientY;
    updateSelectionBox(selectionBox, startX, startY, 0, 0);
  };

  const onPointerMove = (event) => {
    if (!selecting) return;
    const rect = screenRect(startX, startY, event.clientX, event.clientY);
    updateSelectionBox(selectionBox, rect.left, rect.top, rect.width, rect.height);
  };

  const onPointerUp = (event) => {
    if (!selecting) return;
    selecting = false;
    const rect = screenRect(startX, startY, event.clientX, event.clientY);
    if (rect.width <= 10 || rect.height <= 10) return finish(null);
    finish({
      x: Math.round(rect.left * scaleX),
      y: Math.round(rect.top * scaleY),
      width: Math.round(rect.width * scaleX),
      height: Math.round(rect.height * scaleY)
    });
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') finish(null);
  };

  overlay.addEventListener('pointerdown', onPointerDown);
  overlay.addEventListener('pointermove', onPointerMove);
  overlay.addEventListener('pointerup', onPointerUp);
  document.addEventListener('keydown', onKeyDown);
  return { done };
}

function screenRect(startX, startY, endX, endY) {
  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };
}

function updateSelectionBox(box, left, top, width, height) {
  Object.assign(box.style, {
    display: 'block',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  });
}

function cropAndAddToSession(imageData, rect, mode) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.getContext('2d').drawImage(
      img,
      rect.x, rect.y, rect.width, rect.height,
      0, 0, rect.width, rect.height
    );

    const image = canvas.toDataURL('image/png');
    acceptCapture(image, {
      width: rect.width,
      height: rect.height,
      timestamp: new Date().toISOString()
    }, { mode, region: rect });
    showNotification('Region captured!');
  };
  img.src = imageData;
}

export {
  captureAllScreens,
  captureScreen,
  loadScreens,
  quickRegionCapture,
  startRegionSelection
};
