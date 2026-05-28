# Privacy Policy — G2Meet

_Last updated: 2026-05-28_

## Summary

G2Meet is a Chrome extension that detects when **you** start speaking in a Gather space and suggests opening a Google Meet so you can record and transcribe the conversation.

**G2Meet does not collect, store, transmit, or share any personal data with the developer, any third-party server, or any analytics provider. All processing happens locally in your browser.**

## What the extension observes

The extension runs scripts on the pages listed in "Host permissions" below, on your own device.

- **Gather speech events.** The extension subscribes to Gather's in-page `playerActivelySpeaks` event, which the Gather client broadcasts for every player in the space. As the first step in the event handler, the extension discards every event whose speaker ID does not match your own player ID. Only the boolean fact that **you** started or stopped speaking is used; the data is not stored or transmitted.
- **Other players' events** (their speaking status, position, etc.) reach the handler the same way but are dropped immediately and never read, stored, or sent.
- **Meet tab URL.** When the extension opens `meet.new`, it watches `chrome.tabs.onUpdated` for that one tab only and parses the resulting `meet.google.com/<code>` URL to obtain the meeting code.
- **UI language.** Read via `chrome.i18n` to localize the UI.

The extension does not read audio, video, chat messages, transcripts, or any other content from Gather or Google Meet.

## What the extension stores

All storage is on your own device.

- `chrome.storage.session` (cleared when Chrome closes): detection state, the timestamp of the last detection, the suppression-until timestamp, and the pending Meet tab ID.
- `chrome.storage.local` (persists on your device): the most recently generated Meet URL, and your detection-enabled toggle.

Nothing is uploaded.

## What the extension does

- Shows an in-page toast on `app.gather.town` and a popup on the extension icon.
- When you confirm, opens `https://meet.new` in a new background tab.
- On that single tab (matched by Tab ID), clicks the "Join now" / "今すぐ参加" button so that you join the Meet the extension itself opened.
- Copies the resulting Meet URL to your clipboard when you press the "Copy URL" button. The copy is performed by your own click; the extension never copies without your explicit action.

The auto-join action only runs on Meet tabs that the extension opened. Meets opened by any other means are not affected.

## Permissions and why they are needed

- `tabs` — to read `chrome.tabs.onUpdated` for the single Meet tab the extension created, so the final `meet.google.com/<code>` URL can be captured.
- `storage` — to save the state listed under "What the extension stores", locally.
- `scripting` — to re-inject the content scripts into already-open Gather tabs when the extension is installed, updated, or reloaded.
- `alarms` — to auto-dismiss the detection toast after about 30 seconds of silence, using an alarm that survives the service worker going idle.

Host permissions:

- `https://app.gather.town/*` — to run the detection content script in the Gather app.
- `https://meet.google.com/*` — to auto-click the "Join now" / "今すぐ参加" button on the Meet tab the extension itself opened.
- `https://meet.new/*` — to use the shortcut URL that creates a new Meet on your behalf.

## Data sharing

None. The extension does not communicate with any server operated by the developer.

## Third parties

The extension interacts with Google Meet and Gather.town through their own web pages while you are using those services. Their respective privacy policies apply to your use of those services.

## Contact

For questions or concerns, please open an issue on the project repository.
