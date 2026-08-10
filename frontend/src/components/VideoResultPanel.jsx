import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Download, Sparkles } from "lucide-react";
import "../styles/video_result_panel.css";

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

export default function VideoResultPanel({ videoUrl, fileName }) {
  const panelRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Automatically scroll the panel into view when it mounts
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center", // "center" ensures the whole panel is visible
      });
    }
  }, []);

  if (!videoUrl) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => console.error("Video playback error:", err));
    } else {
      video.pause();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = fileName
      ? `${fileName.replace(/\.[^/.]+$/, "")}-voxora.mp4`
      : "voxora-video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={panelRef}
      className="vx-border vx-hard-shadow vx-card rounded-md flex flex-col gap-4 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="vx-mono text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
          <Sparkles size={14} />
          Result
        </h2>
      </div>

      <div className="vx-result-video-frame vx-border rounded-md overflow-hidden relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onLoadedMetadata={(e) => {
            setIsReady(true);
            setDuration(e.target.duration || 0);
          }}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
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
          className={`vx-border vx-hard-shadow-sm vx-press vx-result-play-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide ${
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
          onClick={handleDownload}
          className="vx-border vx-hard-shadow-sm vx-press vx-result-download-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
        >
          <Download size={15} />
          Download
        </button>
      </div>
    </div>
  );
}
