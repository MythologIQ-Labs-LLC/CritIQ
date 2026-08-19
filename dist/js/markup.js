// CritIQ - Markup/Canvas Module

import { state, setCanvas, setBaseImage, getCanvas, getBaseImage } from './state.js';
import { renderNotes } from './notes.js';

function updatePreview(imageData) {
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

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.width = img.width + 'px';
    canvas.style.height = img.height + 'px';
    const ctx = canvas.getContext('2d');

    setCanvas(canvas, ctx);
    setBaseImage(img);

    canvasContainer.appendChild(img);
    canvasContainer.appendChild(canvas);

    setupCanvasEvents(canvas);
  };

  container.appendChild(canvasContainer);
  document.getElementById('save-btn').disabled = false;
  document.getElementById('markup-tools').style.display = 'flex';
}

function clearPreview() {
  const container = document.getElementById('preview');
  setCanvas(null, null);
  setBaseImage(null);
  if (container) {
    container.innerHTML = '<p class="placeholder">Click "Capture" to add the first storyboard frame</p>';
  }
  document.getElementById('save-btn').disabled = true;
  document.getElementById('markup-tools').style.display = 'none';
  state.currentImage = null;
  state.notes = [];
  renderNotes();
}

function setupCanvasEvents(canvas) {
  if (!canvas) return;

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
}

function getCanvasCoords(e) {
  const { canvas } = getCanvas();
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function handleMouseDown(e) {
  const { ctx } = getCanvas();
  const { x, y } = getCanvasCoords(e);
  state.markup.isDrawing = true;
  state.markup.startX = x;
  state.markup.startY = y;

  if (state.markup.tool === 'pen') {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = state.markup.color;
    ctx.lineWidth = state.markup.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  } else if (state.markup.tool === 'text') {
    showTextInput(x, y);
  }

  saveCanvasState();
}

function handleMouseMove(e) {
  if (!state.markup.isDrawing) return;
  const { ctx } = getCanvas();
  const { x, y } = getCanvasCoords(e);

  if (state.markup.tool === 'pen') {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (state.markup.tool === 'rect' || state.markup.tool === 'arrow') {
    restoreCanvasState();
    drawShape(state.markup.startX, state.markup.startY, x, y);
  }
}

function handleMouseUp() {
  if (!state.markup.isDrawing) return;
  const { ctx } = getCanvas();
  state.markup.isDrawing = false;

  if (state.markup.tool === 'pen') {
    ctx.closePath();
  }
}

function drawShape(x1, y1, x2, y2) {
  const { ctx } = getCanvas();
  ctx.strokeStyle = state.markup.color;
  ctx.lineWidth = state.markup.size;
  ctx.lineCap = 'round';

  if (state.markup.tool === 'rect') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (state.markup.tool === 'arrow') {
    drawArrow(x1, y1, x2, y2);
  }
}

function drawArrow(x1, y1, x2, y2) {
  const { ctx } = getCanvas();
  const headLen = 15;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function showTextInput(x, y) {
  const { ctx } = getCanvas();
  const overlay = document.createElement('div');
  overlay.className = 'text-input-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'text-input-dialog';
  dialog.innerHTML = `
    <input type="text" id="text-input" placeholder="Enter text..." autofocus>
    <div class="dialog-buttons">
      <button id="text-cancel" class="btn btn-secondary">Cancel</button>
      <button id="text-ok" class="btn btn-primary">Add</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const input = document.getElementById('text-input');
  input.focus();

  const addText = () => {
    const text = input.value.trim();
    if (text) {
      ctx.font = `${state.markup.size * 4}px sans-serif`;
      ctx.fillStyle = state.markup.color;
      ctx.fillText(text, x, y);
    }
    overlay.remove();
    state.markup.isDrawing = false;
  };

  document.getElementById('text-ok').addEventListener('click', addText);
  document.getElementById('text-cancel').addEventListener('click', () => {
    overlay.remove();
    state.markup.isDrawing = false;
  });
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addText();
  });
}

function saveCanvasState() {
  const { canvas, ctx } = getCanvas();
  if (!ctx) return;
  state.markup.history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (state.markup.history.length > 50) {
    state.markup.history.shift();
  }
}

function restoreCanvasState() {
  const { ctx } = getCanvas();
  if (state.markup.history.length > 0) {
    ctx.putImageData(state.markup.history[state.markup.history.length - 1], 0, 0);
  }
}

function undo() {
  const { canvas, ctx } = getCanvas();
  if (!canvas || !ctx) return;
  if (state.markup.history.length > 1) {
    state.markup.history.pop();
    restoreCanvasState();
  } else if (state.markup.history.length === 1) {
    state.markup.history.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function clearCanvas() {
  const { canvas, ctx } = getCanvas();
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.markup.history = [];
}

function getCompositeImage() {
  const { canvas } = getCanvas();
  const baseImage = getBaseImage();
  if (!canvas || !baseImage) return state.currentImage;

  const composite = document.createElement('canvas');
  composite.width = canvas.width;
  composite.height = canvas.height;
  const compCtx = composite.getContext('2d');

  compCtx.drawImage(baseImage, 0, 0);
  compCtx.drawImage(canvas, 0, 0);

  return composite.toDataURL('image/png');
}

export {
  updatePreview,
  clearPreview,
  undo,
  clearCanvas,
  getCompositeImage
};
