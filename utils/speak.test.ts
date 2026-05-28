import { describe, expect, it } from 'vitest';
import { emptyState, nextSpeakAction } from './speak';

describe('nextSpeakAction', () => {
  it("returns 'start' when becoming active from idle", () => {
    expect(nextSpeakAction(emptyState(), true)).toBe('start');
  });

  it("returns 'ignore' when already active and another active event arrives", () => {
    expect(nextSpeakAction({ startedAt: 100, timerId: 1 }, true)).toBe('ignore');
  });

  it("returns 'cancel' when active → inactive", () => {
    expect(nextSpeakAction({ startedAt: 100, timerId: 1 }, false)).toBe('cancel');
  });

  it("returns 'ignore' when already idle and inactive event arrives", () => {
    expect(nextSpeakAction(emptyState(), false)).toBe('ignore');
  });
});
