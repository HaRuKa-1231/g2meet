import { MEET_JOIN_MAX_TRIES, MEET_JOIN_TRY_MS } from '@/utils/constants';

const JOIN_BUTTON_RE = /今すぐ参加|Join now|参加/;

export default defineContentScript({
  matches: ['https://meet.google.com/*'],
  runAt: 'document_idle',
  main() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || typeof msg !== 'object' || msg.type !== 'auto-join') return;
      startAutoJoin();
    });
  },
});

function startAutoJoin() {
  let tries = 0;
  const interval = setInterval(() => {
    tries++;
    if (document.hidden) return;
    if (tryClickJoin() || tries > MEET_JOIN_MAX_TRIES) {
      clearInterval(interval);
    }
  }, MEET_JOIN_TRY_MS);
  window.addEventListener('pagehide', () => clearInterval(interval), { once: true });
}

function tryClickJoin(): boolean {
  const buttons = document.querySelectorAll<HTMLButtonElement>('button');
  for (const b of buttons) {
    const text = (b.textContent ?? '').trim();
    if (JOIN_BUTTON_RE.test(text)) {
      b.click();
      return true;
    }
  }
  return false;
}
