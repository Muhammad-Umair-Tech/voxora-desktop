import React, { useRef, useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import "../styles/timestamp_markers.css";
import useAudioDuration from "../hooks/useAudioDuration";

export function formatTimestamp(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, totalSeconds)
    : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

export default function AudioPlacementRange({
  videoDuration = 0,
  selectedAudio = null,
  startTime = 0,
  onStartTimeChange,
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const audioDuration = useAudioDuration(selectedAudio);

  const isTooLong =
    audioDuration > videoDuration && videoDuration > 0 && audioDuration > 0;
  const maxStart = Math.max(0, videoDuration - audioDuration);

  // Percentage calculations
  const windowWidthPct = videoDuration
    ? Math.min(100, (audioDuration / videoDuration) * 100)
    : 0;
  const leftPct = videoDuration ? (startTime / videoDuration) * 100 : 0;

  const updatePositionFromMouse = (clientX) => {
    if (!trackRef.current || videoDuration <= 0 || maxStart <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = offsetX / rect.width;
    let newStart = ratio * videoDuration;

    newStart = Math.max(0, Math.min(newStart, maxStart));

    if (onStartTimeChange) {
      onStartTimeChange(newStart);
    }
  };

  const handleMouseDown = (e) => {
    if (isTooLong || videoDuration <= 0 || !selectedAudio) return;
    setIsDragging(true);
    updatePositionFromMouse(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updatePositionFromMouse(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, videoDuration, maxStart]);

  return (
    <div className="vx-border vx-hard-shadow vx-card rounded-md flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="vx-mono text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
          <Clock size={14} />
          Audio Placement Range
        </h2>
        {selectedAudio && !isTooLong && audioDuration > 0 && (
          <span className="vx-mono text-xs font-semibold vx-text-soft">
            Offset: {formatTimestamp(startTime)} -{" "}
            {formatTimestamp(startTime + audioDuration)}
          </span>
        )}
      </div>

      {/* Error state if selected audio exceeds total video length */}
      {isTooLong && (
        <div className="vx-error-box vx-border rounded-md px-4 py-3 flex items-center gap-2.5 vx-mono text-xs font-semibold">
          <AlertTriangle
            size={16}
            className="shrink-0 text-[var(--error,#ef4444)]"
          />
          <span>
            Selected audio ({formatTimestamp(audioDuration)}) is longer than the
            video ({formatTimestamp(videoDuration)}). Please select a shorter
            track.
          </span>
        </div>
      )}

      {!selectedAudio && (
        <p className="text-xs vx-text-soft">
          Select an audio track from the Audio Library to position it over the
          video timeline.
        </p>
      )}

      {selectedAudio && !isTooLong && (
        <div className="flex flex-col gap-2 pt-1">
          {/* Main Track Bar */}
          <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            className="vx-border relative h-10 rounded-md bg-[var(--surface-muted)] cursor-pointer select-none overflow-hidden"
          >
            {/* Sliding Window */}
            <div
              className="absolute top-0 bottom-0 bg-[var(--primary-container)] border-x-2 border-[var(--ink)] flex items-center justify-between"
              style={{
                left: `${leftPct}%`,
                width: `${windowWidthPct}%`,
              }}
            >
              {/* Knob at Left End */}
              <div className="vx-slider-knob vx-border absolute -left-2 w-4 h-8 rounded bg-[var(--primary)] shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-center">
                <div className="w-0.5 h-3 bg-[var(--primary-ink)] rounded-full" />
              </div>
            </div>
          </div>

          {/* Time Labels */}
          <div className="flex justify-between items-center vx-mono text-xs font-semibold vx-text-soft">
            <span>0:00</span>
            <span>{formatTimestamp(videoDuration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
