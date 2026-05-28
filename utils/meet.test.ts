import { describe, expect, it } from 'vitest';
import { buildMeetUrl, isMeetCode, parseMeetCode } from './meet';

describe('parseMeetCode', () => {
  it('returns the code for a plain meet URL', () => {
    expect(parseMeetCode('https://meet.google.com/abc-defg-hij')).toBe('abc-defg-hij');
  });

  it('returns the code with query params', () => {
    expect(parseMeetCode('https://meet.google.com/abc-defg-hij?authuser=0')).toBe(
      'abc-defg-hij'
    );
  });

  it('returns null for non-meet URL', () => {
    expect(parseMeetCode('https://example.com/abc-defg-hij')).toBeNull();
  });

  it('returns null when code shape is wrong', () => {
    expect(parseMeetCode('https://meet.google.com/abcd-ef-ghij')).toBeNull();
    expect(parseMeetCode('https://meet.google.com/lookup/abc')).toBeNull();
  });

  it('returns null when the path has extras', () => {
    expect(parseMeetCode('https://meet.google.com/abc-defg-hij/extra')).toBeNull();
  });
});

describe('isMeetCode', () => {
  it('accepts valid meet codes', () => {
    expect(isMeetCode('abc-defg-hij')).toBe(true);
  });
  it('rejects invalid codes', () => {
    expect(isMeetCode('abcd-ef-ghij')).toBe(false);
    expect(isMeetCode('ABC-defg-hij')).toBe(false);
    expect(isMeetCode('')).toBe(false);
  });
});

describe('buildMeetUrl', () => {
  it('builds a Meet URL from a code', () => {
    expect(buildMeetUrl('abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij');
  });
});
