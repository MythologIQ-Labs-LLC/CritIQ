// CritIQ - Markup preview lifecycle and canvas mounting

import { state, setCanvas, setBaseImage } from './state.js';
import { renderNotes } from './notes.js';

function mountPreview(imageData, onCanvasReady) {
  const container = document.getElementById('preview');
  if (!container || !imageData) return;

  setCanvas(null, null);
  setBaseImage(null);
  container.innerHTML = '';

  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'canvas-container';
  const img = document.createElement('img');
  img.src = imageData;
  img.alt = 'Screenshot preview';
  canvasContainer.appendChild(img);
  container.appendChild(canvasContainer);

  img.onload = () => mountCanvas(img, canvasContainer, onCanvasReady);
  setEditorVisibility(true);
}

function mountCanvas(img, canvasContainer, onCanvasReady) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const syncOverlaySize = () => {
    canvas.style.width = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;
  };
  syncOverlaySize();
  if (window.ResizeObserver) new window.ResizeObserver(syncOverlaySize).observe(img);

  setCanvas(canvas, canvas.getContext('2d'));
  setBaseImage(img);
  canvasContainer.appendChild(canvas);
  onCanvasReady?.(canvas);
}

function clearPreviewSurface(onClear) {
  const container = document.getElementById('preview');
  setCanvas(null, null);
  setBaseImage(null);
  if (container) {
    container.innerHTML = '<p class="placeholder">Click "Capture" to add the first storyboard frame</p>';
  }

  setEditorVisibility(false);
  state.currentImage = null;
  state.notes = [];
  onClear?.();
  renderNotes();
}

function setEditorVisibility(visible) {
  const saveButton = document.getElementById('save-btn');
  if (saveButton) saveButton.disabled = !visible;
  ['markup-tools', 'view-tools'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.style.display = visible ? 'flex' : 'none';
  });
}

export { clearPreviewSurface, mountPreview };
