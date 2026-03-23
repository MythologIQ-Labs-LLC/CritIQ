# Plan: VETO Remediation - Wire Skeleton

## Open Questions

- Should `index.html` include a bundler (webpack/vite) or use vanilla script tags?
- What is the default window size for optimal screenshot workflow?

---

## Phase 1: Missing Files - Build Path Foundation

### Affected Files

- `index.html` (NEW) - Electron renderer entry point
- `src/preload.js` (NEW) - Secure context bridge with minimal API
- `src/main.js` - Fix path reference for preload

### Changes

**index.html** (root directory):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
  <title>Critiq</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <div id="toolbar"></div>
    <div id="preview"></div>
    <div id="notes"></div>
  </div>
  <script src="src/renderer.js"></script>
</body>
</html>
```

**src/preload.js**:
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('critiqAPI', {
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  saveFile: (data, path) => ipcRenderer.invoke('save-file', data, path),
  onCaptureComplete: (callback) => ipcRenderer.on('capture-complete', callback)
});
```

**src/main.js** - Update preload path:
```javascript
// Line 13: Fix path to be relative to src/
preload: path.join(__dirname, 'preload.js')
```

### Unit Tests

- `tests/preload.test.js` - Verify context bridge exposes only allowed methods
- `tests/main.test.js` - Verify window creation and IPC handler registration

---

## Phase 2: Event Bus - Decoupled Communication

### Affected Files

- `src/core/event-bus.js` (NEW) - Simple pub/sub for module communication
- `src/renderer.js` (NEW) - Renderer entry point, initializes UI modules

### Changes

**src/core/event-bus.js**:
```javascript
const listeners = new Map();

function emit(event, data) {
  const handlers = listeners.get(event) || [];
  handlers.forEach(fn => fn(data));
}

function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(handler);
  return () => off(event, handler);
}

function off(event, handler) {
  const handlers = listeners.get(event) || [];
  listeners.set(event, handlers.filter(fn => fn !== handler));
}

module.exports = { emit, on, off };
```

**src/renderer.js**:
```javascript
const eventBus = require('./core/event-bus');
const mainWindow = require('./ui/main-window');
const markupToolbar = require('./ui/markup-toolbar');
const screenshotPreview = require('./ui/screenshot-preview');
const noteInputPanel = require('./ui/note-input-panel');

// Initialize all UI modules with event bus
mainWindow.init(eventBus);
markupToolbar.init(eventBus);
screenshotPreview.init(eventBus);
noteInputPanel.init(eventBus);
```

### Unit Tests

- `tests/event-bus.test.js` - Verify emit/on/off behavior, handler cleanup

---

## Phase 3: UI Module Wiring - Connect Orphans

### Affected Files

- `src/ui/main-window.js` - Add init function, event subscriptions
- `src/ui/markup-toolbar.js` - Add init function, tool selection events
- `src/ui/screenshot-preview.js` - Add init function, image display events
- `src/ui/note-input-panel.js` - Add init function, note submission events
- `src/main.js` - Register IPC handlers connecting to core modules

### Changes

**src/ui/main-window.js**:
```javascript
let bus = null;

function init(eventBus) {
  bus = eventBus;
  bus.on('capture-complete', handleCaptureComplete);
  bus.on('save-complete', handleSaveComplete);
}

function handleCaptureComplete(imageData) {
  bus.emit('preview-update', imageData);
}

function handleSaveComplete(filePath) {
  bus.emit('notification', { type: 'success', message: `Saved: ${filePath}` });
}

module.exports = { init };
```

**src/ui/markup-toolbar.js**:
```javascript
let bus = null;

function init(eventBus) {
  bus = eventBus;
  document.getElementById('toolbar').addEventListener('click', handleToolClick);
}

function handleToolClick(event) {
  const tool = event.target.dataset.tool;
  if (tool) bus.emit('tool-selected', { tool });
}

module.exports = { init };
```

**src/ui/screenshot-preview.js**:
```javascript
let bus = null;

function init(eventBus) {
  bus = eventBus;
  bus.on('preview-update', renderPreview);
}

function renderPreview(imageData) {
  const container = document.getElementById('preview');
  container.innerHTML = `<img src="${imageData}" alt="Screenshot preview">`;
}

module.exports = { init };
```

**src/ui/note-input-panel.js**:
```javascript
let bus = null;

function init(eventBus) {
  bus = eventBus;
  document.getElementById('notes').addEventListener('submit', handleNoteSubmit);
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const text = event.target.querySelector('textarea').value;
  bus.emit('note-added', { text, timestamp: new Date().toISOString() });
}

module.exports = { init };
```

**src/main.js** - Add IPC handlers (append after window creation):
```javascript
const { ipcMain } = require('electron');
const { captureScreen } = require('./core/capture-engine');
const { saveAnnotatedImage } = require('./utils/file-handler');

ipcMain.handle('capture-screen', async () => {
  return await captureScreen();
});

ipcMain.handle('save-file', async (event, data, outputPath) => {
  return await saveAnnotatedImage(data, outputPath);
});
```

### Unit Tests

- `tests/ui/main-window.test.js` - Verify event subscriptions and handlers
- `tests/ui/markup-toolbar.test.js` - Verify tool click emits correct event
- `tests/ui/screenshot-preview.test.js` - Verify preview renders on event
- `tests/ui/note-input-panel.test.js` - Verify form submission emits note event

---

## Phase 4: Styles - Minimal Layout

### Affected Files

- `styles.css` (NEW) - Basic layout for app structure

### Changes

**styles.css**:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

#toolbar { padding: 8px; border-bottom: 1px solid #ccc; }
#preview { flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; }
#notes { padding: 8px; border-top: 1px solid #ccc; }
```

### Unit Tests

None - CSS validated by visual inspection

---

## Verification Checklist

After implementation, `/ql-audit` should pass:

- [ ] No orphan files (all modules connected via renderer.js or main.js)
- [ ] No ghost UI (all UI modules export init function with event handlers)
- [ ] No missing files (index.html, preload.js, renderer.js, styles.css exist)
- [ ] Build path complete (app can launch)
