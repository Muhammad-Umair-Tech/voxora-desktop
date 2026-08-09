import React, { useRef, useState } from "react";
import { Play, Pause, Download } from "lucide-react";
import "../styles/video_result_panel.css";

export default function VideoResultPanel({ videoUrl }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handlePlayToggle = () => {
    if (!showPreview) {
      // Reveal the preview player, then start it once it's mounted.
      setShowPreview(true);
      requestAnimationFrame(() => {
        videoRef.current
          ?.play()
          .catch((err) => console.error("Video playback error:", err));
      });
      return;
    }

    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current
        ?.play()
        .catch((err) => console.error("Video playback error:", err));
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "voxora-video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3">
      {showPreview && (
        <div className="vx-video-frame vx-border rounded-md overflow-hidden aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handlePlayToggle}
          className="vx-border vx-hard-shadow-sm vx-press vx-video-result-play-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
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
          className="vx-border vx-hard-shadow-sm vx-press vx-video-result-download-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
        >
          <Download size={15} />
          Download
        </button>
      </div>
    </div>
  );
}
