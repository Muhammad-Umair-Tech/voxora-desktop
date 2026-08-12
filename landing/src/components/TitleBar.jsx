import voxoraIcon from "../assets/voxora_icon2.png";
import "../styles/title_bar.css";
import { Download, Sun, Moon } from "lucide-react";

export default function TitleBar({ theme, onThemeChange }) {
  const handleTogglerOnClick = () => {
    onThemeChange(theme === "light" ? "dark" : "light");
  };

  return (
    <header id="title-bar">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img src={voxoraIcon} alt="Voxora Icon" />
        <div id="app-title">VOXORA</div>
      </div>

      <nav id="nav-bar-middle">
        <button className="nav-button vx-button">Audio</button>
        <button className="nav-button vx-button">Models</button>
        <button className="nav-button vx-button">Video</button>
      </nav>

      <div className="title-bar-actions">
        <button
          id="toggler"
          className="vx-button"
          onClick={handleTogglerOnClick}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button id="download-button" className="vx-button">
          <Download size={18} style={{ marginRight: "6px" }} />
          <span>Download</span>
        </button>
      </div>
    </header>
  );
}
