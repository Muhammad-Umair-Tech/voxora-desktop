import React, { useEffect, useRef, useState } from "react";
import { Film, Upload, FlaskConical, Trash2, Loader2 } from "lucide-react";
import "../styles/video_player_panel.css";
import AudioPlacementRange, { formatTimestamp } from "./AudioPlacementRange";
import sampleVideo from "../assets/sample_video.mp4";

export default function VideoPlayerPanel({
  videoSrc = null,
  fileName = "No video uploaded.",
  videoDuration = 0,
  startTime = 0,
  selectedAudio = null,
  isGenerating = false,
  onLoadVideo,
  onClear,
  onLoadedMetadata,
  onStartTimeChange,
}) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [timestamps, setTimestamps] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isFetchingSample, setIsFetchingSample] = useState(false);

  useEffect(() => {
    setTimestamps(videoSrc ? [{ id: "t-0", seconds: 0, label: "0:00" }] : []);
    setActiveId(videoSrc ? "t-0" : null);
  }, [videoSrc]);

  const handleClearClick = () => {
    if (isGenerating) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClear) onClear();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onLoadVideo) onLoadVideo(file, URL.createObjectURL(file), file.name);
    e.target.value = "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleLoadSample = async () => {
    setIsFetchingSample(true);
    try {
      const res = await fetch(sampleVideo);
      const blob = await res.blob();
      const file = new File([blob], "sample_video.mp4", {
        type: blob.type || "video/mp4",
      });
      if (onLoadVideo) onLoadVideo(file, sampleVideo, "sample_video.mp4");
    } catch (err) {
      console.error("Failed to load sample video:", err);
    } finally {
      setIsFetchingSample(false);
    }
  };

  const handleLoadedMetadataEvent = (e) => {
    if (onLoadedMetadata) onLoadedMetadata(e.target.duration || 0);
  };

  const handleSelectTimestamp = (ts) => {
    setActiveId(ts.id);
    if (videoRef.current) {
      videoRef.current.currentTime = ts.seconds;
    }
  };

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
              accept="video/*"
              className="hidden"
            />
            {videoSrc ? (
              <button
                type="button"
                onClick={handleClearClick}
                disabled={isGenerating}
                className={`vx-border vx-hard-shadow-sm vx-clear-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide ${
                  isGenerating
                    ? "vx-btn-disabled opacity-50 cursor-not-allowed"
                    : "vx-press"
                }`}
              >
                <Trash2 size={13} />
                Clear
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isGenerating}
                  className={`vx-border vx-hard-shadow-sm vx-video-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide ${
                    isGenerating
                      ? "vx-btn-disabled opacity-50 cursor-not-allowed"
                      : "vx-press"
                  }`}
                >
                  <Upload size={13} />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  disabled={isFetchingSample || isGenerating}
                  className={`vx-border vx-hard-shadow-sm vx-video-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide ${
                    isFetchingSample || isGenerating
                      ? "vx-btn-disabled"
                      : "vx-press"
                  }`}
                >
                  <FlaskConical size={13} />
                  {isFetchingSample ? "Loading..." : "Load Sample"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="vx-video-frame vx-border rounded-md overflow-hidden relative aspect-video flex items-center justify-center">
          {videoSrc ? (
            <>
              <video
                ref={videoRef}
                src={videoSrc}
                controls={!isGenerating}
                onLoadedMetadata={handleLoadedMetadataEvent}
                onTimeUpdate={handleTimeUpdate}
                className={`w-full h-full transition-opacity ${
                  isGenerating
                    ? "opacity-40 pointer-events-none"
                    : "opacity-100"
                }`}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 backdrop-blur-[1px]">
                  <Loader2
                    size={28}
                    className="vx-spin text-[var(--primary)]"
                  />
                  <span className="vx-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                    Processing Video...
                  </span>
                </div>
              )}
            </>
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
          <span className="vx-mono text-xs vx-text-soft truncate">
            {fileName}
          </span>
        )}
      </div>

      <AudioPlacementRange
        videoDuration={videoDuration}
        selectedAudio={selectedAudio}
        startTime={startTime}
        onStartTimeChange={onStartTimeChange}
      />
    </>
  );
}
