import React, { useEffect, useState, useRef } from "react";
import { Library, Music2, RefreshCw, Volume2, Check } from "lucide-react";
import "../styles/audio_library_panel.css";

const DEFAULT_BARS = [8, 16, 10, 18, 12, 14, 6];

function Waveform({ isAnimating, className = "" }) {
  return (
    <div
      className={`flex items-end gap-[3px] h-5 ${className}`}
      aria-hidden="true"
    >
      {DEFAULT_BARS.map((h, i) => (
        <span
          key={i}
          className={`vx-wave-bar ${isAnimating ? "vx-bar-animating" : ""}`}
          style={{
            height: `${h}px`,
            animationDelay: isAnimating ? `${i * 0.08}s` : "0s",
          }}
        />
      ))}
    </div>
  );
}

export default function AudioLibraryPanel({ onSelect }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedAudio, setSelectedAudio] = useState(null); // Keeps track of persistent selection
  const [playingUrl, setPlayingUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

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

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleItemClick = (item) => {
    // 1. Keep track of persistent selection
    setSelectedAudio(item);
    if (onSelect) {
      onSelect(item);
    }

    const url = item.audio_url;

    // 2. Toggle pause/play if clicking the currently active playing track
    if (playingUrl === url && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Playback failed:", err));
      }
      return;
    }

    // 3. Stop existing audio and play the new track
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const newAudio = new Audio(url);
    audioRef.current = newAudio;
    setPlayingUrl(url);

    newAudio.onended = () => {
      setIsPlaying(false);
      setPlayingUrl(null);
    };

    newAudio.onpause = () => setIsPlaying(false);
    newAudio.onplay = () => setIsPlaying(true);

    newAudio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("Playback error:", err);
        setIsPlaying(false);
        setPlayingUrl(null);
      });
  };

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
          items.map((item) => {
            const isSelected = selectedAudio?.audio_url === item.audio_url;
            const isPlayingThis = playingUrl === item.audio_url && isPlaying;

            return (
              <button
                type="button"
                key={item.audio_url}
                onClick={() => handleItemClick(item)}
                className={`vx-border vx-press vx-audio-lib-item flex items-center justify-between gap-3 px-3 py-3 rounded-md shrink-0 text-left transition-colors ${
                  isSelected ? "vx-dropzone--active" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isPlayingThis ? (
                    <Volume2
                      size={16}
                      className="text-[var(--primary)] shrink-0"
                    />
                  ) : isSelected ? (
                    <Check
                      size={16}
                      className="text-[var(--primary)] shrink-0"
                    />
                  ) : (
                    <Music2 size={16} className="vx-text-soft shrink-0" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      isSelected ? "font-semibold text-[var(--ink)]" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                {/* Render moving waveform animation if currently playing */}
                {playingUrl === item.audio_url && (
                  <Waveform
                    isAnimating={isPlayingThis}
                    className="text-[var(--primary)] shrink-0"
                  />
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
