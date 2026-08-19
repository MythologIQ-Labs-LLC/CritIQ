# CritIQ One-Day Evolution

## Destination

CritIQ should do one thing exceptionally well:

> **Turn a user-directed walkthrough of a real interface into one portable, ordered, annotated evidence bundle that a developer or coding agent can understand and act on without reconstructing the walkthrough.**

This is a bounded v1 completion cycle, not a platform roadmap.

## Scope

### Keep

- Tauri 2 desktop shell.
- Rust capture/export backend.
- Vanilla JavaScript frontend.
- Existing capture modes.
- Filmstrip/session interaction model.
- Existing markup tools.
- Text notes and the working Web Speech path.
- Local-first operation.

### Remove or correct

- Electron-era implementation guidance.
- Export behavior that loses annotations or frame context.
- Fake ZIP behavior.
- Incomplete native-speech controls.
- Deprecated touched-code APIs.
- Documentation that treats isolated screenshots as the product.

### Do not add

- Browser automation or autonomous navigation.
- Accounts, auth, sync, or cloud storage.
- Team collaboration.
- Figma or design-system integration.
- AI inference inside CritIQ.
- Video recording.
- OCR.
- Issue tracker integration.
- Plugin architecture.
- A frontend framework migration.

If a change is not necessary to produce or consume the storyboard, it does not belong in this cycle.

## Framework decision

Stay on **Tauri 2 + Rust + vanilla JavaScript**. Replatforming would add migration risk without improving the core storyboard workflow.

## Product contract

A CritIQ session is an ordered list of frames. Each frame preserves:

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

The exported artifact must preserve the same order and visible state the user reviewed in the filmstrip.

## Primary export contract

```text
critiq-session-<id>.zip
├── storyboard.md
├── manifest.json
└── frames/
    ├── 001.png
    ├── 002.png
    └── 003.png
```

Every frame image is the composited annotated image. `storyboard.md` provides human-readable sequence and notes. `manifest.json` provides deterministic machine-readable context using `critiq.storyboard/v1`.

## Implementation status

### Implemented on the active v1 branch

- [x] Preserve the active frame before switching to another frame.
- [x] Preserve the active frame before appending a new capture.
- [x] Keep notes, metadata, canvas state, and annotated composite frame-local.
- [x] Prevent frame deletion from cross-contaminating neighboring frame state.
- [x] Export annotated composites rather than untouched source screenshots.
- [x] Generate ordered `storyboard.md` and `manifest.json` from the same frame collection.
- [x] Implement a real ZIP archive with deterministic frame names.
- [x] Make ZIP the recommended/default handoff format.
- [x] Remove incomplete browser-only export fallback behavior.
- [x] Remove unfinished native Rust speech commands and UI selection.
- [x] Remove the unused Tauri shell plugin and shell permission.
- [x] Replace deprecated `String.prototype.substr()` usage in touched code.
- [x] Sanitize session IDs before filesystem path construction.
- [x] Remove obsolete Electron implementation plans.
- [x] Make Tauri storyboard architecture canonical in the README and architecture documentation.
- [x] Replace obsolete Electron tests with storyboard contract coverage.
- [x] Add Rust tests for bundle generation and ZIP readability.
- [x] Add Windows CI for frontend tests, Rust check/tests, and Tauri production build.

### Automated validation

The CI contract is:

```text
npm ci
npm test -- --run
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

The CI workflow also preserves the resolved `Cargo.lock` so dependency changes can be committed deterministically.

### Manual acceptance still required

Automated checks cannot prove the complete desktop interaction outcome. Final v1 acceptance requires a real runtime walkthrough:

1. launch CritIQ;
2. capture at least three distinct UI states;
3. annotate and note each frame differently;
4. navigate among the frames repeatedly;
5. verify no annotation or note state moves or disappears;
6. export the recommended ZIP;
7. unpack it outside CritIQ;
8. compare each exported frame and note with the state reviewed in the application;
9. verify `storyboard.md` and `manifest.json` preserve the same order.

## Definition of done

CritIQ v1 is done when it reliably converts a real UI walkthrough into a portable storyboard that preserves **what the user saw, what the user marked, what the user said, and the order in which it mattered**.

Anything beyond that is a future product decision, not unfinished v1 work.
