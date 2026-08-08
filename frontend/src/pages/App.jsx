import "../App.css";
import { useState } from "react";
import VoxoraAudioScreen from "../components/AudioScreen";
import { Sun, Moon, LogOut } from "lucide-react";

function Waveform({ bars, className = "" }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} className="vx-wave-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("audio");

  const handleQuit = () => {
    if (window.confirm("Are you sure you want to quit Voxora?")) {
      window.close();
    }
  };

  return (
    <div className="vx-root" data-theme={theme}>
      <nav className="vx-nav">
        <div className="vx-nav-inner">
          <div className="flex items-center gap-2.5">
            <Waveform
              bars={[7, 13, 18, 10, 15]}
              className="text-[var(--primary)]"
            />
            <span className="vx-display text-lg font-bold uppercase tracking-tight">
              Voxora
            </span>
          </div>

          {/* Sliding Box Toggle Switch */}
          <div className="vx-segment-switch">
            <div className="vx-segment-slider" data-mode={activeTab} />
            <button
              onClick={() => setActiveTab("audio")}
              data-active={activeTab === "audio"}
              className="vx-segment-btn vx-mono text-xs font-semibold uppercase tracking-wide"
            >
              Audio
            </button>
            <button
              onClick={() => setActiveTab("video")}
              data-active={activeTab === "video"}
              className="vx-segment-btn vx-mono text-xs font-semibold uppercase tracking-wide"
            >
              Video
            </button>
          </div>

          {/* Controls: Theme Toggle & Red Quit Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="vx-border vx-press vx-theme-btn rounded-full p-2"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              onClick={handleQuit}
              className="vx-border vx-hard-shadow-sm vx-press vx-quit-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full vx-mono text-xs font-bold uppercase tracking-wide"
              aria-label="Quit application"
            >
              <LogOut size={14} />
              Quit
            </button>
          </div>
        </div>
      </nav>

      <VoxoraAudioScreen currentTheme={theme} />
    </div>
  );
}

export default App;
