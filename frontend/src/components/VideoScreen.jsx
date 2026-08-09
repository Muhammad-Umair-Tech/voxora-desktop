import React, { useState } from "react";
import "../styles/video_screen.css";
import VideoPlayerPanel from "./VideoPlayerPanel";
import AudioLibraryPanel from "./AudioLibraryPanel";
import OverlayReplaceToggle from "./OverlayReplaceToggle";
import AddAudioButton from "./AddAudioButton";
import VideoResultPanel from "./VideoResultPanel";

export default function VideoScreen({ currentTheme }) {
  const [selectedAudio, setSelectedAudio] = useState(null); // { name, audio_url, path, ... }
  const [overlayMode, setOverlayMode] = useState("overlay"); // "overlay" | "replace"
  const [videoInfo, setVideoInfo] = useState(null); // { videoId, duration } | null
  const [activeTime, setActiveTime] = useState(0); // seconds — used as the audio's start time

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState("");
  const [resultVideo, setResultVideo] = useState(null); // { url } | null

  const canAdd =
    Boolean(videoInfo?.videoId) && Boolean(selectedAudio) && !isProcessing;

  const handleAdd = async () => {
    if (!canAdd) return;

    setIsProcessing(true);
    setProcessError("");
    setResultVideo(null);

    try {
      const res = await fetch("/api/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: videoInfo.videoId,
          audio_path: selectedAudio.path,
          start_time: activeTime,
          replace_audio: overlayMode === "replace",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Failed to add audio to the video.");
      }

      const data = await res.json();
      setResultVideo({ url: data.output_url });
    } catch (err) {
      console.error("Video processing error:", err);
      setProcessError(
        err.message || "Something went wrong adding audio to the video.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="vx-root" data-theme={currentTheme}>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="vx-display text-4xl sm:text-5xl font-bold tracking-tight">
            Video Integration
          </h1>
          <p className="text-sm sm:text-base vx-text-soft">
            Upload a video, mark timestamps, and pair it with audio from your
            library.
          </p>
        </div>

        <div className="vx-video-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <VideoPlayerPanel
              onVideoReady={setVideoInfo}
              onActiveTimeChange={setActiveTime}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <AudioLibraryPanel
              onSelect={setSelectedAudio}
              selectedAudioUrl={selectedAudio?.audio_url ?? null}
            />
            <OverlayReplaceToggle
              mode={overlayMode}
              onChange={setOverlayMode}
            />

            <div className="flex flex-col gap-4">
              <AddAudioButton
                onClick={handleAdd}
                disabled={!canAdd}
                isProcessing={isProcessing}
              />

              {/* Reserved space for the loader so the layout doesn't jump */}
              {isProcessing && (
                <div className="vx-loader-box vx-border rounded-md flex items-center gap-3 px-4 py-3">
                  <div className="vx-loader-bars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="vx-mono text-xs font-semibold uppercase tracking-wide vx-text-soft">
                    Adding audio to video...
                  </span>
                </div>
              )}

              {!isProcessing && processError && (
                <div className="vx-error-box vx-border rounded-md px-4 py-3 vx-mono text-xs font-semibold">
                  {processError}
                </div>
              )}

              {!isProcessing && resultVideo && (
                <VideoResultPanel videoUrl={resultVideo.url} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
