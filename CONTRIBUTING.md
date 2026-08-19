# Contributing to CritIQ

CritIQ is a small local-first desktop product for capturing ordered, annotated UI evidence. Contributions are welcome when they improve that product clearly and preserve its trust boundaries.

By intentionally submitting a contribution for inclusion in this repository, you agree that the contribution is submitted under the repository's MIT License unless a separate written agreement explicitly applies.

Participation is also subject to `CODE_OF_CONDUCT.md`. Repository decision rights are defined in `GOVERNANCE.md`. Security-sensitive findings belong in the process described by `SECURITY.md`.

## Before contributing

Read these in order:

1. `README.md`
2. `docs/README.md`
3. `docs/CONCEPT.md`
4. `docs/ARCHITECTURE_PLAN.md`
5. `docs/FEATURE_MATRIX.md`
6. `GOVERNANCE.md`

For release-affecting work, also read `docs/ACCEPTANCE_TEST.md`.

## Product-boundary rule

CritIQ is intentionally focused on user-directed runtime evidence capture.

Do not silently expand a bug fix or feature PR into:

- browser automation;
- cloud accounts or synchronization;
- collaborative editing;
- OCR;
- video recording;
- embedded AI inference;
- Figma integration;
- issue-tracker integration;
- plugin infrastructure.

Any of those requires an explicit product-direction decision under `GOVERNANCE.md`.

## AI-assisted development

AI-assisted development is allowed, including coding agents, AI editors, code generators, automated review, and authenticated repository connectors.

The standard is accountability, not manual keystrokes.

A responsible human remains accountable for the objective, scope, material risk, and repository authority. Automated implementation does not reduce the required review or validation standard.

Do not use a CritIQ task as authority to act in unrelated repositories or services.

## Development setup

Requirements:

- Windows with Tauri 2 prerequisites;
- Node.js 22 or compatible current LTS;
- npm;
- Rust stable toolchain.

Install and run:

```bash
npm ci
npm run dev
```

## Repository architecture

Frontend code lives in `dist/js` as vanilla JavaScript ES modules. Rust/Tauri code lives in `src-tauri/src`.

The architecture intentionally avoids a frontend framework and application server. Do not introduce either without an accepted architectural reason.

Use the existing modules rather than creating parallel state systems.

Important boundaries:

```text
capture -> session -> annotation/notes -> export
                    -> viewer
```

Frame-local state must remain frame-local. Export order must follow storyboard order. Structured annotation data and flattened exported visuals must describe the same authored state.

## Code quality

Prefer small modules with one clear responsibility.

The repository historically uses a 250-line code ceiling as a maintenance signal. It is not a magical law of software physics, but exceeding it should trigger a deliberate decomposition review rather than casual growth.

For touched code:

- use supported APIs;
- remove dead paths exposed by the change;
- avoid duplicate state ownership;
- preserve accessibility labels and keyboard behavior;
- keep filesystem-facing input sanitized;
- keep comments about why, not obvious narration of what;
- update documentation when behavior or contracts change.

## Contract changes

The storyboard export is a consumer-facing contract.

Changes to any of the following require explicit compatibility analysis:

- `critiq.storyboard/v1` semantics;
- manifest fields;
- frame ordering;
- annotation representation;
- note linking;
- filenames or extensions;
- save/export directory behavior.

If a change breaks existing consumers, propose a contract-version decision rather than silently changing v1 semantics.

## Validation

Run the relevant checks before requesting review:

```bash
npm test -- --run
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run build
git diff --exit-code -- src-tauri/Cargo.lock
```

Use the smallest sufficient validation for editorial-only changes, but do not describe an unrun test as passing.

For release-affecting changes, the Windows production build and the applicable desktop acceptance flow are part of the evidence boundary.

## Tests

Tests should assert contracts and failure modes rather than merely execute lines.

Useful targets include:

- frame isolation;
- annotation persistence;
- ordering;
- structured export;
- file-format handling;
- path sanitization;
- archive readability;
- compatibility between flattened and structured evidence.

When a defect is reproducible in a pure function or boundary layer, add a regression test.

## Generated binaries

Do not commit generated EXE/MSI installers into ordinary Git source history.

Validated installers belong in GitHub Releases. CI artifacts exist as build evidence and temporary workflow transport.

## Pull requests

A good PR answers four questions:

1. **What changes?**
2. **Why does it belong in CritIQ?**
3. **What proves it?**
4. **What remains unproven?**

Keep PRs bounded. Separate unrelated cleanup when it obscures the actual consequence.

The repository PR template includes the required evidence and authority checklist.

## Documentation changes

Active documentation must describe the current product and repository state.

Historical records may be preserved for provenance, but they must be labeled clearly enough that a reader cannot mistake them for active implementation guidance.

Update `docs/README.md` when adding a new authoritative document.

## Security

Do not publish credentials, private screenshots, customer data, exploit payloads, or sensitive proof-of-concept material in a public issue.

Follow `SECURITY.md`.

## Conduct

Technical disagreement is welcome. Personal attacks, harassment, spam, and low-signal automated flooding are not.

See `CODE_OF_CONDUCT.md`.