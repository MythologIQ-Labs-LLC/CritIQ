# CritIQ One-Day Evolution

## Destination

By the end of the implementation cycle, CritIQ should do one thing exceptionally well:

> **Turn a user-directed walkthrough of a real interface into one portable, ordered, annotated evidence bundle that a developer or coding agent can understand and act on without reconstructing the walkthrough.**

This is not a redesign and not a new architecture. CritIQ already contains the core capture, filmstrip, markup, note, speech, and export surfaces. The job is to make those pieces tell one trustworthy story.

## Scope test

This work is intentionally constrained to a single bounded implementation cycle. It does not need a multi-phase platform roadmap.

### Keep

- Tauri 2 desktop shell.
- Rust capture/export backend.
- Vanilla JavaScript frontend.
- Existing capture modes.
- Existing filmstrip/session model.
- Existing markup tools.
- Existing text notes and working speech-to-text path.
- Local-first operation.

### Remove or correct

- Electron-era implementation guidance that no longer reflects the repository.
- Export paths that imply capabilities they do not provide.
- Any export behavior that loses annotations or frame-specific context.
- UI controls for unfinished native speech functionality unless that implementation is completed inside the cycle.
- Documentation that treats isolated screenshots as the product instead of the ordered storyboard.
- Trivial deprecated API usage discovered during the touched-code pass.

### Do not add

- Browser automation.
- Autonomous navigation.
- Accounts, auth, sync, or cloud storage.
- Team collaboration.
- Figma or design-system integration.
- AI inference inside CritIQ.
- Video recording.
- OCR.
- Issue tracker integration.
- Plugin architecture.
- A frontend framework migration.

If a proposed change is not necessary to produce or consume the storyboard bundle, it does not belong in the one-day scope.

## Framework decision

Stay on **Tauri 2 + Rust + vanilla JavaScript**.

Tauri 2 is the active architecture in the repository and remains the current major Tauri line. Replatforming again would add migration risk without improving the storyboard workflow. The modernization pass should therefore focus on correctness, misleading dead paths, dependency hygiene, and deprecated APIs rather than changing frameworks.

## The product contract

A CritIQ session is an ordered list of frames.

Each frame must preserve:

```text
Frame
├── stable id
├── sequence number
├── timestamp
├── capture metadata
├── original capture
├── visible annotation composite
└── notes[]
```

The exported artifact must preserve the same order and visible state the user saw while reviewing the filmstrip.

## Recommended export contract

The primary export should be a real ZIP archive. The existing UI already presents ZIP as an option, so implementing the promise is preferable to inventing another format.

```text
critiq-session-<id>.zip
├── storyboard.md
├── manifest.json
└── frames/
    ├── 001.png
    ├── 002.png
    └── 003.png
```

### `frames/*.png`

Every frame is the **composited annotated image**, not the untouched original screenshot.

### `storyboard.md`

Human-readable and model-friendly narrative:

```markdown
# CritIQ Storyboard

## 01 - Navigation state
![Frame 01](frames/001.png)

### Notes
- Sidebar is clipping the project title at this width.
- Preserve the existing selected state.

## 02 - Modal open
![Frame 02](frames/002.png)

### Notes
- Primary action should remain visible without scrolling.
```

### `manifest.json`

Deterministic machine-readable context:

```json
{
  "schema": "critiq.storyboard/v1",
  "sessionId": "...",
  "createdAt": "...",
  "frames": [
    {
      "sequence": 1,
      "id": "...",
      "timestamp": "...",
      "image": "frames/001.png",
      "notes": [],
      "metadata": {}
    }
  ]
}
```

The schema should remain deliberately boring. The images carry visual truth; the manifest carries order and context.

## Build sequence

### 1. Make frame state durable

**Goal:** switching between storyboard frames cannot lose work.

- Persist the current frame before every frame switch and before export.
- Store the composited annotated image, or store enough deterministic markup state to regenerate it exactly.
- Preserve frame-local notes and metadata.
- Verify removing or switching frames does not cross-contaminate notes or markup.

**Done when:** Capture three frames, annotate each differently, move through them repeatedly, and every frame returns exactly as authored.

### 2. Make export truthful

**Goal:** exported frames match the reviewed storyboard.

- Export composited annotated frames rather than original screenshots.
- Carry frame metadata into `manifest.json`.
- Generate `storyboard.md` from the same ordered frame collection.
- Remove any fallback behavior that silently produces an incomplete artifact.

**Done when:** Comparing the in-app frame against its exported PNG shows no lost annotation or note context.

### 3. Make ZIP real

**Goal:** one handoff artifact.

- Add the smallest suitable Rust ZIP dependency.
- Package `storyboard.md`, `manifest.json`, and `frames/` into one archive.
- Use deterministic numbered filenames.
- Return the actual archive path from the Tauri command.
- Delete the current behavior that labels a directory as a ZIP export.

**Done when:** A single exported ZIP can be unpacked independently and contains every frame, note, and manifest entry in order.

### 4. Tighten the interaction model

**Goal:** the user authors the story with minimal friction.

Required:

- Clear active-frame state in the filmstrip.
- Capture appends a frame and selects it.
- Annotation and note controls operate on the active frame.
- Export is available only when the session contains frames.

Only if trivial within the cycle:

- Drag-and-drop frame reordering.
- Short frame title or caption.
- Keyboard shortcut for capture.

These are secondary. Do not jeopardize export correctness for them.

### 5. Run a bounded modernization pass

**Goal:** remove misleading or deprecated implementation details without turning the work into a rewrite.

- Keep Tauri 2 and the existing Rust/vanilla-JS split.
- Update locked Tauri 2 dependencies within the compatible v2 line if validation remains green.
- Replace deprecated JavaScript APIs in touched code, including `String.prototype.substr()` in ID generation.
- Audit touched Rust dependencies for straightforward compatible updates rather than major-version migrations.
- Remove the selectable "Windows Native" speech option for v1 unless native recognition is actually implemented; the current Rust path is a stub and should not masquerade as a finished feature.
- Prefer the working speech path rather than expanding the platform-specific STT surface during this cycle.

**Done when:** the supported UI exposes only functionality that works, touched code uses non-deprecated APIs, and dependency updates introduce no test or build regression.

### 6. Remove archaeological confusion

**Goal:** repository documentation describes the application that actually exists.

- Make `README.md` the canonical product entry point.
- Keep `docs/CONCEPT.md` concise and aligned with the storyboard mission.
- Mark old Electron plans as historical/deprecated or remove them if they provide no useful provenance.
- Update architecture documentation to describe Tauri 2 only.
- Keep the repository tree small and legible.

**Done when:** A new contributor can identify the framework, product contract, current source tree, and completion criteria without encountering contradictory architecture instructions.

## Validation

The implementation is finished when all of the following are true:

- [ ] Tauri application launches successfully.
- [ ] At least three sequential captures can exist in one session.
- [ ] Each frame retains independent annotations and notes across navigation.
- [ ] Exported frame images include annotations.
- [ ] `storyboard.md` contains every frame in session order with its notes.
- [ ] `manifest.json` validates as JSON and contains every frame in the same order.
- [ ] ZIP export produces an actual archive rather than a directory.
- [ ] The exported ZIP can be unpacked and understood without the CritIQ application.
- [ ] No Electron runtime or Electron implementation guidance remains active.
- [ ] No unfinished native-speech control is presented as a working feature.
- [ ] Touched JavaScript contains no deprecated `substr()` usage.
- [ ] `npm test` passes.
- [ ] `cargo check` passes.
- [ ] `npm run build` succeeds on the supported development platform.

## Definition of done

CritIQ is done for v1 when it reliably converts a real UI walkthrough into a portable storyboard that preserves **what the user saw, what the user marked, what the user said, and the order in which it mattered**.

Anything beyond that is a future product decision, not unfinished v1 work.
