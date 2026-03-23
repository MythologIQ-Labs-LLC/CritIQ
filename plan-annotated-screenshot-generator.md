# Plan: Annotated Screenshot Generator

## Open Questions

- What image formats should be supported for output? (PNG, JPEG, etc.)
- Should the markup be vector-based or raster-based?
- How should the transcribed notes be stored? (sidecar file, embedded metadata, or both?)
- What keyboard shortcuts should be available for common markup tools?

## Phase 1: Core Capture and Markup Engine

### Affected Files

- src/core/capture-engine.js - Basic screen capture functionality
- src/core/markup-manager.js - Basic markup drawing on canvas
- src/ui/main-window.js - Basic UI container for the application
- src/ui/markup-toolbar.js - Basic toolbar for selecting markup tools
- src/ui/screenshot-preview.js - Basic preview of captured image

### Changes

- capture-engine.js: Implement screen capture using electron's desktopCapturer API
- markup-manager.js: Implement basic drawing of shapes (rectangle, ellipse, line) and text on HTML5 canvas
- main-window.js: Create a basic Electron BrowserWindow with menu and webview for UI
- markup-toolbar.js: Create a toolbar with buttons for selecting markup tools (select, rectangle, ellipse, line, text, color picker)
- screenshot-preview.js: Display the captured image in a canvas and allow basic zoom/pan

### Unit Tests

- tests/core/capture-engine-test.js - Test that capture-engine can capture a screen region and return image data
- tests/core/markup-manager-test.js - Test that markup-manager can draw shapes and text on a canvas
- tests/ui/main-window-test.js - Test that main-window creates a window and loads the UI
- tests/ui/markup-toolbar-test.js - Test that markup-toolbar emits events when tools are selected
- tests/ui/screenshot-preview-test.js - Test that screenshot-preview displays an image and responds to zoom/pan

## Phase 2: Note Transcription and Metadata Attachment

### Affected Files

- src/core/note-transcriber.js - Voice and text input for notes
- src/core/metadata-injector.js - Attach notes to markup elements and generate output
- src/ui/note-input-panel.js - UI for entering and viewing notes
- src/utils/file-handler.js - Save annotated images and notes to disk

### Changes

- note-transcriber.js: Implement speech recognition (using Web Speech API) and text input
- metadata-injector.js: Associate notes with markup elements (by ID or position) and create output format (image with embedded metadata or sidecar JSON)
- note-input-panel.js: Create a panel with text area and microphone button for voice input
- file-handler.js: Implement saving of annotated images (PNG) and sidecar note files (JSON)

### Unit Tests

- tests/core/note-transcriber-test.js - Test that note-transcriber can transcribe voice input and handle text input
- tests/core/metadata-injector-test.js - Test that metadata-injector correctly associates notes with markup and generates expected output
- tests/ui/note-input-panel-test.js - Test that note-input-panel captures user input and emits note events
- tests/utils/file-handler-test.js - Test that file-handler saves files correctly and handles errors

## Phase 3: Polish, Integration, and Packaging

### Affected Files

- src/utils/image-processor.js - Optimize and convert images for output
- src/utils/ai-formatter.js - Format metadata for AI consumption
- src/main.js - Electron main process entry point
- package.json - Define dependencies and build scripts
- README.md - User documentation

### Changes

- image-processor.js: Implement image optimization (resize, compress) and format conversion
- ai-formatter.js: Create a JSON structure that describes the markup and notes in a way that AI agents can understand
- main.js: Set up Electron application, create main window, handle app lifecycle
- package.json: Add dependencies (electron, etc.) and scripts for development and build
- README.md: Provide instructions on how to use the application

### Unit Tests

- tests/utils/image-processor-test.js - Test that image-processor correctly processes images
- tests/utils/ai-formatter-test.js - Test that ai-formatter produces expected JSON structure
- tests/main-test.js - Test that main process starts correctly and creates window

## Phase 4: Final Validation and Release Preparation

### Affected Files

- All files - Final code review and Section 4 Razor compliance
- docs/ - Update any documentation if needed
- CHANGELOG.md - Initial changelog entry

### Changes

- Apply Section 4 Razor: Ensure all functions <=40 lines, files <=250 lines, nesting <=3 levels
- Run all tests to ensure they pass
- Update CHANGELOG.md with initial release
- Prepare release artifacts (if applicable)

### Unit Tests

- No new unit tests, but run all existing tests to confirm nothing is broken.
