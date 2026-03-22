# Architecture Plan

## Risk Grade: L1

### Risk Assessment

- [ ] Contains security/auth logic -> L3
- [ ] Modifies existing APIs -> L2
- [x] UI-only changes -> L1

## File Tree (The Contract)

src/
|-- main.js (Electron main process entry)
|-- preload.js (Secure context bridge)
|-- renderer.js (Renderer process entry)
|-- core/
| |-- event-bus.js (Pub/sub for UI communication)
| |-- capture-engine.js
| |-- markup-manager.js
| |-- note-transcriber.js
| |-- metadata-injector.js
|-- ui/
| |-- main-window.js
| |-- markup-toolbar.js
| |-- screenshot-preview.js
| |-- note-input-panel.js
|-- utils/
| |-- file-handler.js
| |-- image-processor.js
| |-- ai-formatter.js

index.html (Renderer HTML entry)
styles.css (Application styles)

## Interface Contracts

### Capture Engine

- **Input**: Screen coordinates, capture trigger event
- **Output**: Raw image data (base64 or blob)
- **Side Effects**: Temporary file storage, clipboard access

### Markup Manager

- **Input**: Image data, markup annotations (shapes, text, highlights)
- **Output**: Annotated image data
- **Side Effects**: Canvas manipulation, layer management

### Note Transcriber

- **Input**: Voice or text input from user
- **Output**: Transcribed text with timestamps
- **Side Effects**: Audio processing, text storage

### Metadata Injector

- **Input**: Annotated image, transcribed notes, capture metadata
- **Output**: Enhanced image with embedded metadata or sidecar file
- **Side Effects**: File I/O, metadata formatting

### Main Window

- **Input**: User interactions, system events
- **Output**: UI state updates, component communications
- **Side Effects**: DOM manipulation, event handling

### Markup Toolbar

- **Input**: Tool selection, color/size preferences
- **Output**: Markup commands to markup manager
- **Side Effects**: UI state updates

### Screenshot Preview

- **Input**: Image data, markup overlays
- **Output**: Visual preview with annotations
- **Side Effects**: Canvas rendering, zoom/pan handling

### Note Input Panel

- **Input**: Text/voice input, submit actions
- **Output**: Note data to metadata injector
- **Side Effects**: Form validation, input processing

## Data Flow

[User Action] -> [Capture Engine] -> [Markup Manager] -> [Note Input Panel] -> [Metadata Injector] -> [File Output/UI Display]

## Dependencies

| Package            | Justification                                  | Vanilla Alternative                      |
| ------------------ | ---------------------------------------------- | ---------------------------------------- |
| electron           | Cross-platform desktop app with screen capture | Native platform APIs (much more complex) |
| canvas-api         | Image manipulation and markup rendering        | Manual pixel manipulation (inefficient)  |
| speech-recognition | Voice-to-text for note taking                  | Manual typing only (less accessible)     |
| jsonschema         | Metadata validation and structure              | Custom validation (more error-prone)     |

## Section 4 Razor Pre-Check

- [x] All planned functions <= 40 lines
- [x] All planned files <= 250 lines
- [x] No planned nesting > 3 levels

---

_Blueprint sealed. Awaiting GATE tribunal._
