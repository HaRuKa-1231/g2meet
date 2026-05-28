import { describe, expect, it } from 'vitest';
import { decideDetectionAction, type SessionStateLike } from './detection';

const now = 1_000_000;
const base: SessionStateLike = {};

describe('decideDetectionAction', () => {
  it("returns 'start' when enabled and no prior state", () => {
    expect(decideDetectionAction({ state: base, now, enabled: true })).toBe('start');
  });

  it("returns 'ignore' when disabled", () => {
    expect(decideDetectionAction({ state: base, now, enabled: false })).toBe('ignore');
  });

  it("returns 'ignore' when suppress is active", () => {
    expect(
      decideDetectionAction({
        state: { suppressUntil: now + 60_000 },
        now,
        enabled: true,
      })
    ).toBe('ignore');
  });

  it("returns 'start' when suppress has expired", () => {
    expect(
      decideDetectionAction({
        state: { suppressUntil: now - 1 },
        now,
        enabled: true,
      })
    ).toBe('start');
  });

  it("returns 'continue' when detection is already active", () => {
    expect(
      decideDetectionAction({
        state: { detection: { ts: now - 100, speakerName: 'A' } },
        now,
        enabled: true,
      })
    ).toBe('continue');
  });

  it("prefers 'ignore' over 'continue' if suppressed", () => {
    expect(
      decideDetectionAction({
        state: {
          detection: { ts: now - 100, speakerName: 'A' },
          suppressUntil: now + 1000,
        },
        now,
        enabled: true,
      })
    ).toBe('ignore');
  });

  it("returns 'ignore' when within debounce window", () => {
    expect(
      decideDetectionAction({
        state: { lastDetectAt: now - 10_000 },
        now,
        enabled: true,
        debounceMs: 30_000,
      })
    ).toBe('ignore');
  });

  it("returns 'start' once debounce window has elapsed", () => {
    expect(
      decideDetectionAction({
        state: { lastDetectAt: now - 31_000 },
        now,
        enabled: true,
        debounceMs: 30_000,
      })
    ).toBe('start');
  });

  it('uses custom debounceMs', () => {
    expect(
      decideDetectionAction({
        state: { lastDetectAt: now - 4_000 },
        now,
        enabled: true,
        debounceMs: 5_000,
      })
    ).toBe('ignore');
  });
});
