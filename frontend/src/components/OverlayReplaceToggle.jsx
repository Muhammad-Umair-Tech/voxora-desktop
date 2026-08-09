import React, { useState } from "react";
import "../styles/overlay_replace_toggle.css";

// Purely visual for now — no overlay/replace behavior is wired up yet.
export default function OverlayReplaceToggle() {
  const [mode, setMode] = useState("overlay");

  return (
    <div className="vx-border vx-hard-shadow vx-overlay-toggle flex rounded-md overflow-hidden h-14">
      <button
        type="button"
        onClick={() => setMode("overlay")}
        data-active={mode === "overlay"}
        className="flex-1 vx-mono text-xs font-bold uppercase tracking-wide flex items-center justify-center vx-overlay-toggle-btn"
      >
        Overlay
      </button>
      <button
        type="button"
        onClick={() => setMode("replace")}
        data-active={mode === "replace"}
        className="flex-1 vx-mono text-xs font-bold uppercase tracking-wide flex items-center justify-center vx-overlay-toggle-btn"
      >
        Replace
      </button>
    </div>
  );
}
