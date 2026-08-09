import React, { useEffect, useRef, useState } from "react";
import {
  Film,
  Upload,
  FlaskConical,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import "../styles/video_player_panel.css";
import TimestampMarkers, { formatTimestamp } from "./TimestampMarkers";
import sampleVideo from "../assets/sample_video.mp4";

export default function VideoPlayerPanel({ onVideoReady, onActiveTimeChange }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState(null);
  const [fileName, setFileName] = useState("No video uploaded.");
  const [timestamps, setTimestamps] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // "idle" | "uploading" | "ready" | "error" — tracks the background upload
  // to the backend, which is what actually gives us a video_id to work with.
  const [uploadStatus, setUploadStatus] = useState("idle");

  // Object URLs created via URL.createObjectURL need to be released once
  // they're replaced or the component unmounts, or the browser leaks memory.
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  // Tell the parent which point on the timeline is "active" so it can be
  // used as the audio's start time when adding it to the video.
  useEffect(() => {
    const active = timestamps.find((ts) => ts.id === activeId);
    onActiveTimeChange?.(active?.seconds ?? 0);
  }, [activeId, timestamps, onActiveTimeChange]);

  const uploadToServer = async (file) => {
    setUploadStatus("uploading");
    onVideoReady?.(null);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Failed to upload video.");
      }

      const data = await res.json();
      setUploadStatus("ready");
      onVideoReady?.({
        videoId: data.video_id,
        duration: data.duration_seconds,
      });
    } catch (err) {
      console.error("Video upload error:", err);
      setUploadStatus("error");
    }
  };

  const loadVideo = (src, name) => {
    setVideoSrc(src);
    setFileName(name);
    setTimestamps([{ id: "t-0", seconds: 0, label: "0:00" }]);
    setActiveId("t-0");
  };

  const handleClear = () => {
    if (videoSrc && videoSrc.startsWith("blob:")) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setFileName("No video uploaded.");
    setTimestamps([]);
    setActiveId(null);
    setUploadStatus("idle");
    onVideoReady?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadVideo(URL.createObjectURL(file), file.name);
    uploadToServer(file);
    e.target.value = "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  // Loads the bundled sample_video.mp4 from /src/assets for local preview,
  // and also uploads that same file to the backend so it gets a real
  // video_id — needed for the Add flow to work end to end.
  const handleLoadSample = async () => {
    loadVideo(sampleVideo, "sample_video.mp4");

    try {
      const response = await fetch(sampleVideo);
      const blob = await response.blob();
      const file = new File([blob], "sample_video.mp4", {
        type: blob.type || "video/mp4",
      });
      uploadToServer(file);
    } catch (err) {
      console.error("Failed to prepare sample video for upload:", err);
      setUploadStatus("error");
    }
  };

  const handleSelectTimestamp = (ts) => {
    setActiveId(ts.id);
    if (videoRef.current) {
      videoRef.current.currentTime = ts.seconds;
    }
  };

  const handleAddTimestamp = () => {
    if (!videoRef.current) return;
    const seconds = videoRef.current.currentTime;
    const id = `t-${Date.now()}`;

    setTimestamps((prev) =>
      [...prev, { id, seconds, label: formatTimestamp(seconds) }].sort(
        (a, b) => a.seconds - b.seconds,
      ),
    );
    setActiveId(id);
  };

  // Keeps the marker row in sync while the video plays, highlighting the
  // most recent timestamp the playhead has passed.
  const handleTimeUpdate = (e) => {
    const current = e.target.currentTime;
    let nearest = null;

    for (const ts of timestamps) {
      if (ts.seconds <= current + 0.25) {
        nearest = ts;
      }
    }

    if (nearest && nearest.id !== activeId) {
      setActiveId(nearest.id);
    }
  };

  return (
    <>
      <div className="vx-border vx-hard-shadow vx-card rounded-md flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="vx-mono text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
            <Film size={14} />
            Video
          </h2>

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".mp4,.mkv,.mov,.avi,video/*"
              className="hidden"
            />
            {videoSrc ? (
              <button
                type="button"
                onClick={handleClear}
                className="vx-border vx-hard-shadow-sm vx-press vx-clear-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
              >
                <Trash2 size={13} />
                Clear
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="vx-border vx-hard-shadow-sm vx-press vx-video-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
                >
                  <Upload size={13} />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="vx-border vx-hard-shadow-sm vx-press vx-video-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
                >
                  <FlaskConical size={13} />
                  Load Sample
                </button>
              </>
            )}
          </div>
        </div>

        <div className="vx-video-frame vx-border rounded-md overflow-hidden relative aspect-video flex items-center justify-center">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 text-center vx-text-soft">
              <Film size={28} />
              <span className="vx-mono text-xs uppercase tracking-wide">
                No video loaded
              </span>
              <span className="text-xs">
                Upload a file, or load the sample video to preview it here.
              </span>
            </div>
          )}
        </div>

        {fileName && (
          <div className="flex items-center gap-2">
            <span className="vx-mono text-xs vx-text-soft truncate">
              {fileName}
            </span>

            {uploadStatus === "uploading" && (
              <span className="vx-upload-status vx-upload-status--pending vx-mono text-[10px] uppercase tracking-wide flex items-center gap-1">
                <Loader2 size={11} className="vx-spin" />
                Uploading
              </span>
            )}
            {uploadStatus === "ready" && (
              <span className="vx-upload-status vx-upload-status--ready vx-mono text-[10px] uppercase tracking-wide flex items-center gap-1">
                <Check size={11} />
                Ready
              </span>
            )}
            {uploadStatus === "error" && (
              <span className="vx-upload-status vx-upload-status--error vx-mono text-[10px] uppercase tracking-wide">
                Upload failed
              </span>
            )}
          </div>
        )}
      </div>

      <TimestampMarkers
        timestamps={timestamps}
        activeId={activeId}
        disabled={!videoSrc}
        onSelect={handleSelectTimestamp}
        onAdd={handleAddTimestamp}
      />
    </>
  );
}
