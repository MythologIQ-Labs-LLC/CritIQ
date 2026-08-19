# CritIQ Complete Desktop Acceptance Test

Run this against the Windows bundle produced by CI. The goal is to test the complete local feature set in one pass rather than validating isolated slices.

## Pass criteria

The build passes only if all required checks below succeed without state loss, cross-frame contamination, export corruption, or misleading UI.

## 1. Launch and capture

1. Launch CritIQ.
2. Confirm the application opens with no frame selected and Save/Export disabled.
3. Capture the primary screen.
4. Capture a second state using a 2-second delay.
5. Capture a third state using Quick Region.
6. Capture a fourth state using Select Region.
7. If multiple monitors are available, capture All Screens.

Expected:

- every capture becomes a distinct filmstrip frame;
- dimensions and image content match the chosen capture mode;
- existing frame annotations/notes survive new captures.

## 2. Annotation tools

On frame 1, add each annotation type:

1. Pen stroke.
2. Arrow.
3. Line.
4. Rectangle.
5. Ellipse.
6. Text.
7. Change color and draw another shape.
8. Change size and draw another shape.

Expected:

- all annotations remain independent;
- color and size affect new annotations;
- no selection handles become part of the visual annotation itself.

## 3. Selection and editing

1. Switch to Select.
2. Select the rectangle.
3. Drag it to a visibly different position.
4. Select the ellipse and move it.
5. Delete one selected annotation.
6. Undo.
7. Clear annotations.
8. Undo the clear.

Expected:

- selection targets the topmost annotation under the pointer;
- moving one annotation does not move another;
- Delete removes only the selected annotation;
- Undo restores the previous annotation state;
- Clear can be undone.

## 4. Notes and annotation links

1. With no annotation selected, add a frame note.
2. Select an annotation.
3. Confirm the note-target indicator says notes will link to that annotation.
4. Add a second note.
5. If Web Speech is available, dictate text into the note field and submit it.
6. Delete the linked annotation.
7. Select a different annotation and add a third note that remains linked for export verification.

Expected:

- the first note is a frame note;
- the second note shows an annotation-link badge;
- speech transcription is optional and only presented as available when the WebView supports it;
- deleting the annotation converts its linked note back to a frame note rather than deleting the note;
- the third note remains linked and supplies an `annotationId` for export verification.

## 5. Frame isolation

1. Give every frame a different annotation and note.
2. Navigate repeatedly through frames 1 through 4.
3. Return to frame 1.
4. Take another capture.

Expected:

- each frame restores only its own annotations and notes;
- no canvas state leaks between frames;
- taking another capture does not erase the active frame's latest edits.

## 6. Zoom and pan

1. Zoom in with the toolbar.
2. Zoom out.
3. Use Ctrl/Cmd + mouse wheel to zoom.
4. Enable Pan and drag the image.
5. Disable Pan and confirm annotation editing works again.
6. Reset View.

Expected:

- annotations remain aligned with the screenshot at every zoom level;
- panning does not modify annotations;
- Reset View returns to 100% with zero pan offset.

## 7. Storyboard ordering

1. Move frame 4 left twice.
2. Move another frame right.
3. Delete one non-active frame.

Expected:

- active-frame identity remains correct after reordering;
- filmstrip sequence numbers update immediately;
- deleted frames do not transfer state to neighboring frames.

## 8. Save Frame

1. Save Frame.
2. Open `Pictures/CritIQ/Saved`.
3. Verify an annotated full-resolution PNG and matching JSON sidecar were created.

Expected:

- Save succeeds without asking for a directory;
- the saved frame uses `.png` at the capture's full resolution;
- JSON contains notes, annotations, metadata, timestamp, and image filename.

## 9. ZIP export

1. Choose Storyboard ZIP.
2. Export as PNG.
3. Unpack the ZIP outside CritIQ.

Expected bundle:

```text
storyboard.md
manifest.json
frames/
  001.png
  002.png
  ...
```

Verify:

- frame count matches the filmstrip;
- numbered images match the final visual state;
- order matches the reordered filmstrip;
- `manifest.json` uses `critiq.storyboard/v1`;
- every frame has ID, sequence, timestamp, image path, notes, annotations, and metadata;
- linked notes contain `annotationId`;
- `storyboard.md` uses the same frame order.

## 10. JPEG and alternate exports

1. Export the same storyboard as JPEG at 70% quality and 75% frame size.
2. Verify frame files use `.jpg` and their pixel dimensions are 75% of the captured dimensions.
3. Repeat at 50% frame size and verify the reduced dimensions.
4. Export as Storyboard folder.
5. Export using the Markdown entry-point option.

Expected:

- all three export modes complete successfully;
- JPEG paths in Markdown and manifest use `.jpg`;
- output resizing changes exported pixels without changing the authoritative filmstrip order or annotation geometry;
- folder export contains the complete canonical bundle;
- Markdown export returns the generated `storyboard.md` path.

## 11. New session

1. Click New Session while frames exist.
2. Cancel the warning.
3. Confirm the current session remains intact.
4. Click New Session again and accept.

Expected:

- cancellation is non-destructive;
- acceptance clears the filmstrip, preview, annotations, notes, and active session state;
- Save and Export return to disabled state.

## Failure policy

Any state loss, wrong-frame restoration, annotation/image misalignment, broken Save, incorrect output extension, malformed ZIP, mismatched sequence, or UI control that claims functionality it does not perform is a product failure and should keep the PR in draft.
