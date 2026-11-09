"""Build the reader from app/ into a finished page.

  python tools/build.py            -> dist/  (the website Vercel serves: page, data, audio, icons, offline support)
  python tools/build.py artifact   -> app/publish.html (single page for the private claude.ai version)

Both inline scenes.js and embed the Kai font (LXGW WenKai GB, SIL Open Font License, tools/fonts/OFL.txt),
cut down to only the characters in app/stories.json, so it stays a few kilobytes.
The font file is downloaded from its official release on first run and checked against a pinned hash.
Needs fontTools + brotli (pip install -r tools/requirements.txt).
"""
import base64, hashlib, io, json, pathlib, re, shutil, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP, DIST = ROOT / "app", ROOT / "dist"
FONT = ROOT / "tools" / "fonts" / "LXGWWenKaiGB-Regular.ttf"
FONT_URL = "https://github.com/lxgw/LxgwWenkaiGB/releases/download/v1.530/LXGWWenKaiGB-Regular.ttf"
FONT_SHA256 = "5561d48097d92e5ab99fe7b1459d381bbcdff533bfc479207b089c6860c3990e"
HAN = re.compile("[一-鿿]")


def ensure_font():
    if not FONT.exists():
        FONT.parent.mkdir(parents=True, exist_ok=True)
        print("downloading font", FONT_URL)
        with urllib.request.urlopen(FONT_URL) as r:
            FONT.write_bytes(r.read())
    digest = hashlib.sha256(FONT.read_bytes()).hexdigest()
    if digest != FONT_SHA256:
        FONT.unlink()
        sys.exit(f"font checksum mismatch ({digest}); deleted it, re-run to download again")


def font_face(data):
    from fontTools import subset
    from fontTools.ttLib import TTFont

    text = data["known"]["ihuman"] + data["known"]["extra"]
    for s in data["stories"]:
        text += s["title"] + "".join(p["text"] for p in s["pages"]) + "".join(s["game"])
    chars = sorted(set(HAN.findall(text)) | set("，。、：！？…“”（）"))
    ensure_font()
    font = TTFont(FONT)
    opts = subset.Options()
    opts.flavor, opts.layout_features, opts.name_IDs, opts.notdef_outline = "woff2", ["*"], ["*"], True
    sub = subset.Subsetter(opts)
    sub.populate(text="".join(chars))
    sub.subset(font)
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"font: {len(chars)} glyphs, {len(buf.getvalue()) // 1024} KB")
    return ("/* LXGW WenKai GB, (c) LXGW and The Klee Project Authors, SIL Open Font License 1.1; subset for this page. */\n"
            '@font-face { font-family: "WenKai Story"; src: url(data:font/woff2;base64,' + b64 + ') format("woff2"); font-display: block; }\n')


def page(data):
    html = (APP / "index.html").read_text(encoding="utf-8")
    tag = '<script src="scenes.js"></script>'
    assert tag in html, "scenes.js tag not found"
    html = html.replace(tag, "<script>\n" + (APP / "scenes.js").read_text(encoding="utf-8") + "\n</script>")
    html = html.replace("<style>\n", "<style>\n" + font_face(data), 1)
    # Kaiti stays first where the device has it (closest to mainland textbook 楷体); WenKai is the fallback, e.g. on iPads.
    html, n = re.subn(r'(--font-hanzi: [^;]*?), serif;', r'\1, "WenKai Story", serif;', html, count=1)
    assert n == 1, "font stack not updated"
    return html


SW = """/* Offline support: keeps every page, picture and sound on the device after the first visit. */
const CACHE = "reader-%s";
const FILES = %s;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(async hit => {
    if (!hit) return fetch(e.request);
    const range = e.request.headers.get("range");
    if (!range) return hit;
    /* Safari asks for sound files in byte ranges and needs a 206 answer to play them. */
    const buf = await hit.arrayBuffer(), m = /bytes=(\\d*)-(\\d*)/.exec(range) || [];
    const start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : buf.byteLength - 1;
    return new Response(buf.slice(start, end + 1), { status: 206, headers: {
      "Content-Type": hit.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
  }));
});
"""

MANIFEST = {
    "name": "识字小书", "short_name": "识字小书", "lang": "zh-CN",
    "start_url": "./", "scope": "./", "display": "standalone", "orientation": "landscape",
    "background_color": "#EFE8DA", "theme_color": "#EFE8DA",
    "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}],
}

HEAD = """<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="识字小书">
<meta name="theme-color" content="#EFE8DA">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<style>[hidden] { display: none !important; }</style>
"""


def build_web(data):
    html = page(data).replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    cut = html.index("</style>") + len("</style>")
    html = HEAD + html[:cut] + "\n</head>\n<body>\n" + html[cut:].lstrip() + \
        '\n<script>if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});</script>\n</body>\n</html>\n'
    html = html.replace('<section id="parent" class="view"', '<section id="parent" lang="en" class="view"', 1)
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    (DIST / "index.html").write_text(html, encoding="utf-8")
    shutil.copy(APP / "stories.json", DIST / "stories.json")
    shutil.copytree(APP / "audio", DIST / "audio")
    shutil.copytree(APP / "icons", DIST / "icons")
    (DIST / "manifest.webmanifest").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=1), encoding="utf-8")
    files = sorted(p.relative_to(DIST).as_posix() for p in DIST.rglob("*") if p.is_file())
    version = hashlib.sha256(b"".join((DIST / f).read_bytes() for f in files)).hexdigest()[:12]
    (DIST / "sw.js").write_text(SW % (version, json.dumps(["./"] + files, ensure_ascii=False)), encoding="utf-8")
    print(f"wrote dist/ ({len(files) + 1} files, version {version})")


def build_artifact(data):
    (APP / "publish.html").write_text(page(data), encoding="utf-8")
    print("wrote app/publish.html")


if __name__ == "__main__":
    data = json.loads((APP / "stories.json").read_text(encoding="utf-8"))
    build_artifact(data) if sys.argv[1:] == ["artifact"] else build_web(data)
