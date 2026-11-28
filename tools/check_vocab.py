"""Check every story only uses characters he knows (or is deliberately learning), and report practice.

Word list in app/stories.json:
  known.ihuman    iHuman cards he has learned, in card order
  known.extra     characters he knows from elsewhere
  known.weak      known characters he is still unsure of (practised more)
  known.learning  new characters introduced on purpose (marked in the reader, practised most)

Usage: python3 tools/check_vocab.py [app/stories.json]
Exits with an error if any story uses a character outside those lists.
"""
import collections, json, re, sys

HAN = re.compile("[一-鿿]")


def main(path):
    data = json.load(open(path, encoding="utf-8"))
    k = data["known"]
    known = set(k["ihuman"]) | set(k["extra"])
    learning = set(k.get("learning", ""))
    allowed = known | learning
    counts = collections.Counter()
    bad = []
    for s in data["stories"]:
        texts = [s["title"]] + [p["text"] for p in s["pages"]]
        for t in texts:
            for c in HAN.findall(t):
                counts[c] += 1
                if c not in allowed:
                    bad.append((s["id"], c, t))
        for g in s["game"]:
            if g not in allowed:
                bad.append((s["id"], g, "game word"))
    if bad:
        for sid, c, t in bad:
            print(f"UNKNOWN  {c}  in {sid}: {t}")
        sys.exit(1)
    print(f"OK: {len(data['stories'])} stories use his {len(known)} known characters"
          + (f" plus {len(learning)} he is learning." if learning else "."))
    if learning:
        print("Learning:", "  ".join(f"{c}×{counts[c]}" for c in k["learning"]))
    if k["weak"]:
        print("Unsure:", "  ".join(f"{c}×{counts[c]}" for c in k["weak"]))
    print("Least practised:", "  ".join(f"{c}×{counts[c]}" for c in sorted(known, key=lambda c: counts[c])[:12]))
    unused = [c for c in k["ihuman"] + k["extra"] if counts[c] == 0]
    print("Not used yet:", " ".join(unused) or "none")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "app/stories.json")
