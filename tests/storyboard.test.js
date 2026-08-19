import { describe, expect, it } from 'vitest';
import { buildExportCaptures } from '../dist/js/storyboard.js';

describe('buildExportCaptures', () => {
  it('preserves order and exports the annotated composite when available', () => {
    const captures = [
      {
        id: 'one',
        image: 'original-one',
        compositeImage: 'annotated-one',
        notes: [{ text: 'first' }],
        timestamp: '2026-08-19T10:00:00Z',
        metadata: { screen: 1 }
      },
      {
        id: 'two',
        image: 'original-two',
        notes: [],
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
    expect(exported[2].metadata).toEqual({});
  });
});
