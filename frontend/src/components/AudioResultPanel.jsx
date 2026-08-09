import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import "../styles/audio_result_panel.css";

function formatTime(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, totalSeconds)
    : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

export default function AudioResultPanel({ src, currentTheme, onSave }) {
  const waveContainerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveContainerRef.current || !src) return;

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Pull the current theme's colors from CSS variables so the waveform
    // matches light/dark mode instead of using hardcoded colors.
    const styles = getComputedStyle(waveContainerRef.current);
    const waveColor = styles.getPropertyValue("--ink-soft").trim() || "#5c5c5c";
    const progressColor =
      styles.getPropertyValue("--primary").trim() || "#2fa24a";
    const cursorColor = styles.getPropertyValue("--ink").trim() || "#121212";

    const ws = WaveSurfer.create({
      container: waveContainerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth: 2,
      height: 56,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      url: src,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => setCurrentTime(time));
    ws.on("seeking", (time) => setCurrentTime(time));

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
    // Recreate the instance if the audio source or the theme changes.
  }, [src, currentTheme]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="vx-waveform-container vx-border rounded-md px-4 py-4">
        <div ref={waveContainerRef} />
      </div>
      <div className="flex items-center justify-between vx-mono text-xs font-semibold vx-text-soft">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!isReady}
          className={`vx-border vx-hard-shadow-sm vx-press vx-play-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide ${
            !isReady ? "vx-btn-disabled" : ""
          }`}
        >
          {isPlaying ? (
            <Pause size={15} fill="currentColor" />
          ) : (
            <Play size={15} fill="currentColor" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={onSave}
          className="vx-border vx-hard-shadow-sm vx-press vx-save-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
        >
          <Download size={15} />
          Save
        </button>
      </div>
    </div>
  );
}
