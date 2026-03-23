// CritIQ - Shared State Module
// Centralized state management for the application

const { invoke } = window.__TAURI__.core;

// Session state
const session = {
  id: null,
  captures: [],
  activeIndex: -1,
  created: null
};

// Application state
const state = {
  currentImage: null,
  originalImage: null,
  notes: [],
  metadata: {},
  markup: {
    tool: 'pen',
    color: '#6366f1',
    size: 4,
    history: [],
    isDrawing: false,
    startX: 0,
    startY: 0
  },
  settings: {
    sttEngine: localStorage.getItem('stt-engine') || 'webspeech',
    autoSave: localStorage.getItem('auto-save') === 'true',
    captureFormat: localStorage.getItem('capture-format') || 'png'
  }
};

// DOM element references (set during init)
let canvas = null;
let ctx = null;
let baseImage = null;

function setCanvas(c, context) {
  canvas = c;
  ctx = context;
}

function setBaseImage(img) {
  baseImage = img;
}

function getCanvas() {
  return { canvas, ctx };
}

function getBaseImage() {
  return baseImage;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export {
  invoke,
  session,
  state,
  setCanvas,
  setBaseImage,
  getCanvas,
  getBaseImage,
  generateId
};
