// src/utils/ai-formatter.js
// Format metadata for AI consumption

/**
 * Formats the annotated image data and notes into a structure suitable for AI consumption
 * @param {Object} annotatedData - {image: base64String, notes: Array, metadata: Object}
 * @returns {Object} Formatted data for AI consumption
 */
function formatForAI(annotatedData) {
  // Validate input
  if (!annotatedData || typeof annotatedData !== 'object') {
    throw new TypeError('annotatedData must be an object');
  }

  // Ensure notes is an array (defensive coding)
  const notes = Array.isArray(annotatedData.notes) ? annotatedData.notes : [];

  return {
    type: 'annotated_screenshot',
    timestamp: new Date().toISOString(),
    image_data: annotatedData.image || null,
    notes: notes.map(note => ({
      text: note.text || '',
      timestamp: note.timestamp || new Date().toISOString(),
      type: note.type || 'text'
    })),
    metadata: annotatedData.metadata || {}
  };
}

module.exports = { formatForAI };
