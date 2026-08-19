// CritIQ - Ordered storyboard filmstrip

import { session } from './state.js';

let renderRevision = 0;

function generateThumbnail(imageData, width = 80, height = 60) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const srcRatio = img.width / img.height;
      const dstRatio = width / height;
      let sx = 0;
      let sy = 0;
      let sw = img.width;
      let sh = img.height;

      if (srcRatio > dstRatio) {
        sw = img.height * dstRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / dstRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(null);
    img.src = imageData;
  });
}

function renderFilmstrip() {
  const container = document.getElementById('filmstrip-inner');
  if (!container) return;
  container.innerHTML = '';
  const revision = ++renderRevision;

  import('./session.js').then(({ switchCapture, removeCapture, moveCapture }) => {
    if (revision !== renderRevision) return;
    container.innerHTML = '';
    session.captures.forEach((capture, index) => {
      container.appendChild(
        createThumbnail(capture, index, switchCapture, removeCapture, moveCapture)
      );
    });
  });

  const filmstrip = document.getElementById('filmstrip');
  if (filmstrip) filmstrip.style.display = session.captures.length ? 'flex' : 'none';
}

function createThumbnail(capture, index, switchCapture, removeCapture, moveCapture) {
  const thumb = document.createElement('div');
  thumb.className = 'filmstrip-thumb' + (index === session.activeIndex ? ' active' : '');
  thumb.dataset.index = index;
  thumb.title = `Frame ${index + 1}`;
  thumb.tabIndex = 0;
  thumb.setAttribute('role', 'button');
  thumb.setAttribute('aria-label', `Open frame ${index + 1}`);

  if (capture.thumbnail) {
    const img = document.createElement('img');
    img.src = capture.thumbnail;
    img.alt = `Frame ${index + 1}`;
    thumb.appendChild(img);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className = 'thumb-placeholder';
    placeholder.textContent = index + 1;
    thumb.appendChild(placeholder);
  }

  const sequence = document.createElement('span');
  sequence.className = 'thumb-sequence';
  sequence.textContent = index + 1;
  thumb.appendChild(sequence);

  thumb.appendChild(actionButton('←', 'Move frame left', 'thumb-move left', () => {
    moveCapture(index, -1);
  }, index === 0));
  thumb.appendChild(actionButton('→', 'Move frame right', 'thumb-move right', () => {
    moveCapture(index, 1);
  }, index === session.captures.length - 1));
  thumb.appendChild(actionButton('×', 'Remove frame', 'thumb-delete', () => {
    removeCapture(index);
  }));

  thumb.addEventListener('click', () => switchCapture(index));
  thumb.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      switchCapture(index);
    }
  });
  return thumb;
}

function actionButton(text, title, className, action, disabled = false) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.title = title;
  button.disabled = disabled;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    action();
  });
  return button;
}

function updateExportButton() {
  const exportButton = document.getElementById('export-btn');
  if (exportButton) exportButton.disabled = session.captures.length === 0;
}

export { generateThumbnail, renderFilmstrip, updateExportButton };
