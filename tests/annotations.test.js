import { describe, expect, it } from 'vitest';
import {
  cloneAnnotations,
  createAnnotation,
  hitTestAnnotations,
  moveAnnotation,
  updateDraft
} from '../dist/js/annotations.js';

describe('annotation model', () => {
  it('creates and moves vector annotations without mutating clones', () => {
    const rectangle = createAnnotation('rect', 'r1', 10, 20, {
      color: '#fff',
      size: 4
    });
    updateDraft(rectangle, 50, 60);

    const clone = cloneAnnotations([rectangle]);
    moveAnnotation(rectangle, 5, -5);

    expect(rectangle.x1).toBe(15);
    expect(rectangle.y1).toBe(15);
    expect(clone[0].x1).toBe(10);
    expect(clone[0].y1).toBe(20);
  });

  it('hit-tests topmost shapes and pen strokes', () => {
    const rectangle = {
      id: 'r1',
      type: 'rect',
      color: '#fff',
      size: 4,
      x1: 10,
      y1: 10,
      x2: 100,
      y2: 100
    };
    const pen = {
      id: 'p1',
      type: 'pen',
      color: '#fff',
      size: 4,
      points: [{ x: 20, y: 20 }, { x: 80, y: 80 }]
    };

    expect(hitTestAnnotations([rectangle, pen], 50, 50, 6)).toBe('p1');
    expect(hitTestAnnotations([rectangle], 95, 95, 2)).toBe('r1');
    expect(hitTestAnnotations([rectangle], 200, 200, 4)).toBeNull();

    const line = {
      id: 'l1', type: 'line', color: '#fff', size: 4,
      x1: 0, y1: 100, x2: 100, y2: 100
    };
    expect(hitTestAnnotations([line], 50, 103, 4)).toBe('l1');
  });
});
