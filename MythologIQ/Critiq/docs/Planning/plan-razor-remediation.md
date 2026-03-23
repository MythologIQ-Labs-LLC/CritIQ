# Plan: Razor Remediation (Section 4 Compliance)

## Context

Gate Tribunal VETO (Entry #15) identified 5 violations requiring semantic splits.

## Phase 1: JavaScript Split

### Affected Files

- `dist/js/notes.js` (259 lines) - Extract STT engine classes
- `dist/js/stt.js` (NEW) - Speech-to-text engines
- `dist/js/app.js` - Update imports

### Changes

**Create `dist/js/stt.js`**:
- Move `WebSpeechEngine` class (lines 7-57)
- Move `NativeSpeechEngine` class (lines 60-125)
- Move `sttEngines` registry (lines 127-130)
- Move `currentSTTEngine`, `isRecording` state (lines 132-133)
- Move `initSTT()` function (lines 135-152)
- Move `toggleRecording()` function (lines 154-177)
- Move `startRecordingInternal()` function (lines 179-197)
- Export: `{ toggleRecording, initSTT }`

**Reduce `dist/js/notes.js`**:
- Keep `renderNotes()` function (lines 199-232)
- Keep `handleNoteSubmit()` function (lines 234-252)
- Import `toggleRecording` from `stt.js`
- Re-export for app.js compatibility

**Update `dist/js/app.js`**:
- Import `toggleRecording` from `./stt.js`

---

## Phase 2: CSS Splits

### Affected Files

- `dist/styles/layout.css` (315 lines) - Extract overlays
- `dist/styles/overlays.css` (NEW) - Region selector, countdown
- `dist/styles/components.css` (452 lines) - Split into 3 files
- `dist/styles/buttons.css` (NEW) - Button styles
- `dist/styles/forms.css` (NEW) - Input, select, notification
- `dist/styles/modals.css` (NEW) - Modal and dialog styles
- `dist/index.html` - Update stylesheet links

### Changes

**Create `dist/styles/overlays.css`**:
- Move `#region-selector-overlay` (lines 229-250)
- Move `#region-selection-box` (lines 252-259)
- Move `.region-instructions` (lines 261-276)
- Move `#countdown-overlay` (lines 278-310)
- Move `@keyframes countdownPulse` (lines 307-310)
- Move `#region-overlay` legacy (lines 312-315)

**Reduce `dist/styles/layout.css`**:
- Keep `#app` layout (lines 1-9)
- Keep `#toolbar` (lines 11-54)
- Keep `#preview` (lines 56-116)
- Keep `#notes` section (lines 118-227)

**Create `dist/styles/buttons.css`**:
- Move `.btn, button` base (lines 3-47)
- Move `.btn-primary` (lines 49-64)
- Move `.btn-danger` (lines 66-75)
- Move `.btn-secondary` (lines 77-89)
- Move `.btn-accent` (lines 91-106)
- Move `.btn-icon` (lines 108-127)
- Move `.markup-btn` (lines 129-149)
- Move `.btn-mic` (lines 151-178)

**Create `dist/styles/forms.css`**:
- Move `select` (lines 180-203)
- Move `input[type="color"]` (lines 205-228)
- Move `input[type="range"]` (lines 230-236)
- Move `input[type="checkbox"]` (lines 238-243)
- Move `.notification` (lines 245-277)

**Create `dist/styles/modals.css`**:
- Move `.modal-overlay` (lines 279-289)
- Move `.modal` (lines 291-342)
- Move `.text-input-overlay` (lines 344-357)
- Move `.text-input-dialog` (lines 359-389)
- Move `.settings-section` (lines 391-418)
- Move `.export-option` (lines 420-452)

**Update `dist/index.html`**:
```html
<link rel="stylesheet" href="styles/base.css">
<link rel="stylesheet" href="styles/layout.css">
<link rel="stylesheet" href="styles/overlays.css">
<link rel="stylesheet" href="styles/buttons.css">
<link rel="stylesheet" href="styles/forms.css">
<link rel="stylesheet" href="styles/modals.css">
<link rel="stylesheet" href="styles/filmstrip.css">
```

---

## Phase 3: Rust Splits + chrono Removal

### Affected Files

- `src-tauri/src/capture.rs` (277 lines) - Convert to module
- `src-tauri/src/capture/mod.rs` (NEW) - Types, single-screen capture
- `src-tauri/src/capture/multi.rs` (NEW) - Multi-screen capture
- `src-tauri/src/capture/util.rs` (NEW) - Timestamp utility
- `src-tauri/src/main.rs` - Update mod declaration

### Changes

**Create `src-tauri/src/capture/util.rs`**:
- Copy `get_iso_timestamp()` from `notes/util.rs`
- Copy `days_to_ymd()` helper

**Create `src-tauri/src/capture/mod.rs`**:
- Move `CaptureResult`, `CaptureError`, `ScreenInfo`, `RegionOptions` structs
- Move `get_screens()` command
- Move `capture_screen()`, `capture_screen_fast()` commands
- Move `capture_screen_internal()` function
- Move `capture_region()` command
- Replace `chrono::Utc::now().to_rfc3339()` with `util::get_iso_timestamp()`
- Re-export commands from `multi.rs`

**Create `src-tauri/src/capture/multi.rs`**:
- Move `capture_all_screens()`, `capture_all_screens_fast()` commands
- Move `capture_all_screens_internal()` function
- Import types from `super`
- Use `super::util::get_iso_timestamp()`

**Update `src-tauri/src/main.rs`**:
- Change `mod capture;` to continue working (Rust finds `capture/mod.rs`)

---

## Success Criteria

After implementation:

| File | Target Lines | Limit |
|------|-------------|-------|
| stt.js | ~150 | 250 |
| notes.js | ~60 | 250 |
| overlays.css | ~90 | 250 |
| layout.css | ~180 | 250 |
| buttons.css | ~130 | 250 |
| forms.css | ~90 | 250 |
| modals.css | ~130 | 250 |
| capture/mod.rs | ~150 | 250 |
| capture/multi.rs | ~90 | 250 |
| capture/util.rs | ~40 | 250 |

All files under 250 lines. No chrono dependency.
