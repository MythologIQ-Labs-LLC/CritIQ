// CritIQ - Annotation rendering and image compositing

import { annotationBounds } from './annotations.js';

function renderAnnotations(ctx, annotations, selectedId = null, draft = null) {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  annotations.forEach((annotation) => drawAnnotation(ctx, annotation));
  if (draft) drawAnnotation(ctx, draft);

  if (selectedId) {
    const selected = annotations.find((annotation) => annotation.id === selectedId);
    if (selected) drawSelection(ctx, selected);
  }
}

function drawAnnotation(ctx, annotation) {
  ctx.save();
  ctx.strokeStyle = annotation.color;
  ctx.fillStyle = annotation.color;
  ctx.lineWidth = annotation.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (annotation.type) {
    case 'pen':
      drawPen(ctx, annotation);
      break;
    case 'line':
      drawLine(ctx, annotation);
      break;
    case 'arrow':
      drawArrow(ctx, annotation);
      break;
    case 'rect':
      ctx.strokeRect(
        annotation.x1,
        annotation.y1,
        annotation.x2 - annotation.x1,
        annotation.y2 - annotation.y1
      );
      break;
    case 'ellipse':
      drawEllipse(ctx, annotation);
      break;
    case 'text':
      ctx.font = `${annotation.fontSize}px sans-serif`;
      ctx.fillText(annotation.text, annotation.x, annotation.y);
      break;
  }

  ctx.restore();
}

function drawPen(ctx, annotation) {
  const points = annotation.points || [];
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.stroke();
}

function drawLine(ctx, annotation) {
  ctx.beginPath();
  ctx.moveTo(annotation.x1, annotation.y1);
  ctx.lineTo(annotation.x2, annotation.y2);
  ctx.stroke();
}

function drawArrow(ctx, annotation) {
  const { x1, y1, x2, y2 } = annotation;
  const headLength = Math.max(14, annotation.size * 4);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function drawEllipse(ctx, annotation) {
  const centerX = (annotation.x1 + annotation.x2) / 2;
  const centerY = (annotation.y1 + annotation.y2) / 2;
  const radiusX = Math.abs(annotation.x2 - annotation.x1) / 2;
  const radiusY = Math.abs(annotation.y2 - annotation.y1) / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSelection(ctx, annotation) {
  const bounds = annotationBounds(annotation);
  if (!bounds) return;

  const padding = Math.max(6, annotation.size * 2);
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(
    bounds.left - padding,
    bounds.top - padding,
    bounds.right - bounds.left + padding * 2,
    bounds.bottom - bounds.top + padding * 2
  );
  ctx.restore();
}

function composeImage(baseImage, width, height, annotations, format = 'png', quality = 0.9) {
  if (!baseImage || !width || !height) return null;

  const composite = document.createElement('canvas');
  composite.width = width;
  composite.height = height;
  const ctx = composite.getContext('2d');

  ctx.drawImage(baseImage, 0, 0, width, height);
  annotations.forEach((annotation) => drawAnnotation(ctx, annotation));

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return composite.toDataURL(mimeType, quality);
}

export { composeImage, renderAnnotations };
