// CritIQ - Export Module

import { invoke, session, state, getCanvas } from './state.js';
import { getCompositeImage } from './markup.js';
import { showNotification, closeModal } from './utils.js';

async function saveAnnotatedImage() {
  if (!state.currentImage) {
    showNotification('No image to save', 'error');
    return;
  }

  try {
    const compositeImage = getCompositeImage();
    const result = await invoke('save_annotated_image', {
      data: {
        image: compositeImage,
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
  const formatRadio = document.querySelector('input[name="export-format"]:checked');
  const format = formatRadio ? formatRadio.value : 'individual';

  const { canvas, ctx } = getCanvas();

  if (session.activeIndex >= 0 && session.activeIndex < session.captures.length && canvas) {
    const current = session.captures[session.activeIndex];
    current.markup = ctx.getImageData(0, 0, canvas.width, canvas.height);
    current.notes = [...state.notes];
  }

  const captures = session.captures.map((cap) => {
    return {
      id: cap.id,
      image: cap.image,
      notes: cap.notes,
      timestamp: cap.timestamp,
      metadata: cap.metadata
    };
  });

  try {
    const result = await invoke('export_session', {
      captures,
      format,
      sessionId: session.id
    });

    closeModal('export-modal');
    showNotification(`Exported to ${result.path}`, 'success');
  } catch (error) {
    if (format === 'individual' || format === 'markdown') {
      exportLocalFallback(captures, format);
    } else {
      showNotification('Export failed: ' + (error.message || error), 'error');
    }
  }
}

function exportLocalFallback(captures, format) {
  if (format === 'markdown') {
    let md = `# CritIQ Session Export\n\nExported: ${new Date().toISOString()}\n\n`;

    captures.forEach((cap, index) => {
      md += `## Capture ${index + 1}\n\n`;
      md += `**Timestamp:** ${cap.timestamp}\n\n`;
      if (cap.notes && cap.notes.length > 0) {
        md += `### Notes\n\n`;
        cap.notes.forEach(note => {
          md += `- ${note.text} _(${new Date(note.timestamp).toLocaleTimeString()})_\n`;
        });
        md += '\n';
      }
      md += `![Capture ${index + 1}](capture_${index + 1}.png)\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `critiq_session_${session.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    closeModal('export-modal');
    showNotification('Markdown exported (images need manual save)', 'success');
  }
}

export {
  saveAnnotatedImage,
  exportSession
};
