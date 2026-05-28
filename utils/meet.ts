import { MEET_CODE_RE, MEET_URL_RE } from './constants';

export function parseMeetCode(url: string): string | null {
  const m = url.match(MEET_URL_RE);
  return m ? m[1] : null;
}

export function isMeetCode(code: string): boolean {
  return MEET_CODE_RE.test(code);
}

export function buildMeetUrl(code: string): string {
  return `https://meet.google.com/${code}`;
}
