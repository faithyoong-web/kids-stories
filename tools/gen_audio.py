"""Generate read-aloud audio (with per-character timings) for every story page and title,
plus one clip per character. Skips files that already exist, so re-running only adds new ones.

Needs the edge-tts package (pip install edge-tts).
Usage: python tools/gen_audio.py app/stories.json app/audio
"""
import asyncio, json, os, re, sys
import edge_tts

VOICE = "zh-CN-XiaoxiaoNeural"
PAGE_RATE = "-25%"
CHAR_RATE = "-10%"
PRAISE = {"right1": "对了！", "right2": "真棒！", "right3": "你真厉害！", "again": "再试一次。", "done": "太棒了！你读完了！"}
HAN = re.compile(r"[一-鿿]")


async def synth(text, rate, path):
    comm = edge_tts.Communicate(text, VOICE, rate=rate, boundary="WordBoundary")
    words, audio = [], bytearray()
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            words.append((chunk["offset"] / 1e7, chunk["duration"] / 1e7, chunk["text"]))
    with open(path, "wb") as f:
        f.write(audio)
    return words


def char_timings(sentence, words):
    hans = HAN.findall(sentence)
    out, i = [], 0
    for start, dur, text in words:
        cs = HAN.findall(text)
        if not cs:
            continue
        step = dur / len(cs)
        for k, c in enumerate(cs):
            if i < len(hans) and hans[i] == c:
                out.append([round(start + k * step, 3), round(step, 3)])
                i += 1
    if len(out) != len(hans):
        raise SystemExit(f"timing mismatch for {sentence!r}: {len(out)}/{len(hans)} from {words}")
    return out


async def line(text, rel, out_dir, cache):
    """Returns timings for a title or page, re-recording it only when the file is missing or its text changed."""
    path = os.path.join(out_dir, rel)
    c = cache.get(rel)
    if isinstance(c, list):  # recorded before texts were tracked, when every clip matched its story
        c = {"text": text, "t": c}
    if c and c.get("text") == text and os.path.exists(path):
        cache[rel] = c
        return c["t"]
    t = char_timings(text, await synth(text, PAGE_RATE, path))
    cache[rel] = {"text": text, "t": t}
    print("  recorded", rel, text)
    return t


async def main(stories_path, out_dir):
    data = json.load(open(stories_path, encoding="utf-8"))
    os.makedirs(out_dir, exist_ok=True)
    man_path = os.path.join(out_dir, "manifest.json")
    old = json.load(open(man_path, encoding="utf-8")) if os.path.exists(man_path) else {}
    cache = old.get("_timings", {})
    manifest = {"voice": VOICE, "stories": {}, "chars": {}, "_timings": cache}
    chars = set()
    for s in data["stories"]:
        sid = s["id"]
        entry = {"title": {"src": f"{sid}/title.mp3", "text": s["title"]}, "pages": []}
        os.makedirs(os.path.join(out_dir, sid), exist_ok=True)
        entry["title"]["t"] = await line(s["title"], entry["title"]["src"], out_dir, cache)
        chars.update(HAN.findall(s["title"]))
        for n, p in enumerate(s["pages"], 1):
            rel = f"{sid}/p{n}.mp3"
            entry["pages"].append({"src": rel, "text": p["text"], "t": await line(p["text"], rel, out_dir, cache)})
            chars.update(HAN.findall(p["text"]))
        chars.update(s["game"])
        manifest["stories"][sid] = entry
        print(sid, "ok", len(entry["pages"]), "pages")
    os.makedirs(os.path.join(out_dir, "chars"), exist_ok=True)
    for c in sorted(chars):
        rel = f"chars/{ord(c):x}.mp3"
        if not os.path.exists(os.path.join(out_dir, rel)):
            await synth(c, CHAR_RATE, os.path.join(out_dir, rel))
        manifest["chars"][c] = rel
    print(len(chars), "character clips")
    # Spoken-only praise lines for the games (heard, never shown, so any characters are fine).
    manifest["praise"] = {}
    for key, text in PRAISE.items():
        rel = f"praise/{key}.mp3"
        os.makedirs(os.path.join(out_dir, "praise"), exist_ok=True)
        if not os.path.exists(os.path.join(out_dir, rel)):
            await synth(text, "-10%", os.path.join(out_dir, rel))
        manifest["praise"][key] = rel
    with open(man_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2]))
