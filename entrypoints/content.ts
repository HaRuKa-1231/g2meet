import { t } from '@/utils/i18n';
import type { Detection, ToastMessage } from '@/utils/types';

type ToastState =
  | { kind: 'detecting'; speakerName: string }
  | { kind: 'meet-ready'; url: string }
  | null;

const HOST_ID = 'suggest-transcript-toast-host';
const STYLE_ID = 'suggest-transcript-toast-style';
const INIT_FLAG = '__suggest_transcript_isolated_inited';
const NONCE_ATTR = 'data-suggest-transcript-nonce';

const STYLE = `
@keyframes st-enter {
  0%   { opacity: 0; transform: translate(0, -12px) scale(0.9); }
  55%  { opacity: 1; transform: translate(0, 4px) scale(1.04); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes st-pulse {
  0%   { box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 0 rgba(99,102,241,0.55); }
  70%  { box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 14px rgba(99,102,241,0); }
  100% { box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 0 rgba(99,102,241,0); }
}
#${HOST_ID} {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  color: #f9fafb;
}
#${HOST_ID} .st-card {
  background: rgba(17, 24, 39, 0.97);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 14px 16px;
  min-width: 300px;
  max-width: 340px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.25);
  font-size: 13px;
  line-height: 1.5;
  animation:
    st-enter 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
    st-pulse 1400ms ease-out 380ms 2;
}
#${HOST_ID} .st-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
#${HOST_ID} .st-body { opacity: 0.78; margin-bottom: 12px; }
#${HOST_ID} .st-url {
  display: block;
  padding: 8px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 12px;
  color: #e5e7eb;
}
#${HOST_ID} .st-row { display: flex; gap: 6px; }
#${HOST_ID} .st-row + .st-row { margin-top: 6px; }
#${HOST_ID} button {
  flex: 1;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 120ms, border-color 120ms;
}
#${HOST_ID} button.st-primary { background: #3b82f6; color: white; }
#${HOST_ID} button.st-primary:hover { background: #2563eb; }
#${HOST_ID} button.st-secondary {
  background: rgba(255,255,255,0.06);
  color: #e5e7eb;
  border-color: rgba(255,255,255,0.12);
}
#${HOST_ID} button.st-secondary:hover { background: rgba(255,255,255,0.12); }
`;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLE;
  document.documentElement.appendChild(style);
}

function ensureHost(): HTMLElement {
  ensureStyle();
  let host = document.getElementById(HOST_ID);
  if (host) return host;
  host = document.createElement('div');
  host.id = HOST_ID;
  document.documentElement.appendChild(host);
  return host;
}

function makeBtn(
  label: string,
  onClick: () => void | Promise<void>,
  variant: 'primary' | 'secondary'
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = variant === 'primary' ? 'st-primary' : 'st-secondary';
  btn.textContent = label;
  btn.addEventListener('click', () => void onClick());
  return btn;
}

function row(children: HTMLElement[]): HTMLElement {
  const r = document.createElement('div');
  r.className = 'st-row';
  for (const c of children) r.appendChild(c);
  return r;
}

function render(state: ToastState) {
  const host = ensureHost();
  host.replaceChildren();
  if (!state) return;

  const card = document.createElement('div');
  card.className = 'st-card';

  if (state.kind === 'detecting') {
    appendText(card, 'st-title', t('toast_detected_title'));
    appendText(card, 'st-body', t('toast_detected_body', { name: state.speakerName }));
    card.appendChild(
      row([makeBtn(t('btn_start_meet'), () => send({ type: 'create-meet' }), 'primary')])
    );
    card.appendChild(
      row([
        makeBtn(t('btn_close'), () => send({ type: 'dismiss' }), 'secondary'),
        makeBtn(
          t('btn_suppress_5'),
          () => send({ type: 'suppress', minutes: 5 }),
          'secondary'
        ),
        makeBtn(
          t('btn_suppress_10'),
          () => send({ type: 'suppress', minutes: 10 }),
          'secondary'
        ),
      ])
    );
  } else {
    appendText(card, 'st-title', t('toast_meet_title'));
    appendText(card, 'st-body', t('toast_meet_body'));
    const url = document.createElement('code');
    url.className = 'st-url';
    url.textContent = state.url;
    card.appendChild(url);

    const copyBtn = makeBtn(
      t('btn_copy_url'),
      async () => {
        try {
          await navigator.clipboard.writeText(state.url);
          copyBtn.textContent = t('btn_copied');
          setTimeout(() => {
            if (copyBtn.isConnected) copyBtn.textContent = t('btn_copy_url');
          }, 1500);
        } catch (e) {
          console.warn('[suggest-transcript] copy failed', e);
        }
      },
      'primary'
    );
    card.appendChild(
      row([
        copyBtn,
        makeBtn(t('btn_close'), () => send({ type: 'dismiss' }), 'secondary'),
      ])
    );
  }

  host.appendChild(card);
}

function appendText(parent: HTMLElement, className: string, text: string) {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text;
  parent.appendChild(el);
}

function send(payload: unknown) {
  chrome.runtime.sendMessage(payload).catch((e) => {
    console.warn('[suggest-transcript] sendMessage failed', e);
  });
}

export default defineContentScript({
  matches: ['https://app.gather.town/*'],
  runAt: 'document_idle',
  main() {
    const w = window as Window & { [INIT_FLAG]?: boolean };
    if (w[INIT_FLAG]) return;
    w[INIT_FLAG] = true;

    const NONCE = crypto.randomUUID();
    document.documentElement.setAttribute(NONCE_ATTR, NONCE);
    document.documentElement.setAttribute('data-suggest-transcript', 'loaded');

    Promise.all([
      chrome.storage.local.get('meetUrl'),
      chrome.storage.session.get('detection'),
    ]).then(([{ meetUrl }, { detection }]) => {
      if (meetUrl) render({ kind: 'meet-ready', url: meetUrl as string });
      else if (detection) {
        const d = detection as Detection;
        render({ kind: 'detecting', speakerName: d.speakerName });
      }
    });

    chrome.runtime.onMessage.addListener((msg: ToastMessage) => {
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'toast-detecting') {
        render({ kind: 'detecting', speakerName: msg.speakerName });
      } else if (msg.type === 'toast-meet') {
        render({ kind: 'meet-ready', url: msg.url });
      } else if (msg.type === 'toast-hide') {
        render(null);
      }
    });

    const messageHandler = (event: MessageEvent) => {
      if (event.source !== window) return;
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.nonce !== NONCE) return;

      if (msg.type === 'suggest-transcript/gather-event') {
        send({
          type: 'gather-event',
          eventName: msg.eventName,
          speakerId: msg.speakerId,
          speakerName: msg.speakerName,
          dist: msg.dist,
          sameMap: msg.sameMap,
        });
      } else if (import.meta.env.DEV && msg.type === 'suggest-transcript/test-fire') {
        send({ type: 'test-fire', speakerName: msg.speakerName });
      }
    };
    window.addEventListener('message', messageHandler);

    window.addEventListener('pagehide', () => {
      window.removeEventListener('message', messageHandler);
    });
  },
});
