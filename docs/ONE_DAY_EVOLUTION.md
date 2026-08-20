# CritIQ Evolution Record

## Original destination

The bounded completion cycle established the core mission:

> **Turn a user-directed walkthrough of a real interface into one portable, ordered, annotated evidence bundle that a developer or coding agent can understand and act on without reconstructing the walkthrough.**

The architectural boundary remains unchanged: Tauri 2 + Rust + vanilla JavaScript, local-first, user-directed, and intentionally without browser automation, accounts, cloud collaboration, embedded AI, OCR, video, or plugin infrastructure.

## First completion slice

The first slice repaired the product's evidence boundary:

- durable frame state;
- annotation-preserving export;
- deterministic `storyboard.md` and `manifest.json`;
- real ZIP generation;
- frame-safe deletion and capture transitions;
- removal of fake native speech and unused shell capability;
- repository-backed tests and Windows CI;
- a committed, locked Rust dependency graph.

That slice proved the core storyboard architecture but intentionally left several product surfaces smaller than the original annotated-screenshot plan.

## Complete local feature-set pass

Before desktop acceptance, the product surface was expanded to make a single full-product test meaningful.

Added or completed:

- Select and move annotations.
- Line and ellipse annotations.
- Structured vector annotation persistence.
- Annotation-linked notes.
- Filmstrip reordering.
- Zoom, pan, and reset-view controls.
- Explicit New Session.
- Functional Save Frame defaulting to `Pictures/CritIQ/Saved`.
- PNG and JPEG output with JPEG quality selection.
- Export image resizing at 100%, 75%, or 50%.
- Structured annotations in Save sidecars and storyboard manifests.
- Correct image extensions throughout bundle and Markdown generation.
- Frontend annotation-model tests.
- A complete feature matrix and end-to-end desktop acceptance procedure.

## Current product contract

Each frame preserves:

```text
Frame
├── stable id
├── sequence
├── timestamp
├── capture metadata
├── original capture
├── structured annotations[]
├── flattened annotated image
└── notes[]
    └── optional annotationId
```

The flattened image is the universal visual artifact. The structured annotation array is the machine-readable semantic artifact. Both describe the same reviewed frame.

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

JPEG export substitutes `.jpg` frame entries.

`manifest.json` uses `critiq.storyboard/v1` and preserves authoritative sequence, frame IDs, notes, note-to-annotation relationships, vector annotations, capture metadata, and image paths.

## Validation contract

Automated validation:

```text
npm ci
npm test -- --run
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run build
git diff --exit-code -- src-tauri/Cargo.lock
```

Desktop product acceptance is defined separately in `ACCEPTANCE_TEST.md` so the entire local feature set can be evaluated in one pass.

## Definition of done

CritIQ's complete local product is done when it reliably preserves **what the user saw, what the user marked, what the user said, how those explanations relate to annotations, and the final order in which the evidence matters**.

Anything outside the explicit non-goals is a future product-direction decision, not hidden unfinished work.
