import "../styles/video_section.css";
import { useEffect, useRef, useState } from "react";
import { Play, Clock3, Layers, DownloadCloud } from "lucide-react";
import videoDemo from "../assets/voxora_video.mp4";

// Once you have a screen recording, wire it up the same way AudioSection
// wires up its clip:
//   import videoDemo from "../assets/voxora_video_demo.mp4";
// then swap the <div id="video-stage"> placeholder markup below for:
//   <video autoPlay muted loop playsInline src={videoDemo} />
// The placeholder is fully self-animating so the section doesn't feel
// empty in the meantime.

const FEATURES = [
  {
    icon: Clock3,
    title: "Frame-accurate placement",
    body: "The timeline clamps automatically so your clip never runs past the end of the video.",
  },
  {
    icon: Layers,
    title: "Overlay or replace",
    body: "Mix the new track in, or strip the original audio out entirely — your call.",
  },
  {
    icon: DownloadCloud,
    title: "Renders locally",
    body: "Export straight to .mp4 on your machine. Nothing leaves your computer.",
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

export default function VideoSection() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const [mode, setMode] = useState("overlay"); // "overlay" | "replace"
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);

  const handleStageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = rippleId.current++;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 650);
  };

  return (
    <section id="video-section" ref={sectionRef}>
      <div id="video-content">
        <span id="video-eyebrow" className="reveal">
          THE TIMELINE
        </span>

        <h2
          id="video-headline"
          className="reveal"
          style={{ "--delay": "0.08s" }}
        >
          Drop it in. Frame-accurate, every time.
        </h2>

        <p id="video-subcopy" className="reveal" style={{ "--delay": "0.16s" }}>
          Scrub to a timestamp, choose overlay or replace, and Voxora renders
          the final cut locally — no bounds-checking math required on your end.
        </p>

        <div
          id="video-mock"
          className="reveal reveal-frame"
          style={{ "--delay": "0.24s" }}
        >
          <div id="video-mock-topbar">
            <span className="mock-dot" />
            <span className="mock-dot" />
            <span className="mock-dot" />
            <div id="video-mock-address">
              <span className="mock-lock">🔒</span>
              localhost:8000
            </div>
          </div>

          {/* <div id="video-stage" onClick={handleStageClick}>
            <div id="video-stage-grid" />

            <button
              id="video-play-btn"
              aria-label="Preview coming soon"
              type="button"
            >
              <Play size={24} fill="currentColor" />
            </button>

            <span id="video-stage-caption">Screen recording coming soon</span>

            <div id="video-scrubber">
              <div id="video-scrubber-fill" />
            </div>

            {ripples.map((r) => (
              <span
                key={r.id}
                className="ripple"
                style={{ left: r.x, top: r.y }}
              />
            ))}
          </div> */}
          <video autoPlay muted loop playsInline src={videoDemo} />
        </div>

        {/* Interactive overlay / replace demo */}
        <div id="mode-demo" className="reveal" style={{ "--delay": "0.3s" }}>
          <div id="mode-toggle">
            <button
              type="button"
              className={`mode-toggle-btn ${mode === "overlay" ? "mode-toggle-btn--active" : ""}`}
              onClick={() => setMode("overlay")}
            >
              Overlay
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${mode === "replace" ? "mode-toggle-btn--active" : ""}`}
              onClick={() => setMode("replace")}
            >
              Replace
            </button>
          </div>

          <div id="track-demo">
            <div
              className={`track-row ${mode === "replace" ? "track-row--muted" : ""}`}
            >
              <span className="track-label">Original audio</span>
              <div className="track-bar track-bar--original" />
            </div>
            <div className="track-row">
              <span className="track-label">Generated audio</span>
              <div className="track-bar track-bar--generated" />
            </div>
          </div>
        </div>

        <div id="video-feature-row">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="video-feature-card reveal"
              style={{ "--delay": `${0.38 + i * 0.1}s` }}
            >
              <Icon size={20} className="video-feature-icon" />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
