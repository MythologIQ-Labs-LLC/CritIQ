// CritIQ - Storyboard export shaping

function buildExportCaptures(captures) {
  return captures.map((capture) => ({
    id: capture.id,
    image: capture.compositeImage || capture.image,
    notes: Array.isArray(capture.notes) ? [...capture.notes] : [],
    timestamp: capture.timestamp,
    metadata: capture.metadata || {}
  }));
}

export { buildExportCaptures };
