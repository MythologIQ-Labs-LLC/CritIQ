// CritIQ - Speech-to-Text Module

import { showNotification } from './utils.js';

class WebSpeechEngine {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  isAvailable() {
    return !!this.recognition;
  }

  start(onResult, onEnd) {
    if (!this.recognition) return false;

    this.recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      onResult(transcript, isFinal);
    };
    this.recognition.onend = onEnd;
    this.recognition.onerror = onEnd;
    this.recognition.start();
    return true;
  }

  stop() {
    if (this.recognition) this.recognition.stop();
  }
}

let currentSTTEngine = null;
let isRecording = false;

function initSTT() {
  currentSTTEngine = new WebSpeechEngine();
  return currentSTTEngine.isAvailable();
}

function toggleRecording() {
  const micBtn = document.getElementById('mic-btn');
  const textarea = document.querySelector('#note-form textarea');

  if (isRecording) {
    currentSTTEngine?.stop();
    finishRecording(micBtn);
    return;
  }

  if (!currentSTTEngine && !initSTT()) {
    showNotification('Speech recognition not available', 'error');
    return;
  }

  const started = currentSTTEngine.start(
    (transcript, isFinal) => {
      if (isFinal) textarea.value = `${textarea.value} ${transcript}`.trim();
    },
    () => finishRecording(micBtn)
  );

  if (started) {
    isRecording = true;
    micBtn.classList.add('recording');
    showNotification('Listening...');
  }
}

function finishRecording(micBtn) {
  isRecording = false;
  micBtn.classList.remove('recording');
}

export { toggleRecording, initSTT };
