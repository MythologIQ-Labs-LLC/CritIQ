# ADR-001: Tauri 2 Local-First Desktop Architecture

- **Status:** Accepted
- **Decision owner:** MythologIQ Labs LLC
- **Maintainer:** Kevin R. Knapp

## Context

CritIQ needs native desktop screen capture, local filesystem output, a lightweight UI, and a small maintenance surface. Earlier planning material referenced Electron, but the active implementation has moved to Tauri 2.

Replatforming again would add migration cost without improving the core product problem.

## Decision

CritIQ uses:

```text
Tauri 2 desktop shell
+ Rust native boundary
+ vanilla JavaScript ES modules
+ local filesystem output
```

The product does not require an application server or cloud account.

## Consequences

### Positive

- small desktop runtime compared with a bundled browser architecture;
- native Rust boundary for capture and filesystem operations;
- simple frontend with no framework migration burden;
- local-first evidence handling;
- reproducible Windows installer generation through CI.

### Tradeoffs

- WebView capability differences can affect browser APIs such as Web Speech;
- desktop behavior requires real Windows acceptance in addition to unit tests;
- native dependencies make cross-platform expansion a deliberate engineering task rather than a free checkbox.

## Guardrails

Framework migration requires a concrete product, security, compatibility, or maintenance reason.

A new framework should not be introduced merely because it is newer or fashionable.

## Validation

The architecture is validated through:

- frontend unit tests;
- locked Rust check/tests;
- Tauri production build;
- Windows installer generation;
- desktop acceptance testing.