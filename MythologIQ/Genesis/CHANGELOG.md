# Change Log

All notable changes to the "FailSafe" extension will be documented in this file.

## [2.0.1] - 2025-12-09

### The "Genesis" Upgrade (Hybrid Architecture)

This release introduces a bifurcation of the platform into two distinct components: **FailSafe** (The Shield) and **Genesis** (The Engine).

### ✨ New Features (Genesis Engine)

- **The Living Graph**: A dynamic, D3js-powered visualization of your project's dependency graph.
  - **Visual States**: Idle (Nebula), Indexing (Gold Pulse), Blocked (Red Alert), Resolved (Harmony).
  - **Physics**: Force-directed layout that reacts to "Blocker" states by agitating nodes.
- **Cortex Omnibar**: A natural language command center (`Ask the Cortex...`) integrated into the Dashboard.
  - **Intent Scout**: Heuristic analysis of user queries (e.g., "Audit workspace", "Find auth logic") to trigger system actions.
  - **Stream**: Real-time log of system thoughts and intent confidence.
- **Starry Night UI**: A complete visual overhaul of the Dashboard with deep space aesthetics, twinkling stars, and glassmorphism cards.

### 🛡️ Enhancements (FailSafe Protocol)

- **Universal Transport Bridge**: detached the core logic from VS Code primitives, allowing the dashboard to run in a standalone browser environment for testing and "War Room" display.
- **Project Structure Validation**: Enhanced `ProjectPlan` to support "The Enlightenment Path" (Markdown-based task tracking) alongside legacy JSON.

### 🐛 Fixes

- Fixed `TransportAdapter` fallback for non-VS Code environments (HTTP polling/fetching).
- Resolved circular dependencies in the Service Injection layer (`FailSafeServer` -> `ProjectPlan`).
