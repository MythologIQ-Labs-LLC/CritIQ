# ADR-003: Portable Storyboard Evidence Contract

- **Status:** Accepted
- **Decision owner:** MythologIQ Labs LLC
- **Maintainer:** Kevin R. Knapp

## Context

A useful CritIQ handoff must preserve both visual truth and structured context.

Flattened images are universally viewable but lose editable structure. Structured JSON preserves machine-readable semantics but is inconvenient for humans and cannot by itself show exactly what the user reviewed.

## Decision

CritIQ exports one ordered storyboard bundle containing both forms.

```text
critiq-session-<id>.zip
├── storyboard.md
├── manifest.json
└── frames/
    ├── 001.png
    ├── 002.png
    └── 003.png
```

The contract version is `critiq.storyboard/v1`.

Each frame image is the flattened annotated image reviewed in CritIQ. `manifest.json` preserves structured frame identity, order, timestamps, metadata, vector annotations, notes, and annotation links. `storyboard.md` provides a human-readable narrative.

## Invariants

```text
filmstrip order == manifest order == frame filename order
visible authored state == exported flattened frame
structured annotations describe the same frame state
annotation-linked notes use stable annotation identifiers
```

## Compatibility

Changes that alter manifest semantics, ordering, filename behavior, annotation representation, or note-link semantics require compatibility analysis.

Breaking changes should introduce a new contract version rather than silently redefining v1.

## Consequences

### Positive

- humans can inspect the bundle without CritIQ;
- coding agents can consume deterministic structure;
- flattened images remain portable;
- ordered evidence does not depend on application state after export.

### Tradeoffs

- export must maintain two consistent representations;
- tests must protect ordering and structure;
- future contract changes require version discipline.

## Validation

Validation includes frontend export-shaping tests, Rust bundle tests, ZIP readability tests, and the desktop acceptance procedure.