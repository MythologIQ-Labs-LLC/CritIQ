# CritIQ Feature Matrix

This is the authoritative checklist for the complete local desktop product surface.

| Area | Feature | Status | Evidence / behavior |
|---|---|---:|---|
| Capture | Selected screen | Implemented | Screen selector + Rust capture command |
| Capture | All screens | Implemented | Dedicated action and selector option |
| Capture | Quick region | Implemented | Primary-screen region selection |
| Capture | Cross-desktop region | Implemented | All-screen fast capture + region selector |
| Capture | Delay | Implemented | 0s / 2s / 5s countdown |
| Capture | Capture metadata | Implemented | Dimensions, timestamp, mode, screen/region context |
| Storyboard | Multi-frame session | Implemented | Ordered frame collection |
| Storyboard | Filmstrip navigation | Implemented | Frame thumbnails and active state |
| Storyboard | Delete frame | Implemented | Filmstrip delete action |
| Storyboard | Reorder frames | Implemented | Move-left / move-right controls |
| Storyboard | New session | Implemented | Explicit reset action with data-loss confirmation |
| Annotation | Select / move | Implemented | Vector hit-testing and drag |
| Annotation | Pen | Implemented | Vector point sequence |
| Annotation | Arrow | Implemented | Vector endpoints |
| Annotation | Line | Implemented | Vector endpoints |
| Annotation | Rectangle | Implemented | Vector bounds |
| Annotation | Ellipse | Implemented | Vector bounds |
| Annotation | Text | Implemented | Positioned text annotation |
| Annotation | Color | Implemented | Color input |
| Annotation | Size | Implemented | Stroke/text size input |
| Annotation | Undo | Implemented | Annotation snapshots |
| Annotation | Delete selected | Implemented | Tool button + keyboard |
| Annotation | Clear | Implemented | Removes annotations while preserving notes as frame notes |
| Viewer | Zoom | Implemented | Buttons, shortcuts, Ctrl/Cmd + wheel |
| Viewer | Pan | Implemented | Pan mode + middle-button pan |
| Viewer | Reset view | Implemented | Button + Ctrl/Cmd+0 |
| Notes | Frame notes | Implemented | Text note list |
| Notes | Web Speech | Implemented when supported | Microphone control is hidden when the WebView lacks Web Speech |
| Notes | Annotation-linked notes | Implemented | Selected annotation ID captured in note |
| Save | Save active frame | Implemented | Full-resolution PNG + JSON sidecar |
| Save | Safe default directory | Implemented | Pictures/CritIQ/Saved |
| Export | ZIP | Implemented | Portable complete bundle |
| Export | Folder | Implemented | Unpacked canonical bundle |
| Export | Markdown entry point | Implemented | Storyboard Markdown |
| Export | PNG | Implemented | Lossless frame output |
| Export | JPEG | Implemented | Selectable quality |
| Export | Frame resizing | Implemented | 100%, 75%, or 50% output scale |
| Export | Flattened visual evidence | Implemented | Annotation composite |
| Export | Structured annotations | Implemented | `manifest.json` vector annotation data |
| Export | Annotation-linked notes | Implemented | `annotationId` on linked notes |
| Export | Deterministic frame order | Implemented | Numbered frame paths and sequence field |
| Security | Local-first | Implemented | No required network service |
| Security | Session path sanitization | Implemented | Rust filesystem boundary |
| Security | No shell permission | Implemented | Shell plugin/permission removed |
| Validation | Frontend unit tests | Implemented | Storyboard + annotation-model contracts |
| Validation | Rust tests | Implemented | Bundle, archive, path, format contracts |
| Validation | Windows production build | Implemented | CI build artifact |

## Deliberate non-goals

The following are not missing features. They are outside the product boundary unless the product direction is deliberately expanded later:

- autonomous browser navigation
- cloud accounts or synchronization
- collaborative editing
- OCR
- video recording
- embedded AI inference
- issue-tracker integrations
- Figma/design-system integration
- plugin loading

The distinction matters. A product is not incomplete merely because one can imagine attaching the rest of the software industry to it.
