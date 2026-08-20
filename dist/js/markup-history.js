// CritIQ - Annotation history helpers

import { state } from './state.js';
import { cloneAnnotations } from './annotations.js';

function pushAnnotationHistory() {
  state.markup.history.push(cloneAnnotations(state.markup.annotations));
  if (state.markup.history.length > 50) state.markup.history.shift();
}

function restorePreviousAnnotations() {
  const previous = state.markup.history.pop();
  if (!previous) return false;

  state.markup.annotations = previous;
  state.markup.selectedId = null;
  state.markup.draft = null;
  state.markup.isDrawing = false;
  return true;
}

export { pushAnnotationHistory, restorePreviousAnnotations };
