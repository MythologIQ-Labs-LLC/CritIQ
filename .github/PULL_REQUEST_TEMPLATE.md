## Purpose

<!-- What changes, and why does it belong in CritIQ? -->

## Change class

- [ ] Editorial
- [ ] Implementation
- [ ] Contract
- [ ] Security / release / governance
- [ ] Product-boundary proposal

## User-visible consequence

<!-- Describe the behavior before and after this change. -->

## Contract impact

- [ ] No consumer-facing contract change
- [ ] Storyboard / manifest contract affected
- [ ] Filesystem output affected
- [ ] Installer / release behavior affected
- [ ] Compatibility analysis included below

## Validation performed

- [ ] `npm test -- --run`
- [ ] `cargo check --locked --manifest-path src-tauri/Cargo.toml`
- [ ] `cargo test --locked --manifest-path src-tauri/Cargo.toml`
- [ ] `npm run build`
- [ ] `git diff --exit-code -- src-tauri/Cargo.lock`
- [ ] Desktop acceptance performed where applicable
- [ ] Documentation updated

### Evidence

<!-- Link the CI run, reproduction, screenshots, test output, or other evidence. -->

## What remains unproven?

<!-- State limitations honestly. A green unit test is not a desktop acceptance pass. -->

## Governance and authority

- [ ] The change stays within the current CritIQ product boundary, or the expansion is explicitly identified.
- [ ] Security-sensitive material is not exposed publicly.
- [ ] AI-assisted work, if used, remained within delegated repository scope.
- [ ] Generated installers are distributed through Releases rather than committed to source history.

## Reviewer notes

<!-- Anything a maintainer should pay special attention to. -->
