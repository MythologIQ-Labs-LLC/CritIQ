// CritIQ - Shared application state

const { invoke } = window.__TAURI__.core;

const session = {
  id: null,
  captures: [],
  activeIndex: -1,
  created: null
};

const state = {
  currentImage: null,
  originalImage: null,
  notes: [],
  metadata: {},
  markup: {
    tool: 'pen',
    color: '#6366f1',
    size: 4,
    annotations: [],
    history: [],
    selectedId: null,
    draft: null,
    isDrawing: false,
    dragX: 0,
    dragY: 0,
    dragMoved: false
  },
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0,
    panMode: false,
    isPanning: false,
    startX: 0,
    startY: 0
  },
  preferences: {
    imageFormat: 'png',
    jpegQuality: 90,
    imageScale: 100
  }
};

let canvas = null;
let ctx = null;
let baseImage = null;

function setCanvas(nextCanvas, context) {
  canvas = nextCanvas;
  ctx = context;
}

function setBaseImage(image) {
  baseImage = image;
}

function getCanvas() {
  return { canvas, ctx };
}

function getBaseImage() {
  return baseImage;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
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
