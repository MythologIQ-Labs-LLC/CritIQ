# Security Policy

CritIQ is a local-first desktop screenshot and storyboard application. It handles visual evidence that may contain sensitive information, so security includes both application behavior and responsible data handling.

## Supported versions

Security maintenance currently targets:

- the latest commit on `main`;
- the latest published release candidate or final release;
- the active CI/release workflow used to produce current installers.

Historical commits and experimental branches are not independently supported security releases.

## Reporting a vulnerability

Please do **not** publish exploit details, credentials, private screenshots, customer data, or sensitive proof-of-concept material in a public issue.

Prefer GitHub private vulnerability reporting or a repository security advisory from the **Security** tab when available.

If private reporting is unavailable, open a minimal public issue requesting a private reporting channel. Do not include the exploit payload or sensitive data in that issue.

## In-scope examples

Security-relevant findings include:

- path traversal or unsafe filesystem output;
- unexpected shell or command-execution capability;
- capture behavior that exposes content outside the user's selected scope;
- export behavior that leaks unselected or deleted frame data;
- archive construction that permits unsafe paths;
- installer or release-pipeline tampering;
- dependency vulnerabilities with realistic impact on the desktop application;
- unsafe handling of sensitive screenshots, notes, or metadata;
- a workflow that can publish an unvalidated installer as an official release asset.

## Usually not a security vulnerability

These normally belong in public bug or feature tracking:

- a missing feature CritIQ does not claim to implement;
- visual polish issues;
- annotation-tool usability problems without a confidentiality, integrity, or execution consequence;
- disagreement with a product-boundary decision.

## Local-first boundary

CritIQ currently does not require an application server, cloud account, cloud synchronization, autonomous browser control, embedded AI inference, or shell permission.

This reduces unnecessary external data exposure. It does not make captured screenshots non-sensitive.

Users should review evidence before sharing it outside their machine.

## Public test-data rule

Never use real credentials, authentication tokens, private customer interfaces, regulated data, or other sensitive production material as a public fixture or proof-of-concept.

Use synthetic screenshots and synthetic metadata.

## Release integrity

Generated installers are produced by the repository CI pipeline and published as GitHub Release assets only after validation succeeds.

Release workflows should preserve the binding between:

```text
source commit
-> validation run
-> build artifact
-> published release asset
```

A change to that chain is security-sensitive repository work.

## Dependency security

Keep dependency changes bounded and review the actual transitive consequence. Lockfiles are part of the reproducible build boundary.

Security fixes may update dependencies outside the normal cadence when necessary, but they must still preserve compatibility and validation evidence.

## Disclosure expectations

Please allow reasonable time to reproduce, assess, patch, validate, and publish a corrected build before public disclosure.

Security fixes should preserve evidence rather than quietly rewriting history.