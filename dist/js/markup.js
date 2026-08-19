// CritIQ - Vector-backed markup and canvas interaction

import {
  state,
  setCanvas,
  setBaseImage,
  getCanvas,
  getBaseImage,
  generateId
} from './state.js';
import {
  cloneAnnotations,
  createAnnotation,
  hitTestAnnotations,
  isMeaningfulAnnotation,
  moveAnnotation,
  updateDraft
} from './annotations.js';
import { composeImage, renderAnnotations } from './annotation-renderer.js';
import { pushAnnotationHistory, restorePreviousAnnotations } from './markup-history.js';
import { requestAnnotationText } from './text-annotation.js';
import { renderNotes, renderNoteTarget } from './notes.js';
import { clearPreviewSurface, mountPreview } from './markup-preview.js';

function updatePreview(imageData) {
  mountPreview(imageData, (canvas) => {
    setupCanvasEvents(canvas);
    renderMarkup();
  });
}

function clearPreview() {
  clearPreviewSurface(resetMarkupState);
}

function setupCanvasEvents(canvas) {
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
}

function getCanvasCoords(event) {
  const { canvas } = getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function handlePointerDown(event) {
  if (state.viewport.panMode) return;
  const { x, y } = getCanvasCoords(event);

  if (state.markup.tool === 'select') return beginSelectionDrag(x, y);
  if (state.markup.tool === 'text') return addTextAnnotation(x, y);

  state.markup.isDrawing = true;
  state.markup.draft = createAnnotation(
    state.markup.tool,
    generateId(),
    x,
    y,
    state.markup
  );
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function beginSelectionDrag(x, y) {
  const tolerance = Math.max(4, 10 / state.viewport.zoom);
  const selectedId = hitTestAnnotations(
    state.markup.annotations,
    x,
    y,
    tolerance
  );

  state.markup.selectedId = selectedId;
  state.markup.isDrawing = !!selectedId;
  state.markup.dragX = x;
  state.markup.dragY = y;
  state.markup.dragMoved = false;
  renderMarkup();
  renderNoteTarget();
}

async function addTextAnnotation(x, y) {
  const text = await requestAnnotationText();
  if (!text) return;

  pushAnnotationHistory();
  state.markup.annotations.push(createAnnotation(
    'text',
    generateId(),
    x,
    y,
    { ...state.markup, text }
  ));
  renderMarkup();
}

function handlePointerMove(event) {
  if (!state.markup.isDrawing || state.viewport.panMode) return;
  const { x, y } = getCanvasCoords(event);

  if (state.markup.tool === 'select') {
    dragSelected(x, y);
  } else {
    updateDraft(state.markup.draft, x, y);
    renderMarkup();
  }
}

function dragSelected(x, y) {
  const selected = state.markup.annotations.find(
    (annotation) => annotation.id === state.markup.selectedId
  );
  if (!selected) return;

  if (!state.markup.dragMoved) {
    pushAnnotationHistory();
    state.markup.dragMoved = true;
  }
  moveAnnotation(selected, x - state.markup.dragX, y - state.markup.dragY);
  state.markup.dragX = x;
  state.markup.dragY = y;
  renderMarkup();
}

function handlePointerUp() {
  if (!state.markup.isDrawing) return;
  state.markup.isDrawing = false;

  if (state.markup.tool === 'select') {
    state.markup.dragMoved = false;
    return;
  }
  if (isMeaningfulAnnotation(state.markup.draft)) {
    pushAnnotationHistory();
    state.markup.annotations.push(state.markup.draft);
  }
  state.markup.draft = null;
  renderMarkup();
}

function undo() {
  if (!restorePreviousAnnotations()) return;
  renderMarkup();
  renderNoteTarget();
}

function clearCanvas() {
  if (state.markup.annotations.length === 0) return;
  pushAnnotationHistory();
  state.markup.annotations = [];
  state.markup.selectedId = null;
  state.notes.forEach((note) => delete note.annotationId);
  renderMarkup();
  renderNotes();
  renderNoteTarget();
}

function deleteSelected() {
  const selectedId = state.markup.selectedId;
  if (!selectedId) return;

  pushAnnotationHistory();
  state.markup.annotations = state.markup.annotations.filter(
    (annotation) => annotation.id !== selectedId
  );
  state.notes.forEach((note) => {
    if (note.annotationId === selectedId) delete note.annotationId;
  });
  state.markup.selectedId = null;
  renderMarkup();
  renderNotes();
  renderNoteTarget();
}

function renderMarkup() {
  const { ctx } = getCanvas();
  if (!ctx) return;
  renderAnnotations(
    ctx,
    state.markup.annotations,
    state.markup.selectedId,
    state.markup.draft
  );
}

function loadAnnotations(annotations = []) {
  state.markup.annotations = cloneAnnotations(annotations);
  state.markup.history = [];
  state.markup.selectedId = null;
  state.markup.draft = null;
  state.markup.isDrawing = false;
  state.markup.dragMoved = false;
  renderMarkup();
  renderNoteTarget();
}

function resetMarkupState() {
  loadAnnotations([]);
}

function getCompositeImage(format = 'png', quality = 0.9) {
  const { canvas } = getCanvas();
  const baseImage = getBaseImage();
  if (!canvas || !baseImage) return null;
  return composeImage(
    baseImage,
    canvas.width,
    canvas.height,
    state.markup.annotations,
    format,
    quality
  );
}

export {
  clearCanvas,
  clearPreview,
  deleteSelected,
  getCompositeImage,
  loadAnnotations,
  renderMarkup,
  resetMarkupState,
  undo,
  updatePreview
};
