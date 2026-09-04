#!/usr/bin/env python3
"""
Generate NeuroPlay's voicebank: one audio clip per fixed phrase, per language.

WHY: the Web Speech API can only sound as good as the phone's TTS engine, and
on a budget Android that is an old robotic one. This renders every fixed
phrase ONCE with a proper neural voice and bundles the audio, so the app plays
a human-sounding recording offline on any device.

USAGE (run on your own machine — needs internet, ~2 minutes):

    pip install edge-tts
    python3 scripts/build-voicebank.py

Then commit the generated public/neuroplay/audio/ folder and redeploy. Bump
CACHE in public/neuroplay/sw.js so existing installs pick the clips up, and
re-run `node scripts/build-neuroplay-single.mjs` to fold them into the
single-file offline build.

Microsoft's Edge neural voices are free and genuinely human-sounding.
To use a DIFFERENT voice, list them with:  edge-tts --list-voices
and change the VOICES map below.

To use a REAL HUMAN recording instead — which, for dementia care, is arguably
better than any synthetic voice — drop an mp3 named <id>.mp3 into
public/neuroplay/audio/<lang>/, add the id to that folder's manifest.json, and
list the language in audio/index.json. Run this script with --ids to print the
id and the exact words for every phrase, ready to hand to whoever is reading.
"""

import asyncio, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "public" / "neuroplay" / "i18n"
OUT = ROOT / "public" / "neuroplay" / "audio"

# Warm, natural Indian voices. Edge TTS has no Assamese voice at the time of
# writing, so Assamese keeps using device synthesis until one exists (or you
# record a person — see the note above).
VOICES = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-SwaraNeural",
    "ne": "ne-NP-HemkalaNeural",
    # "as": None,
}

def norm(text: str) -> str:
    """Collapse whitespace and drop trailing sentence punctuation, so a phrase
    matches whether it is spoken alone or joined into a sentence by the app.
    Must stay identical to norm() in src/voicebank.js."""
    return re.sub(r"[.!?\u0964\s]+$", "", re.sub(r"\s+", " ", text).strip())

def clip_id(text: str) -> str:
    """FNV-1a over UTF-8 — must match clipId() in src/voicebank.js."""
    h = 0x811C9DC5
    for b in norm(text).encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")

def split_phrases(text: str):
    """Same sentence split the app uses before speaking, so a recording exists
    for every segment it will actually ask for. Must stay in step with
    phrases() in src/tts.js."""
    return [p for p in re.split(r"(?<=[.!?\u0964])\s+|\s+\u00b7\s+|\n+", text) if p.strip()]

def phrases_for(lang: str):
    """Every fixed string worth recording, split the way the app speaks it.
    A segment holding a {placeholder} (a date, a count) is skipped — those
    vary, so they stay on device synthesis; its neighbours are still recorded."""
    data = json.loads((I18N / f"{lang}.json").read_text(encoding="utf-8"))
    out = {}
    for val in data.values():
        if not isinstance(val, str):
            continue          # calendar name arrays
        for seg in split_phrases(val):
            if "{" in seg:
                continue      # dynamic
            v = norm(seg)
            if len(v) < 2:
                continue
            out[clip_id(v)] = v
    return out

async def synth(voice: str, text: str, path: Path):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate="-8%").save(str(path))

async def build(lang: str, voice: str):
    items = phrases_for(lang)
    folder = OUT / lang
    folder.mkdir(parents=True, exist_ok=True)
    made, skipped = 0, 0
    for cid, text in items.items():
        target = folder / f"{cid}.mp3"
        if target.exists() and target.stat().st_size > 0:
            skipped += 1
            continue
        try:
            await synth(voice, text, target)
            made += 1
            print(f"  {lang}/{cid}  {text[:48]}")
        except Exception as e:                       # noqa: BLE001
            print(f"  !! {lang}/{cid} failed: {e}", file=sys.stderr)
            if target.exists():
                target.unlink()
    ids = sorted(p.stem for p in folder.glob("*.mp3") if p.stat().st_size > 0)
    (folder / "manifest.json").write_text(
        json.dumps({"lang": lang, "voice": voice, "ext": "mp3", "ids": ids}, indent=2),
        encoding="utf-8",
    )
    print(f"{lang}: {len(ids)} clips ({made} new, {skipped} already there)")
    return len(ids)

def write_index():
    """One small index of which languages have recordings, so a build without
    a voicebank never fires a request per language."""
    langs = sorted(
        p.parent.name for p in OUT.glob("*/manifest.json")
        if json.loads(p.read_text(encoding="utf-8")).get("ids")
    )
    (OUT / "index.json").write_text(
        json.dumps({"_readme": "Languages that have a recorded voicebank. "
                               "Generated by scripts/build-voicebank.py.",
                    "langs": langs}, indent=2),
        encoding="utf-8",
    )
    print(f"index.json: {langs}")

def print_ids():
    for lang in sorted(p.stem for p in I18N.glob("*.json")):
        print(f"\n=== {lang} ===")
        for cid, text in phrases_for(lang).items():
            print(f"{cid}.mp3\t{text}")

async def main():
    if "--ids" in sys.argv:
        print_ids(); return
    OUT.mkdir(parents=True, exist_ok=True)
    for lang, voice in VOICES.items():
        if not (I18N / f"{lang}.json").exists():
            continue
        print(f"\nBuilding {lang} with {voice} …")
        await build(lang, voice)
    write_index()
    print("\nDone. Commit public/neuroplay/audio/ and redeploy.")

if __name__ == "__main__":
    asyncio.run(main())
