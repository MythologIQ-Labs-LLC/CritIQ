// CritIQ - Preview zoom and pan controls

import { state } from './state.js';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

function setupViewport() {
  const preview = document.getElementById('preview');
  if (!preview) return;

  preview.addEventListener('pointerdown', beginPan, true);
  preview.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('pointermove', continuePan);
  document.addEventListener('pointerup', endPan);
  applyViewport();
}

function beginPan(event) {
  const shouldPan = state.viewport.panMode || event.button === 1;
  if (!shouldPan || !document.querySelector('.canvas-container')) return;

  event.preventDefault();
  event.stopPropagation();
  state.viewport.isPanning = true;
  state.viewport.startX = event.clientX - state.viewport.panX;
  state.viewport.startY = event.clientY - state.viewport.panY;
}

function continuePan(event) {
  if (!state.viewport.isPanning) return;
  state.viewport.panX = event.clientX - state.viewport.startX;
  state.viewport.panY = event.clientY - state.viewport.startY;
  applyViewport();
}

function endPan() {
  state.viewport.isPanning = false;
}

function handleWheel(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  zoomBy(event.deltaY < 0 ? 0.1 : -0.1);
}

function zoomBy(delta) {
  state.viewport.zoom = clampZoom(state.viewport.zoom + delta);
  applyViewport();
}

function setZoom(zoom) {
  state.viewport.zoom = clampZoom(zoom);
  applyViewport();
}

function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(zoom * 100) / 100));
}

function togglePanMode() {
  setPanMode(!state.viewport.panMode);
}

function setPanMode(enabled) {
  state.viewport.panMode = enabled;
  const button = document.querySelector('[data-view="pan"]');
  button?.classList.toggle('active', enabled);
  document.getElementById('preview')?.classList.toggle('pan-mode', enabled);
}

function resetViewport() {
  state.viewport.zoom = 1;
  state.viewport.panX = 0;
  state.viewport.panY = 0;
  state.viewport.isPanning = false;
  setPanMode(false);
  applyViewport();
}

function applyViewport() {
  const container = document.querySelector('.canvas-container');
  if (container) {
    container.style.transform =
      `translate(${state.viewport.panX}px, ${state.viewport.panY}px) scale(${state.viewport.zoom})`;
  }

  const label = document.getElementById('zoom-label');
  if (label) label.textContent = `${Math.round(state.viewport.zoom * 100)}%`;
}

export {
  resetViewport,
  setPanMode,
  setZoom,
  setupViewport,
  togglePanMode,
  zoomBy
};
