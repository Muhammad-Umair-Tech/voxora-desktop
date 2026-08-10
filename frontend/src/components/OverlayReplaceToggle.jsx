import React from "react";
import "../styles/overlay_replace_toggle.css";

// Controlled by the parent screen: `mode` ("overlay" | "replace") lives in
// VideoScreen so AddAudioButton can read it when it calls the API.
export default function OverlayReplaceToggle({ mode = "replace", onChange }) {
  return (
    <div className="vx-border vx-hard-shadow vx-overlay-toggle flex rounded-md overflow-hidden h-14">
      <button
        type="button"
        onClick={() => onChange && onChange("overlay")}
        data-active={mode === "overlay"}
        className="flex-1 vx-mono text-xs font-bold uppercase tracking-wide flex items-center justify-center vx-overlay-toggle-btn"
      >
        Overlay
      </button>
      <button
        type="button"
        onClick={() => onChange && onChange("replace")}
        data-active={mode === "replace"}
        className="flex-1 vx-mono text-xs font-bold uppercase tracking-wide flex items-center justify-center vx-overlay-toggle-btn"
      >
        Replace
      </button>
    </div>
  );
}
