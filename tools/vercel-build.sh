#!/usr/bin/env bash
# Vercel build: check the stories, then build the site into dist/.
# A story that uses an unlearned character, or audio that no longer matches its text, stops the deploy.
set -euo pipefail

echo "Build tools on this machine:"
for t in python3.12 python3 python uv pip3; do printf '  %-10s %s\n' "$t" "$(command -v "$t" || echo '(none)')"; done

PY=""
for t in python3.12 python3 python; do
  if command -v "$t" >/dev/null 2>&1; then PY="$t"; break; fi
done

if [ -n "$PY" ] && "$PY" -m venv .venv >/dev/null 2>&1 && [ -x .venv/bin/pip ]; then
  echo "Using $PY with a virtual environment"
  .venv/bin/pip install --quiet -r tools/build-deps.txt
  RUN=".venv/bin/python"
elif command -v uv >/dev/null 2>&1; then
  echo "Using uv"
  uv venv --quiet --python 3.12 .venv
  uv pip install --quiet --python .venv/bin/python -r tools/build-deps.txt
  RUN=".venv/bin/python"
elif [ -n "$PY" ]; then
  echo "Using $PY with pip --user"
  "$PY" -m pip install --quiet --user -r tools/build-deps.txt
  RUN="$PY"
else
  echo "No Python or uv found on the build machine." >&2
  exit 1
fi

"$RUN" tools/check_vocab.py
"$RUN" tools/check_audio.py
"$RUN" tools/build.py
