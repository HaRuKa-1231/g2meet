export type Detection = {
  ts: number;
  speakerName: string;
  speakerId?: string;
};

export type GatherEventMessage = {
  type: 'gather-event';
  eventName: string;
  speakerId?: string;
  speakerName?: string;
  dist?: number;
  sameMap?: boolean;
};

export type PopupActionMessage =
  | { type: 'create-meet' }
  | { type: 'cancel-meet' }
  | { type: 'suppress'; minutes: number }
  | { type: 'dismiss' }
  | { type: 'test-fire'; speakerName?: string };

export type IncomingMessage = GatherEventMessage | PopupActionMessage;

export type ToastMessage =
  | { type: 'toast-detecting'; speakerName: string }
  | { type: 'toast-meet'; url: string }
  | { type: 'toast-hide' };
