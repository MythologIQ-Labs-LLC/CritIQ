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

_Shadow Genome initialized. Learn from these failures._
