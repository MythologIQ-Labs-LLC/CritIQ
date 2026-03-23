// CritIQ - Filmstrip Module

import { session } from './state.js';

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
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

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

  // Import dynamically to avoid circular dependency
  import('./session.js').then(({ switchCapture, removeCapture }) => {
    session.captures.forEach((capture, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'filmstrip-thumb' + (index === session.activeIndex ? ' active' : '');
      thumb.dataset.index = index;

      if (capture.thumbnail) {
        const img = document.createElement('img');
        img.src = capture.thumbnail;
        img.alt = `Capture ${index + 1}`;
        thumb.appendChild(img);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'thumb-placeholder';
        placeholder.textContent = index + 1;
        thumb.appendChild(placeholder);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'thumb-delete';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Remove';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCapture(index);
      });
      thumb.appendChild(deleteBtn);

      thumb.addEventListener('click', () => switchCapture(index));
      container.appendChild(thumb);
    });
  });

  const filmstrip = document.getElementById('filmstrip');
  if (filmstrip) {
    filmstrip.style.display = session.captures.length > 0 ? 'flex' : 'none';
  }
}

function updateExportButton() {
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.disabled = session.captures.length === 0;
  }
}

export {
  generateThumbnail,
  renderFilmstrip,
  updateExportButton
};
