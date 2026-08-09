import React from "react";
import "../styles/video_screen.css";
import VideoPlayerPanel from "./VideoPlayerPanel";
import AudioLibraryPanel from "./AudioLibraryPanel";
import OverlayReplaceToggle from "./OverlayReplaceToggle";
import AddAudioButton from "./AddAudioButton";
import { useState } from "react";

export default function VideoScreen({ currentTheme }) {
  const [selectedAudio, setSelectedAudio] = useState(null);

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
            <VideoPlayerPanel selectedAudio={selectedAudio} />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <AudioLibraryPanel onSelect={setSelectedAudio} />
            <OverlayReplaceToggle />
            <AddAudioButton />
          </div>
        </div>
      </main>
    </div>
  );
}
