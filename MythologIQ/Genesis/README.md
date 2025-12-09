# FailSafe: Powered by Genesis

> **One Platform. Two Modes.**  
> _Passive Safety. Active Creation._

---

## 🛡️ FailSafe (The Shield)

**The Passive Safety Net for AI Development. Zero Hallucination.**

FailSafe is the core, lightweight protocol designed to keep your AI development grounded. It acts as an audit layer between your LLM and your codebase.

### Core Features

- **Prompt Auditing**: Automatically scans LLM prompts for rigorousness and context.
- **Validation Gates**: Pre-commit hooks (`gate:spec`, `gate:deps`) to prevent drift.
- **Slash Commands**: Quick access to best interactions (`/kata_focus`, `/kata_shield`).
- **The Stream**: A passive log of all AI actions, ensuring transparency.

---

## 🌌 Genesis (The Engine)

**The Active Build System. The Living Graph.**

Genesis is the advanced "System 2" engine that runs atop FailSafe. It doesn't just watch; it _builds_.

### Advanced Features

- **The Living Graph**: Real-time D3 visualization of your project's neural architecture (Dependencies, Imports, Flow).
- **Cortex Omnibar**: A natural language interface to query your project's state ("Where is the circular dependency?", "Visualise the auth module").
- **Agentic Workflows**: Autonomous execution of complex refactors and "Starship" architecture generation.
- **The Prism**: A "Zero-UI" provocation engine for breaking creative blocks.

---

## Installation

[Visual Studio Marketplace: FailSafe](https://marketplace.visualstudio.com/items?itemName=MythologIQ.failsafe)

## Usage

### Mode 1: Safety Only (FailSafe)

Simply install the extension. The **Stream** and **Gates** are active by default. You will see "Shield Active" in your status bar.

### Mode 2: Full Engine (Genesis)

Open the **Dashboard** (`Cmd+Alt+G`) to enter the Dojo.

- **Cortex**: Type in the Omnibar to scout the workspace.
- **Graph**: Watch the Living Graph react to your code changes.

## Development

### Project Structure

- `.gemini/specs`: Specification and Requirements (The Law)
- `src/server`: The Backend Logic (Fastify, Gates, Graph)
- `src/dashboard`: The Frontend UI (D3, Starry Night Theme)
- `src/extension`: The VS Code Glue (Decorators, Sidebar)

### Running Locally

1. `npm install`
2. `npm run watch` (Extension)
3. `npm run start:server` (Standalone Dashboard Bridge)
