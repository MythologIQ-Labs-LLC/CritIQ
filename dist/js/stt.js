// CritIQ - Speech-to-Text Engines Module

import { invoke, state } from './state.js';
import { showNotification } from './utils.js';

// Web Speech Engine
class WebSpeechEngine {
  constructor() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SR ? new SR() : null;
    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
    this.onResult = null;
    this.onEnd = null;
  }

  isAvailable() {
    return !!this.recognition;
  }

  start(onResult, onEnd) {
    if (!this.recognition) return false;

    this.onResult = onResult;
    this.onEnd = onEnd;

    this.recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      if (this.onResult) this.onResult(transcript, isFinal);
    };

    this.recognition.onend = () => {
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onerror = () => {
      if (this.onEnd) this.onEnd();
    };

    this.recognition.start();
    return true;
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

// Native Speech Engine (Tauri backend)
class NativeSpeechEngine {
  constructor() {
    this.available = null;
    this.onResult = null;
    this.onEnd = null;
    this.unlistenResult = null;
    this.unlistenEnd = null;
  }

  async isAvailable() {
    if (this.available === null) {
      try {
        this.available = await invoke('check_speech_available');
      } catch (e) {
        this.available = false;
      }
    }
    return this.available;
  }

  async start(onResult, onEnd) {
    this.onResult = onResult;
    this.onEnd = onEnd;

    try {
      const { listen } = window.__TAURI__.event;

      this.unlistenResult = await listen('speech-result', (event) => {
        if (this.onResult) {
          this.onResult(event.payload.transcript, event.payload.isFinal);
        }
      });

      this.unlistenEnd = await listen('speech-end', () => {
        if (this.onEnd) this.onEnd();
        this.cleanup();
      });

      await invoke('start_speech_recognition');
      return true;
    } catch (e) {
      if (this.onEnd) this.onEnd();
      return false;
    }
  }

  async stop() {
    try {
      await invoke('stop_speech_recognition');
    } catch (e) {
      // Ignore stop errors
    }
    this.cleanup();
  }

  cleanup() {
    if (this.unlistenResult) {
      this.unlistenResult();
      this.unlistenResult = null;
    }
    if (this.unlistenEnd) {
      this.unlistenEnd();
      this.unlistenEnd = null;
    }
  }
}

const sttEngines = {
  webspeech: WebSpeechEngine,
  native: NativeSpeechEngine
};

let currentSTTEngine = null;
let isRecording = false;

async function initSTT() {
  const engineType = state.settings.sttEngine;
  const EngineClass = sttEngines[engineType];

  if (!EngineClass) {
    return false;
  }

  currentSTTEngine = new EngineClass();
  const available = await currentSTTEngine.isAvailable();

  if (!available && engineType === 'native') {
    currentSTTEngine = new WebSpeechEngine();
    return currentSTTEngine.isAvailable();
  }

  return available;
}

function toggleRecording() {
  const micBtn = document.getElementById('mic-btn');
  const textarea = document.querySelector('#note-form textarea');

  if (isRecording) {
    if (currentSTTEngine) {
      currentSTTEngine.stop();
    }
    isRecording = false;
    micBtn.classList.remove('recording');
  } else {
    if (!currentSTTEngine) {
      initSTT().then(available => {
        if (available) {
          startRecordingInternal(micBtn, textarea);
        } else {
          showNotification('Speech recognition not available', 'error');
        }
      });
    } else {
      startRecordingInternal(micBtn, textarea);
    }
  }
}

function startRecordingInternal(micBtn, textarea) {
  const started = currentSTTEngine.start(
    (transcript, isFinal) => {
      if (isFinal) {
        textarea.value = (textarea.value + ' ' + transcript).trim();
      }
    },
    () => {
      isRecording = false;
      micBtn.classList.remove('recording');
    }
  );

  if (started !== false) {
    isRecording = true;
    micBtn.classList.add('recording');
    showNotification('Listening...');
  }
}

export { toggleRecording, initSTT };
