import "../styles/models.css";
import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

// Point these at whatever you actually named the files in your assets
// folder — these paths/filenames are placeholders.
import alanSample from "../assets/alan_voice.wav";
import samSample from "../assets/sam_voice.wav";
import bryceSample from "../assets/bryce_voice.wav";
import kathleenSample from "../assets/kathleen_voice.wav";

// Same waveform "fingerprint" bars used for each voice on the Audio screen,
// reused here so a voice looks the same wherever it shows up in the app.
const MODELS = [
  {
    id: "alan",
    name: "Alan",
    tag: "Warm, grounded, narrator-friendly",
    bars: [6, 14, 9, 20, 11, 16, 7],
    src: alanSample,
  },
  {
    id: "semaine",
    name: "Sam",
    tag: "Bright, quick, upbeat",
    bars: [10, 18, 8, 13, 20, 9, 15],
    src: samSample,
  },
  {
    id: "bryce",
    name: "Bryce",
    tag: "Deep, calm, documentary",
    bars: [14, 8, 19, 10, 6, 17, 12],
    src: bryceSample,
  },
  {
    id: "kathleen",
    name: "Kathleen",
    tag: "Clear, crisp, professional",
    bars: [8, 16, 12, 20, 9, 14, 6],
    src: kathleenSample,
  },
];

function useScrollReveal(sectionRef) {
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(".reveal");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionRef]);
}

export default function Models() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    // Pause everything on unmount so nothing keeps playing in the background.
    const refs = audioRefs.current;
    return () => {
      Object.values(refs).forEach((a) => a.pause());
    };
  }, []);

  const handleToggle = (model) => {
    const current =
      audioRefs.current[model.id] ??
      (audioRefs.current[model.id] = new Audio(model.src));

    if (playingId === model.id) {
      current.pause();
      setPlayingId(null);
      return;
    }

    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId].pause();
      audioRefs.current[playingId].currentTime = 0;
    }

    current.currentTime = 0;
    current.play();
    current.onended = () => setPlayingId(null);
    setPlayingId(model.id);
  };

  return (
    <section id="models-section" ref={sectionRef}>
      <div id="models-content">
        <span id="models-eyebrow" className="reveal">
          THE VOICES
        </span>

        <h2
          id="models-headline"
          className="reveal"
          style={{ "--delay": "0.08s" }}
        >
          Four voices. Pick the one that fits.
        </h2>

        <p
          id="models-subcopy"
          className="reveal"
          style={{ "--delay": "0.16s" }}
        >
          Every voice runs offline through Piper TTS. Tap one to hear a sample.
        </p>

        <div id="model-grid">
          {MODELS.map((model, i) => {
            const playing = playingId === model.id;
            return (
              <div
                key={model.id}
                className="model-card reveal"
                style={{ "--delay": `${0.24 + i * 0.08}s` }}
              >
                <button
                  type="button"
                  className={`vx-button model-play-btn ${
                    playing ? "model-play-btn--playing" : ""
                  }`}
                  onClick={() => handleToggle(model)}
                  aria-label={
                    playing
                      ? `Pause ${model.name} sample`
                      : `Play ${model.name} sample`
                  }
                >
                  {playing ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </button>

                <h3 className="model-name">{model.name}</h3>
                <p className="model-tag">{model.tag}</p>

                <div
                  className={`model-wave ${playing ? "model-wave--playing" : ""}`}
                  aria-hidden="true"
                >
                  {model.bars.map((h, idx) => (
                    <span
                      key={idx}
                      className="model-wave-bar"
                      style={{ height: `${h}px`, "--i": idx }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
