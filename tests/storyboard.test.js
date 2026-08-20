import { describe, expect, it } from 'vitest';
import { buildExportCaptures } from '../dist/js/storyboard.js';

describe('buildExportCaptures', () => {
  it('preserves order, annotations, linked notes, and composited images', () => {
    const captures = [
      {
        id: 'one',
        image: 'original-one',
        compositeImage: 'annotated-one',
        notes: [{ text: 'first', annotationId: 'a1' }],
        annotations: [{ id: 'a1', type: 'rect', x1: 1, y1: 2, x2: 3, y2: 4 }],
        timestamp: '2026-08-19T10:00:00Z',
        metadata: { screen: 1 }
      },
      {
        id: 'two',
        image: 'original-two',
        notes: [],
        annotations: [],
        timestamp: '2026-08-19T10:01:00Z',
        metadata: { screen: 2 }
      },
      {
        id: 'three',
        image: 'original-three',
        compositeImage: 'annotated-three',
        notes: [{ text: 'third' }],
        timestamp: '2026-08-19T10:02:00Z'
      }
    ];

    const exported = buildExportCaptures(captures);

    expect(exported.map((frame) => frame.id)).toEqual(['one', 'two', 'three']);
    expect(exported.map((frame) => frame.image)).toEqual([
      'annotated-one',
      'original-two',
      'annotated-three'
    ]);
    expect(exported[0].notes).not.toBe(captures[0].notes);
    expect(exported[0].annotations).not.toBe(captures[0].annotations);
    expect(exported[0].annotations[0]).toEqual(captures[0].annotations[0]);
    expect(exported[2].metadata).toEqual({});
  });
});
