# CritIQ Product Concept

## Mission

CritIQ turns a user-directed walkthrough of a real interface into one portable, ordered, annotated evidence bundle that a developer or coding agent can understand and act on without reconstructing the walkthrough.

## Problem

AI-assisted UI work commonly forces a bad choice between isolated screenshots and autonomous browser control. Isolated screenshots lose sequence and require repetitive capture and explanation. Autonomous browsing gives the agent control over what it observes and can miss the narrative the user actually wants to communicate.

Design handoff tools solve a different problem: they communicate intended state. CritIQ captures runtime truth.

## Product contract

The user remains the narrator:

1. navigate the real application;
2. capture meaningful UI states;
3. annotate each frame;
4. attach text or voice notes;
5. review the ordered filmstrip;
6. export the whole story as one storyboard artifact.

The exported storyboard preserves what the user saw, what the user marked, what the user said, and the order in which it mattered.

## Principles

- **User-directed:** CritIQ never autonomously decides where to navigate or what to capture.
- **Runtime-first:** evidence comes from the running interface, not an abstract design representation.
- **Ordered:** sequence is part of the evidence.
- **Portable:** the primary handoff is one ZIP that can be understood without CritIQ.
- **Local-first:** capture and export do not require an account or cloud service.
- **Small:** features that do not materially improve storyboard capture or consumption are outside v1.

## Non-goals

CritIQ is not a general-purpose image editor, browser automation agent, screen recorder, cloud collaboration platform, design-system replacement, plugin platform, or embedded coding agent.

## v1 destination

A successful v1 allows a user to capture at least three distinct UI states, independently annotate and note them, navigate among them without losing state, and export a ZIP containing annotated numbered frames, `storyboard.md`, and `manifest.json` in the same order the user reviewed them.
