export type SpeakState = {
  startedAt: number | null;
  timerId: number | null;
};

export const emptyState = (): SpeakState => ({ startedAt: null, timerId: null });

export type SpeakAction = 'start' | 'cancel' | 'ignore';

export function nextSpeakAction(state: SpeakState, isActive: boolean): SpeakAction {
  if (isActive) {
    return state.startedAt === null ? 'start' : 'ignore';
  }
  return state.startedAt === null ? 'ignore' : 'cancel';
}
