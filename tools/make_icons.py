"""Draw the home-screen icons (a smiling little melon on paper) into app/icons/.

Run once locally; the PNGs are committed, so the cloud build doesn't need Pillow.
Usage: python tools/make_icons.py   (needs Pillow)
"""
import pathlib
from PIL import Image, ImageDraw, ImageFilter

out = pathlib.Path(__file__).resolve().parent.parent / "app" / "icons"
out.mkdir(parents=True, exist_ok=True)

S = 1024
img = Image.new("RGB", (S, S), "#FAF7F0")
d = ImageDraw.Draw(img)

wash = Image.new("L", (S, S), 0)
ImageDraw.Draw(wash).ellipse((120, 140, 904, 924), fill=120)
img.paste(Image.new("RGB", (S, S), "#F3D58A"), mask=wash.filter(ImageFilter.GaussianBlur(40)))

d.ellipse((230, 640, 800, 760), fill="#E2D6BC")  # shadow
melon = (220, 250, 804, 730)
d.ellipse(melon, fill="#74A256")
mask = Image.new("L", (S, S), 0)
ImageDraw.Draw(mask).ellipse(melon, fill=255)
stripes = Image.new("RGBA", (S, S), (0, 0, 0, 0))
sd = ImageDraw.Draw(stripes)
for x, bend in ((330, -40), (440, -16), (584, 16), (694, 40)):
    sd.line([(x, 240), (x + bend, 380), (x + bend, 600), (x, 740)], fill=(46, 90, 50, 200), width=34, joint="curve")
img.paste(stripes, mask=Image.composite(stripes.split()[3], Image.new("L", (S, S), 0), mask))
d.ellipse((300, 320, 420, 380), fill="#A9C98A")  # highlight

ink = "#2A2622"
d.ellipse((410, 470, 446, 506), fill=ink)
d.ellipse((578, 470, 614, 506), fill=ink)
d.arc((462, 500, 562, 580), start=20, end=160, fill=ink, width=16)
d.ellipse((350, 530, 410, 570), fill="#E9A38D")
d.ellipse((614, 530, 674, 570), fill="#E9A38D")

for size in (180, 192, 512):
    img.resize((size, size), Image.LANCZOS).save(out / f"icon-{size}.png", optimize=True)
print("icons written to", out)
