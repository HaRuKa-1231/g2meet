# Chrome Web Store Listing — G2Meet

> **Disclaimer**: G2Meet is an independent open-source project. It is **not affiliated with, endorsed by, or sponsored by** Gather Presence Inc. or Google LLC. "Gather", "Google", and "Google Meet" are trademarks of their respective owners.

## Short description (132 chars max)

### English

> Detects when you start speaking in Gather and suggests opening a Google Meet to record and transcribe the conversation.

### 日本語

> Gather で話し始めたら、録画・文字起こし用の Google Meet 立ち上げを提案する Chrome 拡張。

## Detailed description

### English

G2Meet bridges proximity conversations in Gather.town to Google Meet for recording and transcription.

**How it works**

1. Sit down in your Gather space and turn your mic on.
2. When you start talking, G2Meet detects it after about 3 seconds.
3. A toast appears in the Gather tab suggesting a Meet.
4. Confirm, and the extension opens `meet.new`, auto-joins the Meet, and makes the URL available to copy with one click.
5. Paste the URL into your Gather chat so teammates can join and record with you.

**Privacy-first**

- 100% local processing. Nothing is uploaded.
- No analytics, no telemetry, no account required.
- Only reads your own player's speech events from Gather's in-page client.

**Recording & transcription**

- Use Google Meet's built-in recording and transcript features (requires Google Workspace).
- The extension only creates the meeting and shares the URL; it does not record or transcribe by itself.

**Auto-dismiss**

- If no speech is detected for 30 seconds, the toast quietly disappears.
- Mute the proposal for 5 / 10 minutes with one click.

### 日本語

G2Meet は、Gather.town で会話が始まったタイミングを検知し、録画・文字起こし用に Google Meet を立ち上げて URL を共有するための Chrome 拡張です。

**使い方**

1. Gather のスペースに入って、マイクを ON にします。
2. あなたが話し始めると、約 3 秒後に G2Meet が検知します。
3. Gather のタブ内にトーストが表示され、Meet 立ち上げが提案されます。
4. 確認すると `meet.new` が開き、自動で Meet に参加し、URL をワンクリックでコピーできるようになります。
5. URL を Gather のチャットに貼って、メンバーも参加・記録できます。

**プライバシー優先**

- 100% ローカル処理。外部にデータを送信しません。
- アナリティクスやテレメトリ、アカウント登録は不要です。
- 自分自身の発話イベントのみを Gather のクライアントから読み取ります。

**録画・文字起こし**

- Google Meet 標準の録画・文字起こし機能を使ってください（Google Workspace が必要）。
- 本拡張は会議の作成と URL 共有のみを担当します。

**自動消去**

- 30 秒間発話が無いと、トーストは自動的に消えます。
- 5 分 / 10 分の一時停止ボタンも用意しています。

---

## Category

Productivity

## Languages

- English
- Japanese

## Single Purpose

> The extension's single purpose is to detect when the user starts speaking in Gather.town and suggest opening a Google Meet to record and transcribe the conversation.

## Permission Justifications

| Permission  | Justification                                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tabs`      | To detect when the Meet tab that the extension created is redirected to its final `meet.google.com/<code>` URL, so we can capture the URL for sharing.                 |
| `storage`   | To save detection state, debounce/suppression timestamps, the latest generated Meet URL, and the user's enabled toggle. All stored locally; nothing leaves the device. |
| `scripting` | To re-inject the content scripts into already-open Gather tabs when the extension is installed, updated, or reloaded.                                                  |
| `alarms`    | To schedule an auto-dismiss of the detection toast after ~30 seconds of silence, in a way that survives the service worker going idle.                                 |

## Host Permission Justifications

| Host                        | Justification                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `https://app.gather.town/*` | To run the detection content script in the Gather app and read the user's own speech events.                                              |
| `https://meet.google.com/*` | To auto-click the "Join now" / "今すぐ参加" button on the Meet tab the extension itself opened, so the user joins without an extra click. |

## Data Disclosure

- **What is collected:** None.
- **What is shared:** None.
- **Sold:** No.

The extension does not collect, store, transmit, or share any personally identifiable information with any third party, including the developer. All processing happens on the user's device.

## Privacy Policy URL

See `docs/PRIVACY.md` in the repository. Replace with a hosted URL (e.g. GitHub Pages) before publishing.

## Screenshots needed (1280×800 PNG)

1. Toast on Gather: detection card with "Start Meet" button.
2. Toast on Gather: Meet ready card with copy button.
3. Popup with idle state and detection-enabled toggle.
4. (Optional) Side-by-side: speaker detected → Meet opened → URL pasted into Gather chat.
