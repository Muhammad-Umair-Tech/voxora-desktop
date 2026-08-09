import React, { useEffect, useState } from "react";
import { Library, Music2, RefreshCw } from "lucide-react";
import "../styles/audio_library_panel.css";

export default function AudioLibraryPanel() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

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
    <div className="vx-border vx-hard-shadow vx-card rounded-md flex flex-col h-[380px] max-h-[380px] w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center justify-between gap-3 p-4 vx-audio-lib-header shrink-0">
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

      {/* Scrollable Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 vx-scrollbar">
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
          items.map((item) => (
            <div
              key={item.audio_url}
              className="vx-border vx-audio-lib-item flex items-center gap-3 px-3 py-3 rounded-md shrink-0"
            >
              <Music2 size={16} className="vx-text-soft shrink-0" />
              <span className="text-sm truncate">{item.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
