# 识字小书

Painted Chinese picture books for a young reader, written only with the characters he has learned
(iHuman / 洪恩识字 cards 1–30, plus 爸 妈 的 我 飞 瓜). He can tap any character to hear it, play the
whole page with the words lighting up as they're read, and finish each story with a short word game.

## How it's published

- Every push to `main` deploys the live site on Vercel. Every pull request gets its own preview link.
- Before anything deploys, GitHub Actions (`.github/workflows/check.yml`) and the Vercel build
  (`tools/vercel-build.sh`) run the same checks, so a broken story never goes live:
  - `tools/check_vocab.py`: every story uses only learned characters.
  - `tools/check_audio.py`: every title and page has audio recorded from its current text, with one
    timing per character, and every character has its own clip.
  - `tools/build.py`: the site builds.
- On an iPad, open the site in Safari and use Share → Add to Home Screen. It then opens full screen
  and keeps working offline once it has been opened.

## Project layout

| Path | What it is |
| --- | --- |
| `app/stories.json` | The stories, his known characters and the words each game practises |
| `app/scenes.js` | The painted illustrations, one function per page |
| `app/index.html` | The reader, games and grown-ups page |
| `app/audio/` | Recorded audio (晓晓 voice) and `manifest.json` with per-character timings |
| `app/icons/` | Home-screen icons (`tools/make_icons.py`) |
| `tools/` | Checks, build, audio generation and a local server |

## Adding a story

1. Add it to `app/stories.json`. When he learns more cards, add them to `known.ihuman` first.
2. Paint its pages in `app/scenes.js` (scene ids like `melon-3`).
3. Record the audio on a Mac (it isn't recorded in the cloud):

   ```bash
   python3 -m venv .venv && .venv/bin/pip install -r tools/requirements-dev.txt
   .venv/bin/python tools/gen_audio.py app/stories.json app/audio
   ```

   Only new or changed lines are recorded.
4. Check, preview and push:

   ```bash
   .venv/bin/python tools/check_vocab.py && .venv/bin/python tools/check_audio.py
   .venv/bin/python tools/build.py && python3 tools/serve.py 8765 dist
   ```

   Open <http://localhost:8765>. `app/sheet.html` (served with `python3 tools/serve.py`) shows every
   scene on one sheet.

## Credits

- Font: [LXGW WenKai GB](https://github.com/lxgw/LxgwWenkaiGB), SIL Open Font License 1.1, downloaded at
  build time and cut down to the characters in use. Devices with Kaiti use Kaiti instead.
- Voice: Microsoft 晓晓 (zh-CN-XiaoxiaoNeural), generated with
  [edge-tts](https://github.com/rany2/edge-tts) for personal use.
