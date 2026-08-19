# CritIQ Repository Governance

CritIQ is a public MythologIQ Labs LLC project with a deliberately small product boundary and an explicit release authority model.

## Stewardship

The canonical repository is `MythologIQ-Labs-LLC/CritIQ`.

Repository stewardship is held by **MythologIQ Labs LLC**. The current maintainer and product owner is **Kevin R. Knapp** (`@Knapp-Kevin`).

Stewardship covers product direction, repository policy, release decisions, security response, and the authority to accept or reject changes. Contributions can influence those decisions, but contribution does not by itself create release or governance authority.

## Product authority

CritIQ exists to capture user-directed runtime UI evidence and turn it into an ordered, annotated storyboard that can be handed to a developer or coding agent.

The product boundary is intentionally narrow. The following are not current CritIQ responsibilities:

- autonomous browser navigation;
- cloud accounts or synchronization;
- collaborative editing;
- OCR;
- video recording;
- embedded AI inference;
- issue-tracker integrations;
- Figma or design-system integration;
- plugin loading.

Adding one of these is a product-direction decision, not an ordinary feature contribution.

## Decision classes

Changes are reviewed according to consequence.

### Editorial

Examples:

- spelling and grammar;
- documentation navigation;
- non-semantic examples;
- badge or link maintenance.

Editorial changes must not silently change product promises or architecture meaning.

### Implementation

Examples:

- bug fixes;
- UI behavior corrections;
- capture improvements;
- annotation-tool changes;
- performance or accessibility improvements that preserve contracts.

Implementation changes require relevant automated validation and a clear statement of any behavior not exercised by automation.

### Contract

Examples:

- `manifest.json` schema changes;
- storyboard ordering semantics;
- export filename changes;
- annotation or note-link representation changes;
- filesystem-output contract changes.

Contract changes require compatibility analysis, tests, documentation updates, and an explicit versioning decision when consumers could break.

### Security, release, or governance

Examples:

- permission changes;
- dependency or build-pipeline changes with security consequences;
- installer publication changes;
- supported-platform changes;
- security-reporting policy;
- repository authority or merge-policy changes.

These changes require maintainer review and evidence appropriate to their consequence.

## AI-assisted development and accountable delegation

CritIQ permits AI-assisted development, including coding agents, automated review tools, repository connectors, and code-generation systems.

The governing rule is simple:

> **Implementation method does not create repository authority.**

A responsible human remains accountable for the objective, material risk, and delegated authority. An authenticated agent may perform repository actions when directly delegated within a bounded task or authorized by an explicit repository workflow.

Direct delegation for CritIQ does not authorize unrelated actions in external repositories, destructive administration, or silent expansion beyond the stated task.

No contributor is required to hand-write every line of code. Every contribution is still expected to meet the same correctness, provenance, security, and review standard regardless of how it was produced.

## Evidence and proof boundaries

CritIQ distinguishes several kinds of evidence:

```text
source inspection
unit-test evidence
compiler evidence
production-build evidence
installer artifact evidence
desktop acceptance evidence
```

These are not interchangeable.

A passing unit test does not prove a desktop interaction works. A successful build does not prove the installer behaves correctly. A manual acceptance pass does not replace reproducible automated checks.

Pull requests and release notes must avoid claiming more than the available evidence proves.

## Merge expectations

A change is merge-ready when:

1. its intended consequence is explicit;
2. changed behavior is covered by suitable tests where practical;
3. `npm test -- --run` passes;
4. `cargo check --locked --manifest-path src-tauri/Cargo.toml` passes when Rust is affected;
5. `cargo test --locked --manifest-path src-tauri/Cargo.toml` passes when Rust contracts are affected;
6. the Tauri production build passes for release-affecting changes;
7. documentation matches the implemented behavior;
8. security-sensitive changes follow `SECURITY.md`;
9. known limitations are recorded rather than hidden;
10. exact-head validation is repeated when the validated commit changes materially.

## Release authority

Git history stores source and durable documentation. Generated installers are distributed through GitHub Releases rather than committed as ordinary source files.

Release-candidate installers are created only from a CI-validated repository head. The canonical Windows release assets are the NSIS `.exe` and MSI `.msi` packages attached to the corresponding repository release.

A CI artifact is build evidence. A GitHub Release is the durable distribution surface.

The maintainer decides when a release candidate becomes a final release after the applicable desktop acceptance test passes.

## Dependency and framework policy

CritIQ currently uses Tauri 2, Rust, and vanilla JavaScript ES modules.

Dependencies may be updated when they improve security, compatibility, maintainability, or product behavior. Framework migration requires a concrete product or maintenance justification and should not be undertaken solely because another stack is fashionable this week.

The committed lockfiles are part of the reproducible build boundary.

## Documentation truth rule

Active documentation must describe the current repository and product contract.

Historical plans and evidence may be retained when useful, but they must be clearly marked as historical and must not compete with active architecture or governance documentation.

The authoritative documentation map is `docs/README.md`.

## Security-sensitive changes

Security findings follow `SECURITY.md`. Do not publish credentials, exploit payloads, private screenshots, or sensitive user data merely to satisfy ordinary issue-tracking process.

Security-sensitive code and workflow changes should receive independent validation when a self-referential test could mask the same implementation mistake.

## Contribution and conduct

Contribution mechanics are defined in `CONTRIBUTING.md`. Participation expectations are defined in `CODE_OF_CONDUCT.md`. Support routing is defined in `SUPPORT.md`.

The repository license is MIT. See `LICENSE`.