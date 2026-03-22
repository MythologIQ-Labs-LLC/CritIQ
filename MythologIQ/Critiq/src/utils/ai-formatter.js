// src/utils/ai-formatter.js
// Format metadata for AI consumption

/**
 * Formats the annotated image data and notes into a structure suitable for AI consumption
 * @param {Object} annotatedData - {image: base64String, notes: Array, metadata: Object}
 * @returns {Object} Formatted data for AI consumption
 */
function formatForAI(annotatedData) {
  // In a real implementation, we would create a structured format that AI agents can easily understand
  // For now, we'll return a simplified version
  return {
    type: 'annotated_screenshot',
    timestamp: new Date().toISOString(),
    image_data: annotatedData.image,
    notes: annotatedData.notes.map(note => ({
      text: note.text,
      timestamp: note.timestamp,
      type: note.type
    })),
    metadata: annotatedData.metadata
  };
}

module.exports = { formatForAI };