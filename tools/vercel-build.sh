#!/usr/bin/env bash
# Vercel build: check the stories, then build the site into dist/.
# A story that uses an unlearned character, or audio that no longer matches its text, stops the deploy.
set -euo pipefail
python3 -m venv .venv
.venv/bin/pip install --quiet -r tools/requirements.txt
.venv/bin/python tools/check_vocab.py
.venv/bin/python tools/check_audio.py
.venv/bin/python tools/build.py
