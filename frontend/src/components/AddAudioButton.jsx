import React from "react";
import { Plus } from "lucide-react";
import "../styles/add_audio_button.css";

// Not wired up yet — disabled until audio selection + overlay/replace exist.
export default function AddAudioButton() {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="vx-border vx-hard-shadow vx-add-audio-btn vx-btn-disabled w-full h-16 flex items-center justify-center gap-2 rounded-md vx-display text-base font-black uppercase tracking-wider"
    >
      <Plus size={18} />
      Add
    </button>
  );
}
