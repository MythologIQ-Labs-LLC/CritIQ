// CritIQ - Save and storyboard export

import { invoke, session, state } from './state.js';
import { cloneAnnotations } from './annotations.js';
import { getCompositeImage } from './markup.js';
import { persistActiveCapture } from './session.js';
import { buildExportCaptures } from './storyboard.js';
import { showNotification, closeModal } from './utils.js';

async function saveAnnotatedImage() {
  if (!state.currentImage) {
    showNotification('No image to save', 'error');
    return;
  }

  try {
    const result = await invoke('save_annotated_image', {
      data: {
        image: getCompositeImage('png', 1) || state.currentImage,
        notes: state.notes,
        annotations: cloneAnnotations(state.markup.annotations),
        metadata: state.metadata
      },
      outputDir: ''
    });
    showNotification(`Saved to ${result.image_path}`, 'success');
  } catch (error) {
    showNotification('Save failed: ' + (error.message || error), 'error');
  }
}

async function exportSession() {
  if (session.captures.length === 0) return;

  persistActiveCapture();
  const format = selectedExportFormat();
  const captures = buildExportCaptures(session.captures);

  try {
    const formattedCaptures = await formatCaptureImages(captures);
    const result = await invoke('export_session', {
      captures: formattedCaptures,
      format,
      sessionId: session.id,
      createdAt: session.created
    });
    closeModal('export-modal');
    showNotification(`Exported ${result.count} frames to ${result.path}`, 'success');
  } catch (error) {
    showNotification('Export failed: ' + (error.message || error), 'error');
  }
}

function selectedExportFormat() {
  const selected = document.querySelector('input[name="export-format"]:checked');
  return selected?.value || 'zip';
}

async function formatCaptureImages(captures) {
  const format = state.preferences.imageFormat;
  const quality = state.preferences.jpegQuality / 100;
  const scale = state.preferences.imageScale / 100;
  if (format === 'png' && scale === 1) return captures;

  return Promise.all(captures.map(async (capture) => ({
    ...capture,
    image: await convertImageDataUrl(capture.image, format, quality, scale)
  })));
}

function convertImageDataUrl(dataUrl, format, quality, scale) {
  const alreadyFormatted =
    (format === 'png' && dataUrl.startsWith('data:image/png')) ||
    (format === 'jpeg' && dataUrl.startsWith('data:image/jpeg'));
  if (alreadyFormatted && scale === 1) return Promise.resolve(dataUrl);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      resolve(canvas.toDataURL(mimeType, quality));
    };
    image.onerror = () => reject(new Error('Could not convert storyboard image'));
    image.src = dataUrl;
  });
}

export { exportSession, saveAnnotatedImage };
