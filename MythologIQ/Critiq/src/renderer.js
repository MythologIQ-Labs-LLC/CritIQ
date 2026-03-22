// src/renderer.js
// Browser-compatible renderer entry point (no require())

// Simple event bus for browser context
const eventBus = {
  listeners: new Map(),

  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(fn => {
      try { fn(data); } catch (e) { console.error('Handler error:', e); }
    });
  },

  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  },

  off(event, handler) {
    const handlers = this.listeners.get(event) || [];
    this.listeners.set(event, handlers.filter(fn => fn !== handler));
  }
};

// UI Module: Main Window
const mainWindow = {
  init(bus) {
    bus.on('capture-complete', (imageData) => {
      bus.emit('preview-update', imageData);
    });
    bus.on('save-complete', (filePath) => {
      bus.emit('notification', { type: 'success', message: `Saved: ${filePath}` });
    });
  }
};

// UI Module: Markup Toolbar
const markupToolbar = {
  clickHandler: null,

  init(bus) {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) return;

    if (this.clickHandler) {
      toolbar.removeEventListener('click', this.clickHandler);
    }

    this.clickHandler = (event) => {
      const tool = event.target.dataset.tool;
      if (tool) bus.emit('tool-selected', { tool });
    };

    toolbar.addEventListener('click', this.clickHandler);
  }
};

// UI Module: Screenshot Preview (XSS-safe)
const screenshotPreview = {
  init(bus) {
    bus.on('preview-update', (imageData) => {
      const container = document.getElementById('preview');
      if (!container || !imageData) return;

      // XSS-safe: use DOM API instead of innerHTML
      const img = document.createElement('img');
      img.src = imageData;
      img.alt = 'Screenshot preview';
      container.replaceChildren(img);
    });
  }
};

// UI Module: Note Input Panel
const noteInputPanel = {
  submitHandler: null,

  init(bus) {
    const notesPanel = document.getElementById('notes');
    if (!notesPanel) return;

    if (this.submitHandler) {
      notesPanel.removeEventListener('submit', this.submitHandler);
    }

    this.submitHandler = (event) => {
      event.preventDefault();
      const textarea = event.target.querySelector('textarea');
      if (textarea && textarea.value) {
        bus.emit('note-added', {
          text: textarea.value,
          timestamp: new Date().toISOString()
        });
        textarea.value = '';
      }
    };

    notesPanel.addEventListener('submit', this.submitHandler);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  mainWindow.init(eventBus);
  markupToolbar.init(eventBus);
  screenshotPreview.init(eventBus);
  noteInputPanel.init(eventBus);

  // Connect to preload API if available
  if (window.critiqAPI) {
    window.critiqAPI.onCaptureComplete((event, data) => {
      eventBus.emit('capture-complete', data);
    });
  }
});
