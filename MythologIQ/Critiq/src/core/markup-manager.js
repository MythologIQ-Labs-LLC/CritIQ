// src/core/markup-manager.js
// Basic markup drawing on canvas

/**
 * Draws a rectangle on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rect - {x, y, width, height}
 * @param {string} color - Stroke color
 */
function drawRectangle(ctx, rect, color) {
  ctx.strokeStyle = color;
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/**
 * Draws an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} ellipse - {x, y, width, height}
 * @param {string} color - Stroke color
 */
function drawEllipse(ctx, ellipse, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  const centerX = ellipse.x + ellipse.width / 2;
  const centerY = ellipse.y + ellipse.height / 2;
  const radiusX = ellipse.width / 2;
  const radiusY = ellipse.height / 2;
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Draws a line on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} line - {x1, y1, x2, y2}
 * @param {string} color - Stroke color
 */
function drawLine(ctx, line, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
}

/**
 * Draws text on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} textObj - {x, y, text, color, font}
 * @param {string} textObj.text - The text to draw
 * @param {string} textObj.color - Text color
 * @param {string} textObj.font - Font specification (e.g., '16px Arial')
 */
function drawText(ctx, textObj) {
  ctx.fillStyle = textObj.color;
  ctx.font = textObj.font;
  ctx.fillText(textObj.text, textObj.x, textObj.y);
}

module.exports = {
  drawRectangle,
  drawEllipse,
  drawLine,
  drawText
};