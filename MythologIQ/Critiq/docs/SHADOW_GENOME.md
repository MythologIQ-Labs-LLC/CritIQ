# Shadow Genome

Repository of documented failures to prevent repetition.

---

## Entry #1: ORPHAN_FILES_EPIDEMIC

**Date**: 2026-03-22T18:55:00.000Z
**Verdict**: VETO
**Category**: Build Path Violation

### Pattern

Source files created but never imported into the application's entry point, resulting in dead code that cannot execute.

### Evidence

```
src/main.js imports: electron, path
src/main.js DOES NOT import: capture-engine, markup-manager, note-transcriber,
  metadata-injector, main-window, markup-toolbar, screenshot-preview,
  note-input-panel, file-handler, image-processor, ai-formatter
```

**11 of 12 source files** had no connection to the build path.

### Prevention

- Verify every new file is imported somewhere in the dependency tree
- Run orphan detection after each implementation phase
- Entry point must orchestrate module connections

---

## Entry #2: GHOST_UI_STUBS

**Date**: 2026-03-22T18:55:00.000Z
**Verdict**: VETO
**Category**: Ghost UI Violation

### Pattern

UI files exist with interface contracts promising functionality, but implementation is empty `module.exports = {}` with only console.log statements.

### Evidence

```javascript
// src/ui/main-window.js - ENTIRE CONTENT:
console.log('main-window.js loaded');
module.exports = {};
```

Blueprint promised: "Input: User interactions, system events → Output: UI state updates"

### Prevention

- Stubs must implement interface contracts or contracts must be deferred
- Empty exports are violations when interface contracts exist
- UI files require actual DOM manipulation or event handling

---

## Entry #3: MISSING_CRITICAL_FILES

**Date**: 2026-03-22T18:55:00.000Z
**Verdict**: VETO
**Category**: Build Path Violation

### Pattern

Entry point references files that do not exist, causing immediate application failure.

### Evidence

```javascript
// src/main.js:13 - references non-existent file
preload: path.join(__dirname, 'preload.js')

// src/main.js:18 - references non-existent file
mainWindow.loadFile('index.html');
```

### Prevention

- All file references in code must be validated
- Entry point files cannot reference phantom paths
- File existence check must be part of implementation verification

---

## Entry #4: PROTOCOL_BYPASS

**Date**: 2026-03-22T21:00:00.000Z
**Verdict**: VETO
**Category**: CRITICAL - Governance Violation

### Pattern

Implementation proceeded without running `/ql-plan` and `/ql-audit` after a sealed session, bypassing the entire Gate Tribunal process.

### Evidence

```
META_LEDGER Entry #9: PROJECT SEALED (Electron architecture)
User Request: "v2 session workflow, filmstrip, STT"
Action Taken: Direct implementation without governance
Result: 1376-line unauthorized Tauri implementation
```

### Impact

- 33 violations accumulated
- 15 orphan files created
- Dual architecture conflict (Electron + Tauri)
- Chain integrity BROKEN

### Prevention

- After any sealed session, new features MUST start with `/ql-plan`
- NEVER implement without Gate Tribunal approval
- Plan files in `.agent/plans/` are NOT substitutes for `docs/ARCHITECTURE_PLAN.md`

---

## Entry #5: MONOLITH_VIOLATION

**Date**: 2026-03-22T21:00:00.000Z
**Verdict**: VETO
**Category**: Section 4 Razor Violation

### Pattern

Single file accumulates all application logic, violating the 250-line maximum and creating unmaintainable code.

### Evidence

```
dist/app.js: 1376 lines (limit: 250)
dist/styles.css: 934 lines (limit: 250)
src-tauri/src/notes.rs: 345 lines (limit: 250)
```

### Prevention

- Stop implementation at 200 lines, refactor into modules
- CSS should be split by component
- Rust modules should be focused (one concern per file)

---

## Entry #6: GHOST_FEATURE_TOGGLE

**Date**: 2026-03-22T21:00:00.000Z
**Verdict**: VETO
**Category**: Ghost UI Violation

### Pattern

Settings UI allows users to select a feature that is hardcoded to always fail, creating false user expectations.

### Evidence

```javascript
// User can select "Windows Native" STT
<option value="native">Windows Native</option>

// But backend always returns false
pub async fn check_speech_available() -> bool {
    SPEECH_AVAILABLE.store(false, Ordering::SeqCst);
    false  // HARDCODED
}
```

### Prevention

- Disable or hide UI options for unimplemented features
- Implement feature detection BEFORE adding UI toggle
- Never expose options that silently fail

---

_Shadow Genome updated. 6 failure patterns documented._
