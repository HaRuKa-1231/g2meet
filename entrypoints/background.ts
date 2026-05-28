import {
  GATHER_URL_MATCH,
  IDLE_DISMISS_MS,
  POST_CREATE_SUPPRESS_MS,
} from '@/utils/constants';
import { decideDetectionAction, type SessionStateLike } from '@/utils/detection';
import { buildMeetUrl, parseMeetCode } from '@/utils/meet';
import type {
  Detection,
  GatherEventMessage,
  IncomingMessage,
  ToastMessage,
} from '@/utils/types';

const IDLE_ALARM = 'idle-dismiss';

type SessionState = SessionStateLike;

const sess = chrome.storage.session;
const local = chrome.storage.local;

async function getSession(): Promise<SessionState> {
  return (await sess.get(null)) as SessionState;
}

async function forEachGatherTab(cb: (tabId: number, url: string) => Promise<void>) {
  const tabs = await chrome.tabs.query({ url: GATHER_URL_MATCH });
  await Promise.allSettled(
    tabs
      .filter((t): t is chrome.tabs.Tab & { id: number } => typeof t.id === 'number')
      .map((t) => cb(t.id, t.url ?? ''))
  );
}

async function notifyGatherTabs(payload: ToastMessage) {
  await forEachGatherTab(async (tabId) => {
    try {
      await chrome.tabs.sendMessage(tabId, payload);
    } catch {
      /* content script not ready */
    }
  });
}

async function injectAllGatherTabs() {
  await forEachGatherTab(async (tabId) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-scripts/content.js'],
      });
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-scripts/main.js'],
        world: 'MAIN',
      });
    } catch (e) {
      console.warn('[suggest-transcript] inject failed', tabId, e);
    }
  });
}

async function setBadge(state: 'detecting' | 'meet-ready' | 'idle') {
  if (state === 'idle') {
    await chrome.action.setBadgeText({ text: '' });
    return;
  }
  const config =
    state === 'detecting'
      ? { text: '!', color: '#f59e0b' }
      : { text: '✓', color: '#10b981' };
  await Promise.all([
    chrome.action.setBadgeText({ text: config.text }),
    chrome.action.setBadgeBackgroundColor({ color: config.color }),
  ]);
}

export default defineBackground(() => {
  sess.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' }).catch(() => {
    /* older Chrome may not support */
  });

  chrome.runtime.onInstalled.addListener(() => void injectAllGatherTabs());
  chrome.runtime.onStartup.addListener(() => void injectAllGatherTabs());

  chrome.runtime.onMessage.addListener((msg: IncomingMessage, _sender, sendResponse) => {
    if (!msg || typeof msg !== 'object') return false;

    if (msg.type === 'gather-event') {
      void handleGatherEvent(msg);
      return false;
    }
    if (msg.type === 'create-meet') {
      void createMeet().then(() => sendResponse({ ok: true }));
      return true;
    }
    if (msg.type === 'cancel-meet') {
      void cancelMeet().then(() => sendResponse({ ok: true }));
      return true;
    }
    if (msg.type === 'suppress') {
      void suppress(msg.minutes).then(() => sendResponse({ ok: true }));
      return true;
    }
    if (msg.type === 'dismiss') {
      void dismiss().then(() => sendResponse({ ok: true }));
      return true;
    }
    if (msg.type === 'test-fire') {
      if (!import.meta.env.DEV) return false;
      void testFire(msg.speakerName).then(() => sendResponse({ ok: true }));
      return true;
    }
    return false;
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== IDLE_ALARM) return;
    const { detection } = await getSession();
    const { meetUrl } = (await local.get('meetUrl')) as { meetUrl?: string };
    if (!detection || meetUrl) return;
    await dismiss();
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (!changeInfo.url) return;
    const { pendingMeetTabId } = await getSession();
    if (tabId !== pendingMeetTabId) return;
    const code = parseMeetCode(changeInfo.url);
    if (!code) return;
    await onMeetUrl(buildMeetUrl(code));
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'auto-join' });
    } catch {
      /* content script not ready yet */
    }
  });
});

async function handleGatherEvent(msg: GatherEventMessage) {
  if (msg.eventName !== 'playerActivelySpeaks') return;

  const { enabled: enabledRaw } = (await local.get('enabled')) as {
    enabled?: boolean;
  };
  const enabled = enabledRaw !== false;
  const state = await getSession();
  const now = Date.now();
  const action = decideDetectionAction({ state, now, enabled });

  if (action === 'ignore') return;
  if (action === 'continue') {
    await scheduleIdleDismiss();
    return;
  }

  const detection: Detection = {
    ts: now,
    speakerName:
      msg.speakerName ?? (chrome.i18n.getMessage('fallback_speaker') || 'someone'),
    speakerId: msg.speakerId,
  };

  await Promise.all([
    sess.set({ lastDetectAt: now, detection }),
    setBadge('detecting'),
    notifyGatherTabs({ type: 'toast-detecting', speakerName: detection.speakerName }),
    scheduleIdleDismiss(),
  ]);
}

async function scheduleIdleDismiss() {
  await chrome.alarms.create(IDLE_ALARM, {
    delayInMinutes: IDLE_DISMISS_MS / 60_000,
  });
}

async function createMeet() {
  await local.remove('meetUrl');
  const tab = await chrome.tabs.create({ url: 'https://meet.new', active: false });
  if (tab.id != null) {
    await sess.set({ pendingMeetTabId: tab.id });
  }
}

async function cancelMeet() {
  const { pendingMeetTabId } = await getSession();
  if (pendingMeetTabId != null) {
    try {
      await chrome.tabs.remove(pendingMeetTabId);
    } catch {
      /* tab already gone */
    }
  }
  await Promise.all([
    sess.remove(['pendingMeetTabId', 'detection']),
    local.remove('meetUrl'),
    setBadge('idle'),
    notifyGatherTabs({ type: 'toast-hide' }),
    chrome.alarms.clear(IDLE_ALARM),
  ]);
}

async function suppress(minutes: number) {
  const until = Date.now() + minutes * 60_000;
  await Promise.all([
    sess.set({ suppressUntil: until }),
    sess.remove('detection'),
    setBadge('idle'),
    notifyGatherTabs({ type: 'toast-hide' }),
    chrome.alarms.clear(IDLE_ALARM),
  ]);
}

async function dismiss() {
  await Promise.all([
    sess.remove('detection'),
    local.remove('meetUrl'),
    setBadge('idle'),
    notifyGatherTabs({ type: 'toast-hide' }),
    chrome.alarms.clear(IDLE_ALARM),
  ]);
}

async function onMeetUrl(url: string) {
  const { meetUrl: existing } = (await local.get('meetUrl')) as { meetUrl?: string };
  if (existing === url) return;

  await Promise.all([
    local.set({ meetUrl: url }),
    sess.set({ suppressUntil: Date.now() + POST_CREATE_SUPPRESS_MS }),
    sess.remove('pendingMeetTabId'),
    setBadge('meet-ready'),
    notifyGatherTabs({ type: 'toast-meet', url }),
    chrome.alarms.clear(IDLE_ALARM),
  ]);
}

async function testFire(speakerName?: string) {
  await sess.remove(['suppressUntil', 'lastDetectAt']);
  await handleGatherEvent({
    type: 'gather-event',
    eventName: 'playerActivelySpeaks',
    speakerId: 'test-speaker',
    speakerName: speakerName ?? 'テストくん',
    dist: 0,
    sameMap: true,
  });
}
