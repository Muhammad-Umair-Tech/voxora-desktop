import "../styles/banner_section.css";
import { Download, Mic2, WifiOff, Package, PlayCircle } from "lucide-react";
import GitHubIcon from "./GitHubIcon";

// Hand-tuned amplitude pattern so the waveform reads like real speech
// rather than a uniform decorative pattern.
const WAVEFORM = [
  6, 10, 8, 14, 22, 18, 26, 34, 24, 16, 12, 20, 30, 38, 28, 18, 10, 14, 24, 32,
  22, 12, 8, 16, 26, 20, 10, 6, 14, 22, 30, 24, 14, 8, 12, 18, 10, 6,
];

// Where along the waveform the "insert" pin sits (percentage across).
const PIN_POSITION = 63;

export default function BannerSection({ onDownloadClicked }) {
  return (
    <section id="banner-section">
      <div id="banner-content">
        <div id="banner-text">
          <span id="banner-eyebrow">DESKTOP APP · RUNS 100% LOCALLY</span>

          <h1 id="banner-headline">
            Give your video a voice
            <br />
            without touching the cloud.
          </h1>

          <p id="banner-subcopy">
            Type your script or drop in a .txt file. Voxora builds multi-track
            speech from local Piper voices, then drops it into your video at the
            exact timestamp you pick — layered over the original audio, or in
            place of it.
          </p>

          <div id="banner-cta">
            <a
              className="cta-primary vx-button"
              href="https://github.com/Muhammad-Umair-Tech/voxora-desktop/releases/latest/download/Voxora-Windows.zip"
              onClick={() => onDownloadClicked(true)}
            >
              <Download size={18} />
              Download for Windows
            </a>
            <a
              className="cta-secondary vx-button"
              href="https://github.com/Muhammad-Umair-Tech/voxora-desktop"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon size={18} />
              GitHub
            </a>
          </div>

          <div id="banner-stats">
            <div className="stat-chip">
              <Mic2 size={15} />4 local voices
            </div>
            <div className="stat-chip">
              <WifiOff size={15} />
              No internet required
            </div>
            <div className="stat-chip">
              <Package size={15} />
              One .exe, no install steps
            </div>
          </div>
        </div>

        <div id="banner-visual" aria-hidden="true">
          <div id="video-mock">
            <div id="video-mock-topbar">
              <span className="mock-dot" />
              <span className="mock-dot" />
              <span className="mock-dot" />
              <span id="video-mock-time">00:42 / 03:15</span>
            </div>
            <div id="video-mock-frame">
              <PlayCircle id="video-mock-play" size={46} />
            </div>
          </div>

          <div id="waveform-track">
            {WAVEFORM.map((height, i) => (
              <span
                key={i}
                className="wave-bar"
                style={{
                  height: `${height}px`,
                  animationDelay: `${(i % 12) * 0.09}s`,
                }}
              />
            ))}
            <div id="insert-pin" style={{ left: `${PIN_POSITION}%` }}>
              <span id="pin-flag">Speech inserted here</span>
              <span id="pin-line" />
              <span id="pin-dot" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
