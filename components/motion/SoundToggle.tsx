"use client";

import { useEffect, useState } from "react";
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react";
import { toggleSound, onSoundChange, isSoundEnabled } from "@/lib/sound";

/**
 * User-controlled sound switch. Sound stays OFF until this is pressed
 * (no autoplay). Fixed, unobtrusive, keyboard-accessible.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => onSoundChange(setOn), []);
  useEffect(() => setOn(isSoundEnabled()), []);

  return (
    <button
      type="button"
      onClick={toggleSound}
      data-cursor={on ? "Mute" : "Sound"}
      aria-pressed={on}
      aria-label={on ? "Mute sound" : "Enable sound"}
      className="fixed bottom-6 right-6 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface/80 text-ink shadow-lux-sm backdrop-blur transition-colors hover:border-accent hover:text-accent"
      style={{ boxShadow: "var(--shadow-lux-sm)" }}
    >
      {on ? (
        <SpeakerSimpleHigh size={18} weight="fill" />
      ) : (
        <SpeakerSimpleSlash size={18} />
      )}
    </button>
  );
}
