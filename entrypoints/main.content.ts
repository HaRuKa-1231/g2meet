import { SPEAK_THRESHOLD_MS } from '@/utils/constants';
import { nextSpeakAction, type SpeakState } from '@/utils/speak';

type PlayerLike = {
  id?: string;
  userUuid?: string;
  name?: string;
};

type GameLike = {
  engine?: { clientUid?: string };
  connection?: { clientUid?: string };
  clientUid?: string;
  players?: Record<string, PlayerLike>;
  subscribeToEvent: (
    name: string,
    cb: (data: GatherEventPayload, context: GatherEventContext) => void
  ) => void;
};

type GatherEventPayload = {
  playerActivelySpeaks?: { activelySpeaking?: number | boolean };
};

type GatherEventContext = {
  player?: PlayerLike;
};

type Handler = (data: GatherEventPayload, context: GatherEventContext) => void;

type WindowExt = Window & {
  game?: GameLike;
  __suggest_transcript_subscribed?: string[];
  __suggest_transcript_handler?: Handler;
  __suggest_transcript_speak?: SpeakState;
  __suggest_transcript_test_fire?: (name?: string) => void;
};

const TARGET_EVENT = 'playerActivelySpeaks';
const NONCE_ATTR = 'data-suggest-transcript-nonce';

export default defineContentScript({
  matches: ['https://app.gather.town/*'],
  world: 'MAIN',
  runAt: 'document_idle',
  main() {
    const w = window as WindowExt;
    w.__suggest_transcript_subscribed ??= [];
    if (!w.__suggest_transcript_speak) {
      w.__suggest_transcript_speak = { startedAt: null, timerId: null };
    }

    const getNonce = () => document.documentElement.getAttribute(NONCE_ATTR) ?? '';

    if (import.meta.env.DEV) {
      w.__suggest_transcript_test_fire = (name: string = 'テストくん') => {
        window.postMessage(
          {
            type: 'suggest-transcript/test-fire',
            speakerName: name,
            nonce: getNonce(),
          },
          '*'
        );
      };
    }

    w.__suggest_transcript_handler = (data, context) => {
      const game = w.game;
      if (!game) return;
      const myId = game.engine?.clientUid ?? game.connection?.clientUid ?? game.clientUid;
      if (!myId) return;
      const speaker = context?.player;
      const speakerId = speaker?.id ?? speaker?.userUuid;
      if (speakerId !== myId) return;

      const inner = data?.playerActivelySpeaks;
      const isActive = inner?.activelySpeaking === 1 || inner?.activelySpeaking === true;

      const state = w.__suggest_transcript_speak!;
      const action = nextSpeakAction(state, isActive);

      if (action === 'start') {
        state.startedAt = Date.now();
        state.timerId = window.setTimeout(() => {
          if (state.startedAt === null) return;
          window.postMessage(
            {
              type: 'suggest-transcript/gather-event',
              eventName: TARGET_EVENT,
              speakerId: myId,
              speakerName: game.players?.[myId]?.name,
              dist: 0,
              sameMap: true,
              nonce: getNonce(),
            },
            '*'
          );
          state.startedAt = null;
          state.timerId = null;
        }, SPEAK_THRESHOLD_MS);
      } else if (action === 'cancel') {
        if (state.timerId !== null) window.clearTimeout(state.timerId);
        state.startedAt = null;
        state.timerId = null;
      }
    };

    const start = Date.now();
    const interval = setInterval(() => {
      const game = w.game;
      if (!game) {
        if (Date.now() - start > 60_000) clearInterval(interval);
        return;
      }
      clearInterval(interval);

      if (w.__suggest_transcript_subscribed!.includes(TARGET_EVENT)) return;

      try {
        game.subscribeToEvent(TARGET_EVENT, (data, context) => {
          w.__suggest_transcript_handler?.(data, context);
        });
        w.__suggest_transcript_subscribed!.push(TARGET_EVENT);
      } catch (e) {
        console.error('[suggest-transcript] subscribe failed', TARGET_EVENT, e);
      }
    }, 500);
  },
});
