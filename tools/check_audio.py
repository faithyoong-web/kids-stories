"""Check the recorded audio matches the stories: every title and page has a clip recorded from its
current text, with one timing per character, and every character has its own clip.

Usage: python tools/check_audio.py
Exits with an error if anything is missing or out of date (fix it with tools/gen_audio.py).
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app"
HAN = re.compile("[一-鿿]")

data = json.loads((APP / "stories.json").read_text(encoding="utf-8"))
man = json.loads((APP / "audio" / "manifest.json").read_text(encoding="utf-8"))
problems = []


def check_line(label, text, entry):
    if not entry:
        problems.append(f"{label}: no audio")
        return
    if entry.get("text") != text:
        problems.append(f"{label}: audio was recorded from {entry.get('text')!r}, story now says {text!r}")
    if len(entry.get("t", [])) != len(HAN.findall(text)):
        problems.append(f"{label}: {len(entry.get('t', []))} timings for {len(HAN.findall(text))} characters")
    if not (APP / "audio" / entry.get("src", "")).is_file():
        problems.append(f"{label}: missing file {entry.get('src')}")


chars = set()
for s in data["stories"]:
    e = man["stories"].get(s["id"], {})
    check_line(f"{s['id']} title", s["title"], e.get("title"))
    pages = e.get("pages", [])
    for i, p in enumerate(s["pages"]):
        check_line(f"{s['id']} page {i + 1}", p["text"], pages[i] if i < len(pages) else None)
    chars |= set(HAN.findall(s["title"] + "".join(p["text"] for p in s["pages"]))) | set(s["game"])
for c in sorted(chars):
    rel = man["chars"].get(c)
    if not rel or not (APP / "audio" / rel).is_file():
        problems.append(f"character {c}: no clip")
for k, rel in man.get("praise", {}).items():
    if not (APP / "audio" / rel).is_file():
        problems.append(f"praise {k}: missing file {rel}")

if problems:
    print("\n".join(problems))
    sys.exit(1)
print(f"OK: audio matches all {len(data['stories'])} stories and {len(chars)} characters.")
