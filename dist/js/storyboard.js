// CritIQ - Storyboard export shaping

import { cloneAnnotations } from './annotations.js';

function buildExportCaptures(captures) {
  return captures.map((capture) => ({
    id: capture.id,
    image: capture.compositeImage || capture.image,
    notes: Array.isArray(capture.notes)
      ? capture.notes.map((note) => ({ ...note }))
      : [],
    annotations: cloneAnnotations(capture.annotations || []),
    timestamp: capture.timestamp,
    metadata: { ...(capture.metadata || {}) }
  }));
}

export { buildExportCaptures };
