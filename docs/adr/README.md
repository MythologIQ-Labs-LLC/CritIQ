# CritIQ Architecture Decision Records

This directory records decisions that define CritIQ's durable product and architecture boundaries.

ADR status describes decision maturity. It does not claim that every implementation detail is complete or bug-free.

| ADR | Status | Decision |
|---|---|---|
| [ADR-001](ADR-001-tauri-local-first-desktop.md) | Accepted | Use Tauri 2 + Rust + vanilla JavaScript as a local-first desktop architecture |
| [ADR-002](ADR-002-user-directed-evidence.md) | Accepted | Keep evidence selection user-directed rather than autonomous |
| [ADR-003](ADR-003-storyboard-evidence-contract.md) | Accepted | Use a portable storyboard bundle with flattened frames plus structured manifest |

## Status values

- **Proposed** - under active consideration.
- **Accepted** - current architectural decision.
- **Superseded** - replaced by a later ADR.
- **Rejected** - considered and intentionally not adopted.

## Change rule

Do not silently rewrite an accepted ADR to reverse its decision.

When a durable decision changes:

1. create a new ADR;
2. explain the new evidence or product requirement;
3. identify compatibility consequences;
4. mark the prior ADR superseded when appropriate;
5. update active architecture documentation and tests.