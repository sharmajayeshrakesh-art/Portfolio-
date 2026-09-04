#!/usr/bin/env python3
"""
Generate NeuroPlay's voicebank: one audio clip per fixed phrase, per language.

WHY: the Web Speech API can only sound as good as the TTS engine installed on
the phone. On a budget Android that is often an old formant engine, and there
is nothing the app can do about it — the voice is a lottery the patient loses.
So we render every fixed phrase ONCE, bundle the audio, and play recordings
instead. Same voice on every device, offline, and far more human.

USAGE
    python3 scripts/build-voicebank.py                 # all languages
    python3 scripts/build-voicebank.py --lang hi       # just one
    python3 scripts/build-voicebank.py --engine edge   # better voices, see below
    python3 scripts/build-voicebank.py --ids           # print phrases to record

Install ffmpeg (`pip install imageio-ffmpeg` is enough) and each clip is also
trimmed of dead air, levelled, and shrunk to about half the size.

ENGINES
    gtx   (default) Google's translate speech endpoint. Plain HTTPS, no key,
          no install. Covers en / hi / ne. This is what the committed clips
          were made with.
    edge  Microsoft Edge's neural voices — noticeably warmer and better
          phrased than gtx, and the best free option. Needs `pip install
          edge-tts` and a network that allows WebSockets, so run it on your
          own machine, not in a sandbox. Same command otherwise; it overwrites
          the gtx clips with better ones.

A REAL HUMAN is better than either, and for dementia care a familiar voice is
therapeutic rather than merely pleasant. `--ids` prints the filename and the
exact words for every phrase; record them, drop <id>.mp3 into
public/neuroplay/audio/<lang>/, and rerun with --refresh-manifest.

AFTER GENERATING
    bump CACHE in public/neuroplay/sw.js  (so installed apps fetch the clips)
    node scripts/build-neuroplay-single.mjs   (folds them into the offline file)
"""

import argparse, json, re, shutil, subprocess, sys, tempfile, time
import urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "public" / "neuroplay" / "i18n"
OUT = ROOT / "public" / "neuroplay" / "audio"

# Languages we can currently voice, and the voice each engine uses.
#   as (Assamese) has no voice in either engine. Rather than read Assamese in
#   a Bengali voice — close, but wrong in exactly the way a native speaker
#   hears immediately — it stays on device synthesis until someone records it.
LANGS = {
    "en": {"gtx": "en", "edge": "en-IN-NeerjaNeural"},
    "hi": {"gtx": "hi", "edge": "hi-IN-SwaraNeural"},
    "ne": {"gtx": "ne", "edge": "ne-NP-HemkalaNeural"},
}

UA = "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"


def norm(text: str) -> str:
    """Collapse whitespace and drop trailing sentence punctuation, so a phrase
    matches whether it is spoken alone or joined into a sentence by the app.
    Must stay identical to norm() in src/voicebank.js."""
    return re.sub(r"[.!?।\s]+$", "", re.sub(r"\s+", " ", text).strip())


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
    return [p for p in re.split(r"(?<=[.!?।])\s+|\s+·\s+|\n+", text) if p.strip()]


def phrases_for(lang: str):
    """Every fixed string worth recording, split the way the app speaks it.
    Returns {clip_id: (hashed_text, text_to_speak)} — the two differ because we
    hash without trailing punctuation but SPEAK with it: a full stop is what
    tells the engine to let the pitch fall, and a phrase that does not fall at
    the end is most of what makes synthesis sound robotic.
    A segment holding a {placeholder} (a date, a count) is skipped — those vary,
    so they stay on device synthesis; its neighbours are still recorded."""
    data = json.loads((I18N / f"{lang}.json").read_text(encoding="utf-8"))
    out = {}
    for val in data.values():
        if not isinstance(val, str):
            continue                      # calendar name arrays
        for seg in split_phrases(val):
            if "{" in seg:
                continue                  # dynamic
            key = norm(seg)
            if len(key) < 2:
                continue
            spoken = re.sub(r"\s+", " ", seg).strip()
            if not re.search(r"[.!?।]$", spoken):
                spoken += "।" if lang != "en" else "."
            out[clip_id(key)] = (key, spoken)
    return out


# ---- engines -------------------------------------------------------------

def synth_gtx(voice: str, text: str, path: Path):
    """Google's translate speech endpoint: plain HTTPS, returns an mp3.
    ttsspeed slightly under 1 reads unhurried without dragging — elders need
    the pace, and it also smooths the joins between phrases."""
    url = "https://translate.googleapis.com/translate_tts?" + urllib.parse.urlencode(
        {"ie": "UTF-8", "client": "tw-ob", "tl": voice, "ttsspeed": "0.9", "q": text}
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://translate.google.com/"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    if not data.startswith(b"\xff") and b"ID3" not in data[:12]:
        raise RuntimeError("not an mp3 (blocked or rate limited)")
    path.write_bytes(data)


def synth_edge(voice: str, text: str, path: Path):
    import asyncio, edge_tts
    asyncio.run(edge_tts.Communicate(text, voice, rate="-8%").save(str(path)))


ENGINES = {"gtx": synth_gtx, "edge": synth_edge}


# ---- polish --------------------------------------------------------------

def ffmpeg_exe():
    """ffmpeg if it is anywhere to hand — on PATH, or the static build that
    ships inside the imageio-ffmpeg wheel. Optional: without it the clips are
    simply used as the engine returned them."""
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:                                              # noqa: BLE001
        return None


# Trim the dead air the engines pad each clip with (a prompt that starts
# instantly feels like a person answering, not a machine loading), even out the
# loudness so no phrase is quieter than the one before it, and re-encode to a
# speech-sized mp3 — the whole voicebank has to fit on a cheap phone.
FILTERS = (
    "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-50dB,"
    "areverse,"
    "silenceremove=start_periods=1:start_silence=0.10:start_threshold=-50dB,"
    "areverse,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)


def polish(path: Path, ff: str) -> bool:
    tmp = Path(tempfile.mkstemp(suffix=".mp3")[1])
    try:
        subprocess.run(
            [ff, "-v", "error", "-y", "-i", str(path), "-af", FILTERS,
             "-ar", "22050", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "32k", str(tmp)],
            check=True, capture_output=True,
        )
        if tmp.stat().st_size > 512:
            shutil.move(str(tmp), str(path))
            return True
    except Exception:                                              # noqa: BLE001
        pass
    finally:
        tmp.unlink(missing_ok=True)
    return False


# ---- build ---------------------------------------------------------------

def write_manifest(lang: str, engine: str, voice: str):
    folder = OUT / lang
    ids = sorted(p.stem for p in folder.glob("*.mp3") if p.stat().st_size > 0)
    (folder / "manifest.json").write_text(
        json.dumps({"lang": lang, "engine": engine, "voice": voice, "ext": "mp3", "ids": ids}, indent=2),
        encoding="utf-8",
    )
    return ids


def build(lang: str, engine: str, force: bool, ff=None):
    voice = LANGS[lang][engine]
    synth = ENGINES[engine]
    items = phrases_for(lang)
    folder = OUT / lang
    folder.mkdir(parents=True, exist_ok=True)
    made = skipped = failed = 0
    for i, (cid, (key, spoken)) in enumerate(sorted(items.items()), 1):
        target = folder / f"{cid}.mp3"
        if target.exists() and target.stat().st_size > 0 and not force:
            skipped += 1
            continue
        for attempt in range(4):
            try:
                synth(voice, spoken, target)
                if ff:
                    polish(target, ff)
                made += 1
                break
            except Exception as e:                                  # noqa: BLE001
                if attempt == 3:
                    failed += 1
                    print(f"  !! {lang}/{cid} {key[:40]!r}: {e}", file=sys.stderr)
                    target.unlink(missing_ok=True)
                else:
                    time.sleep(2 ** attempt)                        # back off and retry
        if made and made % 25 == 0:
            print(f"  {lang}: {i}/{len(items)} …")
        time.sleep(0.12)                                            # be a polite client
    ids = write_manifest(lang, engine, voice)
    print(f"{lang}: {len(ids)} clips ({made} new, {skipped} kept, {failed} failed) — {voice}")


def write_index():
    """One small index of which languages have recordings, so a build without a
    voicebank never fires a request per language."""
    langs = sorted(
        p.parent.name for p in OUT.glob("*/manifest.json")
        if json.loads(p.read_text(encoding="utf-8")).get("ids")
    )
    (OUT / "index.json").write_text(
        json.dumps({"_readme": "Languages that have a recorded voicebank. "
                               "Generated by scripts/build-voicebank.py.",
                    "langs": langs}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"index.json: {langs or 'none — every language uses device speech'}")


def print_ids(only=None):
    for lang in sorted(p.stem for p in I18N.glob("*.json")):
        if only and lang != only:
            continue
        print(f"\n=== {lang} ===")
        for cid, (key, _spoken) in sorted(phrases_for(lang).items()):
            print(f"{cid}.mp3\t{key}")


def main():
    ap = argparse.ArgumentParser(description="Build NeuroPlay's voicebank.")
    ap.add_argument("--engine", choices=sorted(ENGINES), default="gtx")
    ap.add_argument("--lang", action="append", help="limit to a language (repeatable)")
    ap.add_argument("--force", action="store_true", help="re-render clips that already exist")
    ap.add_argument("--ids", action="store_true", help="print phrases for a human to record")
    ap.add_argument("--refresh-manifest", action="store_true",
                    help="rebuild manifests from the mp3s on disk (after hand-recording)")
    ap.add_argument("--polish", action="store_true",
                    help="only re-trim and re-encode the clips already on disk")
    ap.add_argument("--raw", action="store_true",
                    help="skip the trim/normalise/shrink pass even if ffmpeg is present")
    a = ap.parse_args()

    if a.ids:
        print_ids(a.lang[0] if a.lang else None)
        return

    OUT.mkdir(parents=True, exist_ok=True)
    langs = a.lang or list(LANGS)
    ff = None if a.raw else ffmpeg_exe()
    if not ff and not a.raw:
        print("ffmpeg not found — clips will be larger and start with a pause.\n"
              "  pip install imageio-ffmpeg   (ships a static build)", file=sys.stderr)

    if a.polish:
        if not ff:
            sys.exit("--polish needs ffmpeg")
        for l in langs:
            clips = sorted((OUT / l).glob("*.mp3"))
            before = sum(c.stat().st_size for c in clips)
            done = sum(polish(c, ff) for c in clips)
            after = sum(c.stat().st_size for c in clips)
            print(f"{l}: polished {done}/{len(clips)} — "
                  f"{before/1024:.0f} KB to {after/1024:.0f} KB")
        return

    if a.refresh_manifest:
        for l in langs:
            if (OUT / l).is_dir():
                print(f"{l}: {len(write_manifest(l, 'hand', 'recorded'))} clips")
        write_index()
        return

    for l in langs:
        if l not in LANGS:
            print(f"{l}: no voice in either engine — staying on device speech", file=sys.stderr)
            continue
        if not (I18N / f"{l}.json").exists():
            continue
        print(f"\nBuilding {l} with {a.engine} …")
        build(l, a.engine, a.force, ff)
    write_index()
    print("\nDone. Bump CACHE in public/neuroplay/sw.js, then rerun "
          "node scripts/build-neuroplay-single.mjs")


if __name__ == "__main__":
    main()
