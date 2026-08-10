import "../App.css";
import { useState } from "react";
import AudioScreen from "../components/AudioScreen";
import VideoScreen from "../components/VideoScreen";
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
  const [isShutDown, setIsShutDown] = useState(false);

  const handleQuit = async () => {
    if (!window.confirm("Are you sure you want to quit Voxora?")) {
      return;
    }

    try {
      await fetch("/api/shutdown");
    } catch (err) {
      console.error("Server shutdown call failed:", err);
    } finally {
      setIsShutDown(true);
      window.close();
    }
  };

  // 1. Render shutdown message ONLY if isShutDown is true
  if (isShutDown) {
    return (
      <div
        className="vx-root flex items-center justify-center min-h-screen p-4 sm:p-6"
        data-theme={theme}
      >
        <div className="vx-border vx-hard-shadow vx-card rounded-md p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center gap-5">
          {/* Muted decorative waveform icon */}
          <div className="w-12 h-12 rounded-full vx-border flex items-center justify-center bg-[var(--surface-muted)]">
            <Waveform
              bars={[6, 12, 18, 10, 14]}
              className="text-[var(--ink-soft)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="vx-display text-2xl sm:text-3xl font-bold tracking-tight">
              Voxora Has Shut Down
            </h1>
            <span className="vx-mono text-xs font-semibold uppercase tracking-wider vx-text-soft">
              Server Offline
            </span>
          </div>

          <div className="vx-divider w-full" />

          <p className="text-sm sm:text-base vx-text-soft">
            The local application server has been terminated. You can now safely
            close this browser tab.
          </p>
        </div>
      </div>
    );
  }

  // 2. Render the main app by default (when isShutDown is false)
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

      {activeTab === "audio" ? (
        <AudioScreen currentTheme={theme} />
      ) : (
        <VideoScreen currentTheme={theme} />
      )}
    </div>
  );
}

export default App;
