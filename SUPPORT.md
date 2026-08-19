# CritIQ Support

CritIQ is a public MythologIQ Labs LLC project. Use the channel that matches the problem so support, product discussion, and security reporting do not collapse into one very unhelpful pile.

## Installation problems

Before opening an issue:

1. confirm you are using a current GitHub Release asset;
2. prefer the `x64-setup.exe` installer for normal Windows installation;
3. use the MSI only when your environment specifically requires MSI packaging;
4. record the CritIQ version and Windows version;
5. note whether the failure occurs during download, installation, launch, capture, or export.

Useful issue details:

```text
CritIQ version:
Installer type: EXE / MSI
Windows version:
What happened:
What you expected:
Steps to reproduce:
Error text:
```

Do not attach screenshots that expose credentials or private customer data.

## Bugs

Use the repository bug-report template.

A strong bug report contains:

- reproducible steps;
- expected behavior;
- actual behavior;
- version/build information;
- the smallest safe evidence needed to understand the defect;
- whether the defect reproduces in a fresh session.

## Feature requests

Use the feature-request template.

Explain the user problem before proposing an implementation. If the request expands CritIQ into browser automation, cloud services, OCR, video, embedded AI, collaboration, integrations, or plugins, identify it as a product-boundary proposal rather than disguising it as a tiny checkbox.

## Security findings

Do not use a public support issue for sensitive vulnerabilities.

Follow `SECURITY.md`.

## Development questions

Start with:

- `README.md`;
- `docs/README.md`;
- `docs/ARCHITECTURE_PLAN.md`;
- `CONTRIBUTING.md`;
- `GOVERNANCE.md`.

Questions that reveal a documentation gap are useful. If the answer is durable and broadly relevant, prefer improving the repository docs rather than leaving knowledge trapped in one issue thread.

## Project scope

Support is for CritIQ and its declared product surface. General AI coding-agent support, browser automation support, or unrelated MythologIQ Labs projects should be routed to the appropriate repository.