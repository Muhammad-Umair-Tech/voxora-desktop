import React, { useEffect, useRef, useState } from "react";
import { Film, Upload, FlaskConical } from "lucide-react";
import "../styles/video_player_panel.css";
import TimestampMarkers, { formatTimestamp } from "./TimestampMarkers";
import sampleVideo from "../assets/sample_video.mp4";

export default function VideoPlayerPanel() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState(null);
  const [fileName, setFileName] = useState("No file uploaded.");
  const [timestamps, setTimestamps] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Object URLs created via URL.createObjectURL need to be released once
  // they're replaced or the component unmounts, or the browser leaks memory.
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  const loadVideo = (src, name) => {
    setVideoSrc(src);
    setFileName(name);
    setTimestamps([{ id: "t-0", seconds: 0, label: "0:00" }]);
    setActiveId("t-0");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadVideo(URL.createObjectURL(file), file.name);
    e.target.value = "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  // Loads the bundled sample_video.mp4 from /src/assets so the video +
  // timestamp flow can be tested without needing a real upload.
  const handleLoadSample = () => {
    loadVideo(sampleVideo, "sample_video.mp4");
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
              accept="video/*"
              className="hidden"
            />
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
          <span className="vx-mono text-xs vx-text-soft truncate">
            {fileName}
          </span>
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
