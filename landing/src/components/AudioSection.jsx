import "../styles/audio_section.css";
import audioVideo from "../assets/voxora_audio.mp4";
import { useEffect, useRef } from "react";
import { FlaskConical, SaveCheck, Mic2 } from "lucide-react";

const FEATURES = [
  {
    icon: Mic2,
    title: "Multi-track speech",
    body: "Generate audio with upto four tracks.",
  },
  {
    icon: FlaskConical,
    title: "Test generated the audio",
    body: "Quickly play the generated audio within the app.",
  },
  {
    icon: SaveCheck,
    title: "Save the output",
    body: "Download the audio you like - no internet required.",
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

export default function AudioSection() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section id="audio-section" ref={sectionRef}>
      <div id="audio-content">
        <span id="audio-eyebrow" className="reveal">
          THE INTERFACE
        </span>

        <h2
          id="audio-headline"
          className="reveal"
          style={{ "--delay": "0.08s" }}
        >
          Opens in a tab. Runs like a studio.
        </h2>

        <p id="audio-subcopy" className="reveal" style={{ "--delay": "0.16s" }}>
          Voxora starts a local server and launches straight into your browser —
          your script, your voices, and your video timeline, all in one window.
          Nothing to sign into, nothing sent anywhere.
        </p>

        <div
          id="browser-mock"
          className="reveal reveal-frame"
          style={{ "--delay": "0.24s" }}
        >
          <div id="browser-mock-topbar">
            <span className="mock-dot" />
            <span className="mock-dot" />
            <span className="mock-dot" />
            <div id="browser-mock-address">
              <span id="browser-mock-lock">🔒</span>
              localhost:8000
            </div>
          </div>

          <div id="video-container">
            <video
              className="mock-video"
              autoPlay
              muted
              loop
              playsInline
              src={audioVideo}
            >
              <p>Your browser does not support video playback.</p>
            </video>
          </div>
        </div>

        <div id="feature-row">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="feature-card reveal"
              style={{ "--delay": `${0.32 + i * 0.1}s` }}
            >
              <Icon size={20} className="feature-icon" />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
