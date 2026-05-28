import { describe, expect, it } from 'vitest';
import { selectView } from './view';
import type { Detection } from './types';

const detection: Detection = { ts: 1, speakerName: 'A' };

describe('selectView', () => {
  it('returns idle when no state', () => {
    expect(selectView(null, null)).toBe('idle');
    expect(selectView(undefined, undefined)).toBe('idle');
  });

  it('returns detecting when only detection is set', () => {
    expect(selectView(detection, null)).toBe('detecting');
  });

  it('returns meet when meetUrl is set, regardless of detection', () => {
    expect(selectView(null, 'https://meet.google.com/abc-defg-hij')).toBe('meet');
    expect(selectView(detection, 'https://meet.google.com/abc-defg-hij')).toBe('meet');
  });
});
