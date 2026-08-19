# ADR-002: User-Directed Evidence Selection

- **Status:** Accepted
- **Decision owner:** MythologIQ Labs LLC
- **Maintainer:** Kevin R. Knapp

## Context

AI-assisted UI development needs accurate evidence about the real running interface.

Two common alternatives have drawbacks:

1. design handoff captures intended design but not necessarily runtime state;
2. autonomous browser agents can inspect the application, but they choose what evidence to collect and can remove the user's control over emphasis and sequence.

CritIQ exists specifically between those approaches.

## Decision

Evidence selection remains **user-directed**.

The user navigates the real application, decides when a state matters, captures it, annotates it, explains it, and determines the storyboard sequence.

CritIQ may help preserve and structure that evidence. It does not autonomously decide what pages to visit or what evidence matters.

## Consequences

### Positive

- the domain expert controls emphasis;
- runtime truth is captured directly;
- evidence sequence reflects the user's intended narrative;
- the product remains small and local-first;
- downstream developers or coding agents receive a bounded evidence package rather than an opaque browsing trace.

### Tradeoffs

- the user must actively perform the walkthrough;
- CritIQ does not replace autonomous QA or browser testing systems;
- completeness depends on the evidence the user chooses to capture.

## Non-goals created by this decision

The following require a future product-direction decision:

- autonomous navigation;
- browser-agent planning;
- unattended capture sessions;
- autonomous evidence ranking.

## Validation

The product should make capture, ordering, annotation, and explanation fast enough that user control remains an advantage rather than becoming clerical burden.