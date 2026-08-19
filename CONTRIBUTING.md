# Contributing to CritIQ

CritIQ is a small local-first desktop project for capturing and communicating user-directed UI evidence. Contributions are welcome when they improve that product clearly and preserve its trust and scope boundaries.

By intentionally submitting a contribution for inclusion in this repository, you agree that the contribution is submitted under the repository's MIT License unless a separate written agreement explicitly applies.

Participation is also subject to `CODE_OF_CONDUCT.md`. Repository decision rights are defined in `GOVERNANCE.md`. Security-sensitive findings belong in the process described by `SECURITY.md`.

## Before contributing

For the current default branch, read:

1. `README.md`
2. `docs/README.md`
3. `docs/CONCEPT.md`
4. `docs/ARCHITECTURE_PLAN.md`
5. `docs/adr/README.md`
6. `GOVERNANCE.md`

The complete local desktop release candidate is tracked in PR #8. Its additional feature-matrix and acceptance-test documents become current repository authority only when that work lands on `main`.

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

Important boundaries:

```text
capture -> session -> annotation/notes -> export
```

State ownership should remain explicit. Filesystem-facing input must remain sanitized. Changes should not create duplicate or competing architecture paths.

## Code quality

Prefer small modules with one clear responsibility.

The repository historically uses a 250-line code ceiling as a maintenance signal. It is not a magical law, but exceeding it should trigger a deliberate decomposition review rather than casual growth.

For touched code:

- use supported APIs;
- remove dead paths exposed by the change;
- avoid duplicate state ownership;
- preserve accessibility behavior;
- keep filesystem-facing input sanitized;
- update documentation when behavior or contracts change.

## Contract changes

Changes to save/export formats, ordering, annotation representation, note linking, filenames, or filesystem behavior require compatibility analysis.

The target storyboard contract is recorded in `docs/adr/ADR-003-storyboard-evidence-contract.md`. Do not silently redefine a published contract once consumers can depend on it.

## Validation

Run the checks appropriate to the branch and files you change. Do not describe an unrun check as passing.

For the active release candidate, validation requirements are maintained in PR #8 and its CI workflow. Once that work lands, those checks become the default branch standard.

## Generated binaries

Do not commit generated EXE/MSI installers into ordinary Git source history.

Validated installers belong in GitHub Releases. CI artifacts exist as build evidence and workflow transport.

## Pull requests

A good PR answers four questions:

1. **What changes?**
2. **Why does it belong in CritIQ?**
3. **What proves it?**
4. **What remains unproven?**

Keep PRs bounded. Separate unrelated cleanup when it obscures the actual consequence.

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