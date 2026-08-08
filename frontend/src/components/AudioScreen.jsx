import React, { useState } from "react";
import { Upload, Play, Check, Mic, FileText } from "lucide-react";
import "../styles/audio.css";

const VOICES = [
  { id: "alan", name: "Alan", bars: [6, 14, 9, 20, 11, 16, 7] },
  { id: "semaine", name: "Semaine", bars: [10, 18, 8, 13, 20, 9, 15] },
  { id: "bryce", name: "Bryce", bars: [14, 8, 19, 10, 6, 17, 12] },
  { id: "kathleen", name: "Kathleen", bars: [8, 16, 12, 20, 9, 14, 6] },
];

function Waveform({ bars, className = "" }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} className="vx-wave-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

export default function VoxoraAudioScreen({ currentTheme }) {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("alan");

  return (
    <div className="vx-root" data-theme={currentTheme}>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="vx-display text-4xl sm:text-5xl font-bold tracking-tight">
            Generate Speech
          </h1>
          <p className="text-sm sm:text-base vx-text-soft">
            Write or import a script, pick a voice, and audio.
          </p>
        </div>

        <div className="vx-border vx-hard-shadow vx-card relative flex flex-col gap-6 p-5 sm:p-7 rounded-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="script"
                className="vx-mono text-xs font-semibold uppercase tracking-wide"
              >
                Script
              </label>
              <span className="vx-mono text-xs vx-text-soft">
                {script.length} chars
              </span>
            </div>
            <textarea
              id="script"
              rows={7}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Type your script here..."
              className="vx-border vx-scrollbar vx-textarea w-full p-4 text-base rounded-md resize-none focus:outline-none"
            />
          </div>

          <div className="vx-divider" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-md vx-border vx-dropzone">
              <FileText size={16} className="vx-text-soft" />
              <span className="text-sm truncate vx-text-soft">
                Drop a .txt file, or import one
              </span>
            </div>
            <button className="vx-border vx-hard-shadow-sm vx-press vx-import-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide">
              <Upload size={15} />
              Import
            </button>
          </div>

          <div className="vx-divider" />

          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 vx-mono text-xs font-semibold uppercase tracking-wide">
              <Mic size={14} />
              Voice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VOICES.map((v) => {
                const selected = voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className={`vx-border vx-hard-shadow-sm vx-press relative flex flex-col items-center gap-3 py-4 px-2 rounded-md ${
                      selected ? "vx-voice-card--selected" : "vx-voice-card"
                    }`}
                  >
                    {selected && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center vx-border vx-voice-check">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <Waveform bars={v.bars} />
                    <span className="vx-mono text-xs font-semibold uppercase tracking-wide">
                      {v.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vx-divider" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <button className="vx-border vx-hard-shadow vx-press vx-generate-btn w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-md vx-display text-base font-bold uppercase tracking-tight">
              Generate audio
              <Play size={17} fill="currentColor" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
