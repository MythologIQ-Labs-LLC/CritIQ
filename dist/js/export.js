// CritIQ - Export Module

import { invoke, session, state } from './state.js';
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
        image: getCompositeImage(),
        notes: state.notes,
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

  const selected = document.querySelector('input[name="export-format"]:checked');
  const format = selected ? selected.value : 'zip';
  persistActiveCapture();
  const captures = buildExportCaptures(session.captures);

  try {
    const result = await invoke('export_session', {
      captures,
      format,
      sessionId: session.id,
      createdAt: session.created
    });
    closeModal('export-modal');
    showNotification(`Exported to ${result.path}`, 'success');
  } catch (error) {
    showNotification('Export failed: ' + (error.message || error), 'error');
  }
}

export { saveAnnotatedImage, exportSession };
