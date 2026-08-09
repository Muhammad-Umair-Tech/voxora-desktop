import React from "react";
import { Clock, Plus } from "lucide-react";
import "../styles/timestamp_markers.css";

// Shared with VideoPlayerPanel so newly-added markers get the same label
// format as the ones rendered here. Shows H:MM:SS only once the video is
// over an hour long, otherwise just M:SS (matches how most video players
// label chapter markers).
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

export default function TimestampMarkers({
  timestamps,
  activeId,
  disabled,
  onSelect,
  onAdd,
}) {
  return (
    <div className="vx-border vx-hard-shadow vx-card rounded-md flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="vx-mono text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
          <Clock size={14} />
          Timestamps
        </h2>

        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className={`vx-border vx-hard-shadow-sm vx-press vx-marker-add-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide ${
            disabled ? "vx-btn-disabled" : ""
          }`}
        >
          <Plus size={13} />
          Mark
        </button>
      </div>

      {timestamps.length === 0 ? (
        <p className="text-xs vx-text-soft">
          {disabled
            ? "Load a video to start marking timestamps."
            : "No timestamps yet — hit Mark to drop one at the current playback position."}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {timestamps.map((ts) => (
            <button
              key={ts.id}
              type="button"
              onClick={() => onSelect(ts)}
              className={`vx-border vx-hard-shadow-sm vx-press vx-marker-chip flex items-center justify-center px-3 py-2 rounded-md vx-mono text-xs font-bold ${
                ts.id === activeId ? "vx-marker-chip--active" : ""
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
