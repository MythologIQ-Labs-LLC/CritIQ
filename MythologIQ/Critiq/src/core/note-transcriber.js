// src/core/note-transcriber.js
// Voice and text input for notes

// Feature detection for Speech Recognition API
const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

/**
 * Checks if speech recognition is available
 * @returns {boolean} True if speech recognition is supported
 */
function isSpeechAvailable() {
  return SpeechRecognition !== null && SpeechRecognition !== undefined;
}

/**
 * Transcribes voice input to text
 * @param {Function} onResult - Callback function to handle transcription result
 * @param {Function} onError - Callback function to handle errors
 * @returns {SpeechRecognition|null} The speech recognition object or null
 */
function startVoiceTranscription(onResult, onError) {
  if (!isSpeechAvailable()) {
    if (onError) onError('Speech recognition not supported');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  recognition.start();
  return recognition;
}

/**
 * Stops the voice transcription
 * @param {SpeechRecognition} recognition - The speech recognition object to stop
 */
function stopVoiceTranscription(recognition) {
  if (recognition) {
    recognition.stop();
  }
}

/**
 * Handles text input for notes
 * @param {string} text - The text input from the user
 * @returns {Object} Note object with text and timestamp
 */
function createTextNote(text) {
  return {
    text: text,
    timestamp: new Date().toISOString(),
    type: 'text'
  };
}

module.exports = {
  isSpeechAvailable,
  startVoiceTranscription,
  stopVoiceTranscription,
  createTextNote
};
