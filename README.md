# G2Meet

A Chrome extension that detects when you start speaking in a [Gather](https://www.gather.town/) space and suggests opening a [Google Meet](https://meet.google.com/) so you can record and transcribe the conversation.

## Features

- Detects **your own** speech via Gather's in-page client (~3 seconds threshold)
- Suggests starting a Meet in an in-page toast
- Opens `meet.new`, auto-joins, and exposes the URL for copying
- Auto-dismisses if no further speech is detected for ~30 seconds
- Bilingual UI (Japanese / English) via `chrome.i18n`

## Privacy

All processing happens locally on your device. Nothing is sent to any server operated by the developer. See [`docs/PRIVACY.md`](./docs/PRIVACY.md).

## Development

Requires Node 24+ and pnpm. [`mise`](https://mise.jdx.dev/) is recommended for tool version management.

```sh
mise install
pnpm install
pnpm dev    # development build with HMR (loads .output/chrome-mv3-dev)
pnpm build  # production build (.output/chrome-mv3)
pnpm zip    # release zip (.output/g2meet-<version>-chrome.zip)
pnpm check  # tsc + lint + prettier + vitest
```

Load `.output/chrome-mv3-dev/` (dev) or `.output/chrome-mv3/` (release) as an unpacked extension at `chrome://extensions`.

## Disclaimer

G2Meet is an independent open-source project. It is **not affiliated with, endorsed by, or sponsored by** Gather Presence Inc. ("Gather") or Google LLC ("Google Meet"). "Gather", "Google", and "Google Meet" are trademarks of their respective owners.

## License

MIT — see [`LICENSE`](./LICENSE). Bundled third-party libraries are listed in [`public/THIRD_PARTY_NOTICES.txt`](./public/THIRD_PARTY_NOTICES.txt).
