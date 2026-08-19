# CritIQ Documentation

This index separates current product authority, active release-candidate work, and historical evidence.

## Current `main` authority

| Need | Read |
|---|---|
| Understand CritIQ | [`../README.md`](../README.md) |
| Understand product intent | [`CONCEPT.md`](CONCEPT.md) |
| Understand current architecture | [`ARCHITECTURE_PLAN.md`](ARCHITECTURE_PLAN.md) |
| Review architecture decisions | [`adr/README.md`](adr/README.md) |
| Review repository governance | [`../GOVERNANCE.md`](../GOVERNANCE.md) |
| Contribute | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Report security issues | [`../SECURITY.md`](../SECURITY.md) |
| Get support | [`../SUPPORT.md`](../SUPPORT.md) |

## Active release candidate

The complete local desktop release candidate is being developed and validated in [PR #8](https://github.com/MythologIQ-Labs-LLC/CritIQ/pull/8).

Release-candidate documents introduced or substantially revised there should not be represented as merged `main` behavior until that PR lands.

## Architecture decisions

- [`adr/ADR-001-tauri-local-first-desktop.md`](adr/ADR-001-tauri-local-first-desktop.md) - Tauri 2 local-first desktop architecture.
- [`adr/ADR-002-user-directed-evidence.md`](adr/ADR-002-user-directed-evidence.md) - user-directed evidence selection.
- [`adr/ADR-003-storyboard-evidence-contract.md`](adr/ADR-003-storyboard-evidence-contract.md) - target portable storyboard evidence contract.

## Historical governance and evidence records

The following files are preserved as historical evidence and are not automatically current architecture authority:

- `SYSTEM_STATE.md`
- `META_LEDGER.md`
- `SHADOW_GENOME.md`
- `SUBSTANTIATION_REPORT.md`
- `SUBSTANTIATION_FAILURE.md`
- `BOOTSTRAP_REPORT.md`
- `Planning/plan-razor-remediation.md`

Some records describe earlier repository states, dependencies, or verification assumptions. They remain useful provenance, not permission to contradict active documentation.

## Documentation truth rule

If active documentation and active code disagree, the discrepancy is a defect. Fix the implementation or the documentation rather than preserving two competing descriptions of reality.