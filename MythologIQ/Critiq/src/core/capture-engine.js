// src/core/capture-engine.js
// Basic screen capture functionality using electron's desktopCapturer API

const { desktopCapturer } = require('electron');

/**
 * Captures a screen region and returns image data
 * @param {Object} options - Capture options (x, y, width, height)
 * @returns {Promise<string>} Base64 encoded image data
 */
async function captureScreen(options = {}) {
  try {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });

    // Validate sources array before accessing
    if (!sources || sources.length === 0) {
      throw new Error('No screen sources available. Check permissions.');
    }

    const source = sources[0];

    // Validate source has expected properties
    if (!source || !source.thumbnail) {
      throw new Error('Invalid screen source returned');
    }

    // Return the thumbnail as base64 data URL
    return source.thumbnail.toDataURL();
  } catch (error) {
    throw new Error(`Failed to capture screen: ${error.message}`);
  }
}

module.exports = { captureScreen };
