# CritIQ Product Concept

## Mission

CritIQ turns a user-directed walkthrough of a real interface into one portable, ordered, annotated evidence bundle that a developer or coding agent can understand and act on without reconstructing the walkthrough.

## Problem

AI-assisted UI work commonly forces a bad choice between isolated screenshots and autonomous browser control. Isolated screenshots lose sequence and require repetitive capture and explanation. Autonomous browsing gives the agent control over what it observes and can miss the narrative the user actually wants to communicate.

Design handoff tools solve a different problem: they communicate intended state. CritIQ captures runtime truth.

## Product contract

The user remains the narrator:

1. navigate the real application;
2. capture meaningful UI states;
3. annotate each frame;
4. attach frame-level or annotation-linked notes;
5. review, reorder, and refine the filmstrip;
6. export the complete story as one portable artifact.

The exported storyboard preserves what the user saw, what the user marked, what the user said, how notes relate to annotations, and the order in which the evidence matters.

## Principles

- **User-directed:** CritIQ never autonomously decides where to navigate or what to capture.
- **Runtime-first:** evidence comes from the running interface, not an abstract design representation.
- **Ordered:** sequence is part of the evidence and can be revised before export.
- **Dual representation:** annotations are flattened into images for universal viewing and retained as structured vector data for machines.
- **Portable:** the primary handoff is one ZIP that can be understood without CritIQ.
- **Local-first:** capture, Save Frame, and export do not require an account or cloud service.
- **Honest UI:** controls only appear when the application implements their behavior.
- **Small boundary:** features that do not materially improve storyboard capture, explanation, review, or consumption remain outside the product.

## Complete local feature set

The complete local desktop product includes:

- selected-screen, all-screen, delayed, and region capture;
- ordered multi-frame storyboard sessions;
- delete and reorder controls;
- select/move, pen, arrow, line, rectangle, ellipse, and text annotations;
- annotation color and size controls;
- undo, delete selected, and clear;
- zoom, pan, and reset view;
- frame notes and annotation-linked notes;
- Web Speech transcription when supported;
- Save Frame with image plus JSON sidecar;
- ZIP, folder, and Markdown storyboard export;
- PNG and quality-controlled JPEG output;
- 100%, 75%, or 50% export sizing for smaller handoffs;
- structured `manifest.json` evidence with vector annotations and note links.

See `FEATURE_MATRIX.md` for the authoritative checklist.

## Non-goals

CritIQ is not a general-purpose image editor, browser automation agent, screen recorder, cloud collaboration platform, design-system replacement, OCR pipeline, plugin platform, or embedded coding agent.

Those are deliberate boundaries, not unfinished features.

## Product acceptance

The product is ready for release-candidate evaluation when the complete workflow in `ACCEPTANCE_TEST.md` passes on the built desktop application.

Automated tests prove data contracts and build integrity. The desktop acceptance test proves the interaction outcome.
