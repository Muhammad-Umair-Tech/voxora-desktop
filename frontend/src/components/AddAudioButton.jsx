import React from "react";
import { Plus, Loader2 } from "lucide-react";
import "../styles/add_audio_button.css";

export default function AddAudioButton({ onClick, disabled, isProcessing }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`vx-border vx-hard-shadow vx-add-audio-btn w-full h-16 flex items-center justify-center gap-2 rounded-md vx-display text-base font-black uppercase tracking-wider ${
        disabled ? "vx-btn-disabled" : "vx-press"
      }`}
    >
      {isProcessing ? (
        <Loader2 size={18} className="vx-spin" />
      ) : (
        <Plus size={18} />
      )}
      {isProcessing ? "Adding..." : "Add"}
    </button>
  );
}
