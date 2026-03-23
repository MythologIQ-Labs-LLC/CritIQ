# Architecture Plan: CritIQ v2 (Tauri)

## Risk Grade: L2

### Risk Assessment

- [ ] Contains security/auth logic -> L3
- [x] Modifies existing APIs -> L2 (architecture migration)
- [ ] UI-only changes -> L1

**Note**: Elevated from L1 due to architecture transition from Electron to Tauri.

---

## Architecture Decision

**Framework**: Tauri 2 (Rust backend + WebView frontend)
**Deprecated**: Electron (`src/` directory - MARKED FOR DELETION)

### Rationale

- Native Rust performance for screen capture operations
- Smaller binary size compared to Electron
- Better Windows integration for speech recognition
- Single codebase for desktop deployment

---

## File Tree (The Contract)

```
dist/
|-- index.html               (WebView entry point)
|-- styles/
|   |-- base.css             (Theme variables, resets)
|   |-- layout.css           (Structural layout)
|   |-- components.css       (UI component styles)
|   |-- filmstrip.css        (Filmstrip navigation styles)
|-- js/
|   |-- app.js               (Main orchestrator, <50 lines)
|   |-- session.js           (Session state management)
|   |-- capture.js           (Screen capture handlers)
|   |-- filmstrip.js         (Thumbnail navigation)
|   |-- markup.js            (Canvas drawing tools)
|   |-- notes.js             (Note input and STT)
|   |-- settings.js          (User preferences)
|   |-- export.js            (Export functionality)
|   |-- utils.js             (Shared utilities)

src-tauri/
|-- src/
|   |-- main.rs              (Tauri entry point, <50 lines)
|   |-- capture.rs           (Screen capture commands) [278 lines - SPLIT REQUIRED]
|   |-- notes/
|   |   |-- mod.rs           (Notes module orchestrator)
|   |   |-- types.rs         (Data structures)
|   |   |-- save.rs          (Save operations)
|   |   |-- format.rs        (AI formatting)
|   |   |-- export.rs        (Session export)
|   |-- speech.rs            (STT integration) [107 lines - OK]
|-- Cargo.toml
|-- tauri.conf.json

docs/
|-- ARCHITECTURE_PLAN.md     (This file)
|-- META_LEDGER.md           (Audit chain)
|-- SHADOW_GENOME.md         (Failure patterns)
|-- CONCEPT.md               (Product vision)

tests/
|-- js/
|   |-- session.test.js      (Session management tests)
|   |-- filmstrip.test.js    (Filmstrip UI tests)
|-- rust/
|   (Rust tests embedded in modules)
```

### Files to DELETE (Electron Deprecation)

```
DELETE: src/main.js
DELETE: src/preload.js
DELETE: src/renderer.js
DELETE: src/core/event-bus.js
DELETE: src/core/capture-engine.js
DELETE: src/core/markup-manager.js
DELETE: src/core/note-transcriber.js
DELETE: src/core/metadata-injector.js
DELETE: src/ui/main-window.js
DELETE: src/ui/markup-toolbar.js
DELETE: src/ui/screenshot-preview.js
DELETE: src/ui/note-input-panel.js
DELETE: src/utils/file-handler.js
DELETE: src/utils/image-processor.js
DELETE: src/utils/ai-formatter.js
DELETE: index.html (root - replaced by dist/index.html)
DELETE: styles.css (root - replaced by dist/styles/)
DELETE: tests/event-bus.test.js
```

---

## Interface Contracts

### Frontend Modules

#### session.js
- **Input**: Capture events, user actions
- **Output**: Session state object
- **Functions**: `startSession()`, `addCapture()`, `switchCapture()`, `getActiveCapture()`

#### capture.js
- **Input**: User capture triggers (button, hotkey)
- **Output**: Image data to session
- **Functions**: `captureScreen()`, `captureRegion()`, `showRegionSelector()`
- **Calls**: Tauri `capture_screen`, `capture_region`, `capture_all_screens`

#### filmstrip.js
- **Input**: Session captures array, user selection
- **Output**: Thumbnail navigation UI
- **Functions**: `renderFilmstrip()`, `selectThumbnail()`, `generateThumbnail()`

#### markup.js
- **Input**: Canvas element, user drawing actions
- **Output**: Annotated image data
- **Functions**: `initCanvas()`, `setTool()`, `draw()`, `undo()`, `clear()`

#### notes.js
- **Input**: Text/voice input, STT engine selection
- **Output**: Note entries with timestamps
- **Functions**: `addNote()`, `startSTT()`, `stopSTT()`, `getNotes()`
- **STT Engines**: Web Speech API (primary), Windows Native (future)

#### settings.js
- **Input**: User preferences
- **Output**: localStorage persistence
- **Functions**: `loadSettings()`, `saveSettings()`, `getSetting()`

#### export.js
- **Input**: Session data, export format selection
- **Output**: Exported files via Tauri backend
- **Functions**: `exportSession()`, `showExportModal()`
- **Formats**: Individual files, Markdown report, ZIP archive

### Backend Commands (Rust)

#### capture.rs
- `get_screens()` -> `Vec<ScreenInfo>`
- `capture_screen(index?)` -> `CaptureResult`
- `capture_screen_fast(index?)` -> `CaptureResult` (JPEG for overlay)
- `capture_all_screens()` -> `CaptureResult`
- `capture_all_screens_fast()` -> `CaptureResult`
- `capture_region(options)` -> `CaptureResult`

#### notes/mod.rs
- `save_annotated_image(data, output_dir)` -> `SaveResult`
- `format_for_ai(data)` -> `AIFormattedData`
- `export_session(captures, format, session_id)` -> `ExportResult`

#### speech.rs
- `check_speech_available()` -> `bool`
- `start_speech_recognition(app)` -> `Result<(), SpeechError>`
- `stop_speech_recognition()` -> `Result<(), SpeechError>`

---

## Data Flow

```
[User Action]
    -> [capture.js]
    -> [Tauri: capture.rs]
    -> [session.js: addCapture()]
    -> [filmstrip.js: renderFilmstrip()]

[Markup Action]
    -> [markup.js: draw()]
    -> [session.js: updateCapture()]

[Note Action]
    -> [notes.js: addNote() or STT]
    -> [session.js: addNoteToCapture()]

[Export Action]
    -> [export.js: exportSession()]
    -> [Tauri: notes/export.rs]
    -> [File System]
```

---

## Dependencies

### Rust (Cargo.toml)

| Crate       | Justification                              | Vanilla Alternative          |
|-------------|--------------------------------------------|-----------------------------|
| tauri       | Core framework                             | N/A                         |
| screenshots | Screen capture                             | FFI to native APIs          |
| base64      | Image encoding                             | Manual impl (error-prone)   |
| serde       | Serialization                              | Manual JSON parsing         |
| serde_json  | JSON handling                              | Manual parsing              |
| dirs        | System directories                         | Env vars (platform-specific)|

**REMOVE**: `chrono` - Replace with `std::time::SystemTime` for timestamps

### Frontend

| Dependency  | Justification                              | Vanilla Alternative          |
|-------------|--------------------------------------------|-----------------------------|
| None        | Vanilla JS only                            | N/A                         |

---

## Section 4 Razor Pre-Check

### Current Violations (to be remediated)

| File                 | Lines | Limit | Status           |
|---------------------|-------|-------|------------------|
| dist/app.js         | 1376  | 250   | SPLIT INTO 8 FILES |
| dist/styles.css     | 934   | 250   | SPLIT INTO 4 FILES |
| src-tauri/capture.rs| 278   | 250   | SPLIT INTO 2 FILES |
| src-tauri/notes.rs  | 346   | 250   | SPLIT INTO 4 FILES |

### Post-Modularization Targets

- [x] All planned functions <= 40 lines
- [x] All planned files <= 250 lines
- [x] No planned nesting > 3 levels

---

## Implementation Phases

### Phase 1: Electron Cleanup
1. Delete all files in `src/` directory (15 files)
2. Delete root `index.html` and `styles.css`
3. Delete `tests/event-bus.test.js`
4. Update `.gitignore` if needed

### Phase 2: Frontend Modularization
1. Split `dist/app.js` (1376 lines) into 8 modules
2. Split `dist/styles.css` (934 lines) into 4 stylesheets
3. Update `dist/index.html` to load modules

### Phase 3: Backend Modularization
1. Split `capture.rs` into `capture/mod.rs`, `capture/multi.rs`
2. Split `notes.rs` into `notes/mod.rs`, `notes/types.rs`, `notes/save.rs`, `notes/export.rs`
3. Remove `chrono` dependency, use `SystemTime`

### Phase 4: Ghost UI Remediation
1. Either implement Windows Speech or remove native option from UI
2. Verify all UI toggles connect to real functionality

---

## MythIQ Theme Alignment

- Dark mode primary: `#0a0a1a` (background)
- Accent purple: `#6366f1` (primary actions)
- Accent cyan: `#06b6d4` (secondary/highlights)
- Glass effect: `rgba(255, 255, 255, 0.05)` backdrop blur
- Border glow: `box-shadow: 0 0 20px rgba(99, 102, 241, 0.3)`

---

_Blueprint created. Awaiting GATE tribunal via /ql-audit._
