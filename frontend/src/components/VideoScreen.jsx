import React, { useEffect, useState } from "react";
import "../styles/video_screen.css";
import VideoPlayerPanel from "./VideoPlayerPanel";
import AudioLibraryPanel from "./AudioLibraryPanel";
import OverlayReplaceToggle from "./OverlayReplaceToggle";
import AddAudioButton from "./AddAudioButton";
import VideoResultPanel from "./VideoResultPanel";

export default function VideoScreen({ currentTheme }) {
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [mode, setMode] = useState("replace");

  const [videoFile, setVideoFile] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [fileName, setFileName] = useState("No video uploaded.");
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState(null);

  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  const handleLoadVideo = async (file, src, name) => {
    setVideoFile(file);
    setVideoSrc(src);
    setFileName(name);
    setVideoDuration(0);
    setStartTime(0);
    setVideoResult(null);
    setVideoId(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload video to server.");
      }

      const data = await res.json();
      setVideoId(data.video_id);
      if (data.duration_seconds) {
        setVideoDuration(data.duration_seconds);
      }
    } catch (err) {
      console.error("Video upload error:", err);
    }
  };

  const handleClearVideo = () => {
    if (isGenerating) return;

    if (videoSrc && videoSrc.startsWith("blob:")) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoFile(null);
    setVideoId(null);
    setVideoSrc(null);
    setFileName("No video uploaded.");
    setVideoDuration(0);
    setStartTime(0);
    setVideoResult(null);
  };

  const handleResult = (result) => {
    setIsGenerating(false);
    setVideoResult(result);
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
              videoSrc={videoSrc}
              fileName={fileName}
              videoDuration={videoDuration}
              startTime={startTime}
              selectedAudio={selectedAudio}
              isGenerating={isGenerating}
              onLoadVideo={handleLoadVideo}
              onClear={handleClearVideo}
              onLoadedMetadata={setVideoDuration}
              onStartTimeChange={setStartTime}
            />

            {videoResult && (
              <VideoResultPanel
                videoUrl={videoResult.videoUrl}
                fileName={fileName}
              />
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <AudioLibraryPanel onSelect={setSelectedAudio} />
            <OverlayReplaceToggle mode={mode} onChange={setMode} />
            <AddAudioButton
              videoId={videoId}
              videoDuration={videoDuration}
              startTime={startTime}
              selectedAudio={selectedAudio}
              mode={mode}
              onStartGenerating={() => {
                setIsGenerating(true);
                setVideoResult(null);
              }}
              onResult={handleResult}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
