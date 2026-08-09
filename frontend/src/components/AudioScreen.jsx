import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Play,
  Pause,
  Download,
  Check,
  Mic,
  FileText,
  Trash2,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import "../styles/audio_screen.css";
import AudioResultPanel from "./AudioResultPanel.jsx";

// Import audio files from assets
import alanVoice from "../assets/alan_voice.wav";
import samVoice from "../assets/sam_voice.wav";
import kathleenVoice from "../assets/kathleen_voice.wav";
import bryceVoice from "../assets/bryce_voice.wav";

const VOICES = [
  {
    id: "en_GB-alan-medium",
    name: "Alan",
    file: alanVoice,
    bars: [6, 14, 9, 20, 11, 16, 7],
  },
  {
    id: "en_GB-semaine-medium",
    name: "Sam",
    file: samVoice,
    bars: [10, 18, 8, 13, 20, 9, 15],
  },
  {
    id: "en_US-bryce-medium",
    name: "Bryce",
    file: bryceVoice,
    bars: [14, 8, 19, 10, 6, 17, 12],
  },
  {
    id: "en_US-kathleen-low",
    name: "Kathleen",
    file: kathleenVoice,
    bars: [8, 16, 12, 20, 9, 14, 6],
  },
];

function Waveform({ bars, isAnimating, className = "" }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`vx-wave-bar ${isAnimating ? "vx-bar-animating" : ""}`}
          style={{
            height: `${h}px`,
            animationDelay: isAnimating ? `${i * 0.06}s` : "0s",
          }}
        />
      ))}
    </div>
  );
}

export default function AudioScreen({ currentTheme }) {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [animatingVoice, setAnimatingVoice] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [audioResult, setAudioResult] = useState(null); // { audioUrl, duration }

  const fileInputRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const audioRef = useRef(null); // Ref to keep track of the playing Audio instance

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setScript(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setScript("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAudioResult(null);
    setGenError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleVoiceSelect = (selectedVoice) => {
    setVoice(selectedVoice.id);

    // Stop currently playing audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Play selected voice audio
    if (selectedVoice.file) {
      const newAudio = new Audio(selectedVoice.file);
      audioRef.current = newAudio;
      newAudio
        .play()
        .catch((err) => console.error("Audio playback error:", err));
    }

    // Clear any active animation timeout to restart seamlessly on rapid clicks
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setAnimatingVoice(selectedVoice.id);

    animationTimeoutRef.current = setTimeout(() => {
      setAnimatingVoice(null);
    }, 900); // 900ms duration for the pulse burst
  };

  const handleGenerate = async () => {
    if (isScriptEmpty || isGenerating) return;

    setIsGenerating(true);
    setGenError("");

    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script, voice_id: voice }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Failed to generate audio.");
      }

      const data = await res.json();
      setAudioResult({ audioUrl: data.audio_url, duration: data.duration });
    } catch (err) {
      console.error("Audio generation error:", err);
      setGenError(err.message || "Something went wrong generating audio.");
      setAudioResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!audioResult?.audioUrl) return;

    const link = document.createElement("a");
    link.href = audioResult.audioUrl;
    link.download = fileName
      ? `${fileName.replace(/\.[^/.]+$/, "")}.wav`
      : "voxora-audio.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isScriptEmpty = script.trim().length === 0;

  return (
    <div className="vx-root" data-theme={currentTheme}>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="vx-display text-4xl sm:text-5xl font-bold tracking-tight">
            Generate Speech
          </h1>
          <p className="text-sm sm:text-base vx-text-soft">
            Write or import a script, pick a voice, and generate audio.
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

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,text/plain"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-md vx-border vx-dropzone transition-colors ${
                isDragging ? "vx-dropzone--active" : ""
              }`}
            >
              <FileText size={16} className="vx-text-soft" />
              <span className="text-sm truncate vx-text-soft select-none">
                {fileName ? fileName : "Drop a .txt file, or import one."}
              </span>
            </div>

            <button
              type="button"
              onClick={handleImportClick}
              className="vx-border vx-hard-shadow-sm vx-press vx-import-btn flex items-center justify-center gap-2 px-5 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
            >
              <Upload size={15} />
              Import
            </button>

            {!isScriptEmpty && (
              <button
                type="button"
                onClick={handleClear}
                className="vx-border vx-hard-shadow-sm vx-press vx-clear-btn flex items-center justify-center gap-2 px-4 py-3 rounded-md vx-mono text-xs font-semibold uppercase tracking-wide"
              >
                <Trash2 size={15} />
                Clear
              </button>
            )}
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
                const isAnimating = animatingVoice === v.id;

                return (
                  <button
                    key={v.id}
                    onClick={() => handleVoiceSelect(v)}
                    className={`vx-border vx-hard-shadow-sm vx-press relative flex flex-col items-center gap-3 py-4 px-2 rounded-md ${
                      selected ? "vx-voice-card--selected" : "vx-voice-card"
                    }`}
                  >
                    {selected && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center vx-border vx-voice-check">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <Waveform bars={v.bars} isAnimating={isAnimating} />
                    <span className="vx-mono text-xs font-semibold uppercase tracking-wide">
                      {v.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vx-divider" />

          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleGenerate}
                disabled={isScriptEmpty || isGenerating}
                className={`vx-border vx-hard-shadow vx-generate-btn w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-md vx-display text-base font-bold uppercase tracking-tight ${
                  isScriptEmpty || isGenerating ? "vx-btn-disabled" : "vx-press"
                }`}
              >
                {isGenerating ? "Generating..." : "Generate audio"}
                {!isGenerating && <Play size={17} fill="currentColor" />}
              </button>
            </div>

            {/* Reserved space for the loader so the layout doesn't jump */}
            {isGenerating && (
              <div className="vx-loader-box vx-border rounded-md flex items-center gap-3 px-4 py-3">
                <div className="vx-loader-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <span className="vx-mono text-xs font-semibold uppercase tracking-wide vx-text-soft">
                  Generating audio...
                </span>
              </div>
            )}

            {!isGenerating && genError && (
              <div className="vx-error-box vx-border rounded-md px-4 py-3 vx-mono text-xs font-semibold">
                {genError}
              </div>
            )}

            {!isGenerating && audioResult && (
              <AudioResultPanel
                src={audioResult.audioUrl}
                currentTheme={currentTheme}
                onSave={handleSave}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
