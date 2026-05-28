export const DEBOUNCE_MS = 30_000;
export const POST_CREATE_SUPPRESS_MS = 5 * 60_000;
export const IDLE_DISMISS_MS = 30_000;
export const SPEAK_THRESHOLD_MS = 3_000;

export const MEET_JOIN_TRY_MS = 1_000;
export const MEET_JOIN_MAX_TRIES = 30;

export const GATHER_URL_MATCH = 'https://app.gather.town/*';

export const MEET_CODE_RE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
export const MEET_URL_RE =
  /^https:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})(\?.*)?$/;
