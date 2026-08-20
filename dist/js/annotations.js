// CritIQ - Pure annotation model helpers

function cloneAnnotations(annotations = []) {
  return annotations.map((annotation) => ({
    ...annotation,
    points: annotation.points?.map((point) => ({ ...point }))
  }));
}

function createAnnotation(tool, id, x, y, options = {}) {
  const base = {
    id,
    type: tool,
    color: options.color || '#6366f1',
    size: options.size || 4
  };

  if (tool === 'pen') {
    return { ...base, points: [{ x, y }] };
  }

  if (tool === 'text') {
    return {
      ...base,
      x,
      y,
      text: options.text || '',
      fontSize: options.fontSize || (options.size || 4) * 4
    };
  }

  return { ...base, x1: x, y1: y, x2: x, y2: y };
}

function updateDraft(annotation, x, y) {
  if (!annotation) return annotation;
  if (annotation.type === 'pen') {
    annotation.points.push({ x, y });
  } else if (annotation.type !== 'text') {
    annotation.x2 = x;
    annotation.y2 = y;
  }
  return annotation;
}

function annotationBounds(annotation) {
  if (!annotation) return null;

  if (annotation.type === 'pen') {
    const xs = annotation.points.map((point) => point.x);
    const ys = annotation.points.map((point) => point.y);
    return {
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys)
    };
  }

  if (annotation.type === 'text') {
    const width = Math.max(24, annotation.text.length * annotation.fontSize * 0.58);
    return {
      left: annotation.x,
      top: annotation.y - annotation.fontSize,
      right: annotation.x + width,
      bottom: annotation.y + annotation.fontSize * 0.25
    };
  }

  return {
    left: Math.min(annotation.x1, annotation.x2),
    top: Math.min(annotation.y1, annotation.y2),
    right: Math.max(annotation.x1, annotation.x2),
    bottom: Math.max(annotation.y1, annotation.y2)
  };
}

function hitTestAnnotations(annotations, x, y, tolerance = 10) {
  for (let index = annotations.length - 1; index >= 0; index -= 1) {
    if (hitTestAnnotation(annotations[index], x, y, tolerance)) {
      return annotations[index].id;
    }
  }
  return null;
}

function hitTestAnnotation(annotation, x, y, tolerance) {
  if (annotation.type === 'arrow' || annotation.type === 'line') {
    return distanceToSegment(
      x, y,
      annotation.x1, annotation.y1,
      annotation.x2, annotation.y2
    ) <= tolerance + annotation.size;
  }

  if (annotation.type === 'pen') {
    return hitTestPen(annotation, x, y, tolerance);
  }

  const bounds = annotationBounds(annotation);
  return (
    x >= bounds.left - tolerance &&
    x <= bounds.right + tolerance &&
    y >= bounds.top - tolerance &&
    y <= bounds.bottom + tolerance
  );
}

function hitTestPen(annotation, x, y, tolerance) {
  const points = annotation.points || [];
  if (points.length === 1) {
    return Math.hypot(x - points[0].x, y - points[0].y) <= tolerance;
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (
      distanceToSegment(
        x, y,
        previous.x, previous.y,
        current.x, current.y
      ) <= tolerance + annotation.size
    ) {
      return true;
    }
  }
  return false;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function moveAnnotation(annotation, dx, dy) {
  if (!annotation) return;

  if (annotation.type === 'pen') {
    annotation.points.forEach((point) => {
      point.x += dx;
      point.y += dy;
    });
    return;
  }

  if (annotation.type === 'text') {
    annotation.x += dx;
    annotation.y += dy;
    return;
  }

  annotation.x1 += dx;
  annotation.y1 += dy;
  annotation.x2 += dx;
  annotation.y2 += dy;
}

function isMeaningfulAnnotation(annotation) {
  if (!annotation) return false;
  if (annotation.type === 'text') return annotation.text.trim().length > 0;
  if (annotation.type === 'pen') return annotation.points.length > 1;
  return Math.hypot(annotation.x2 - annotation.x1, annotation.y2 - annotation.y1) > 2;
}

export {
  annotationBounds,
  cloneAnnotations,
  createAnnotation,
  hitTestAnnotations,
  isMeaningfulAnnotation,
  moveAnnotation,
  updateDraft
};
