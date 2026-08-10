import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import "../styles/add_audio_button.css";
import useAudioDuration from "../hooks/useAudioDuration";

export default function AddAudioButton({
  videoId,
  videoDuration,
  startTime,
  selectedAudio,
  mode,
  onStartGenerating,
  onResult,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const audioDuration = useAudioDuration(selectedAudio);
  const audioTooLong =
    !!selectedAudio &&
    audioDuration > 0 &&
    videoDuration > 0 &&
    audioDuration > videoDuration;

  const canAdd =
    !!videoId &&
    !!selectedAudio &&
    videoDuration > 0 &&
    !audioTooLong &&
    !isGenerating;

  let title = "Upload a video and select an audio track to continue.";
  if (videoId && !selectedAudio) {
    title = "Select an audio track from the library.";
  } else if (selectedAudio && audioTooLong) {
    title = "Selected audio is longer than the video — pick a shorter track.";
  } else if (canAdd) {
    title =
      mode === "overlay"
        ? "Overlay this track on top of the video's existing audio."
        : "Replace the video's audio with this track.";
  }

  const handleClick = async () => {
    if (!canAdd) return;

    setIsGenerating(true);
    if (onStartGenerating) onStartGenerating();
    setError("");

    try {
      const payload = {
        video_id: videoId,
        audio_path:
          selectedAudio.audio_path ||
          selectedAudio.audio_url ||
          selectedAudio.url,
        start_time: Number(startTime || 0),
        replace_audio: mode === "replace",
      };

      const res = await fetch("/api/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Failed to add audio to the video.");
      }

      const data = await res.json();
      if (onResult) onResult({ videoUrl: data.output_url });
    } catch (err) {
      console.error("Add audio error:", err);
      setError(err.message || "Something went wrong adding audio.");
      if (onResult) onResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={!canAdd}
        title={title}
        className={`vx-border vx-hard-shadow vx-add-audio-btn w-full h-16 flex items-center justify-center gap-2 rounded-md vx-display text-base font-black uppercase tracking-wider ${
          !canAdd ? "vx-btn-disabled" : "vx-press"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="vx-spin" />
            Adding Audio...
          </>
        ) : (
          <>
            <Plus size={18} />
            Add
          </>
        )}
      </button>

      {!isGenerating && error && (
        <div className="vx-error-box vx-border rounded-md px-4 py-3 vx-mono text-xs font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}
