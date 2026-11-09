"""Check every story only uses characters he has learned, and report how often each is practised.

Usage: python3 tools/check_vocab.py [app/stories.json]
Exits with an error if any story uses an unknown character.
"""
import collections, json, re, sys

HAN = re.compile(r"[一-鿿]")


def main(path):
    data = json.load(open(path, encoding="utf-8"))
    k = data["known"]
    known = set(k["ihuman"]) | set(k["extra"])
    counts = collections.Counter()
    bad = []
    for s in data["stories"]:
        texts = [s["title"]] + [p["text"] for p in s["pages"]]
        for t in texts:
            for c in HAN.findall(t):
                counts[c] += 1
                if c not in known:
                    bad.append((s["id"], c, t))
        for g in s["game"]:
            if g not in known:
                bad.append((s["id"], g, "game word"))
    if bad:
        for sid, c, t in bad:
            print(f"UNKNOWN  {c}  in {sid}: {t}")
        sys.exit(1)
    print(f"OK: {len(data['stories'])} stories use only his {len(known)} known characters.")
    print("Weak words:", "  ".join(f"{c}×{counts[c]}" for c in k["weak"]))
    unused = [c for c in k["ihuman"] + k["extra"] if counts[c] == 0]
    print("Not used yet:", " ".join(unused) or "none")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "app/stories.json")
