import React, { useEffect, useState } from "react";
import { Library, Music2, RefreshCw, Check } from "lucide-react";
import "../styles/audio_library_panel.css";

export default function AudioLibraryPanel({ onSelect, selectedAudioUrl }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

  const fetchLibrary = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/audio-library");
      if (!res.ok) throw new Error("Failed to load audio library.");
      const data = await res.json();
      setItems(data);
      setStatus("ready");
    } catch (err) {
      console.error("Audio library fetch error:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  return (
    <div className="vx-border vx-hard-shadow vx-card rounded-md flex flex-col flex-1 min-h-[220px]">
      <div className="flex items-center justify-between gap-3 p-4 vx-audio-lib-header">
        <h2 className="vx-mono text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
          <Library size={14} />
          Audio Library
        </h2>
        <button
          type="button"
          onClick={fetchLibrary}
          className="vx-press vx-audio-lib-refresh"
          aria-label="Refresh audio library"
        >
          <RefreshCw
            size={14}
            className={status === "loading" ? "vx-spin" : ""}
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 overflow-y-auto vx-scrollbar">
        {status === "loading" && (
          <p className="text-xs vx-mono vx-text-soft uppercase tracking-wide">
            Loading...
          </p>
        )}

        {status === "error" && (
          <p className="text-xs vx-mono vx-text-soft">
            Couldn't load the audio library.
          </p>
        )}

        {status === "ready" && items.length === 0 && (
          <p className="text-xs vx-mono vx-text-soft">
            No generated audio yet — head to the Audio tab to create some.
          </p>
        )}

        {status === "ready" &&
          items.map((item) => {
            const selected = item.audio_url === selectedAudioUrl;
            return (
              <button
                type="button"
                key={item.audio_url}
                onClick={() => onSelect?.(item)}
                className={`vx-border vx-press vx-audio-lib-item flex items-center gap-3 px-3 py-3 rounded-md text-left ${
                  selected ? "vx-audio-lib-item--selected" : ""
                }`}
              >
                <Music2 size={16} className="shrink-0" />
                <span className="text-sm truncate flex-1">{item.name}</span>
                {selected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
      </div>
    </div>
  );
}
