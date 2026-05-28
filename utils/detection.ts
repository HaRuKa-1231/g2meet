import { DEBOUNCE_MS } from './constants';
import type { Detection } from './types';

export type SessionStateLike = {
  lastDetectAt?: number;
  pendingMeetTabId?: number;
  suppressUntil?: number;
  detection?: Detection;
};

export type DetectionAction = 'start' | 'continue' | 'ignore';

export type DecideArgs = {
  state: SessionStateLike;
  now: number;
  enabled: boolean;
  debounceMs?: number;
};

export function decideDetectionAction({
  state,
  now,
  enabled,
  debounceMs = DEBOUNCE_MS,
}: DecideArgs): DetectionAction {
  if (!enabled) return 'ignore';
  if (state.suppressUntil && now < state.suppressUntil) return 'ignore';
  if (state.detection) return 'continue';
  if (state.lastDetectAt && now - state.lastDetectAt < debounceMs) return 'ignore';
  return 'start';
}
