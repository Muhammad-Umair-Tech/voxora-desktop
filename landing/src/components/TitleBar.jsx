import voxoraIcon from "../assets/voxora_icon2.png";
import "../styles/title_bar.css";
import { Download, Sun, Moon } from "lucide-react";

export default function TitleBar({ theme, onThemeChange }) {
  const handleTogglerOnClick = () => {
    if (theme === "light") {
      onThemeChange("dark");
    } else {
      onThemeChange("light");
    }
  };

  return (
    <div id="title-bar">
      <img src={voxoraIcon} alt="Voxora Icon" />
      <div id="app-title">VOXORA</div>
      <div id="nav-bar-middle">
        <button className="nav-button">Audio</button>
        <button className="nav-button">Models</button>
        <button className="nav-button">Video</button>
      </div>
      <button id="toggler" onClick={handleTogglerOnClick}>
        {theme === "dark" ? <Sun /> : <Moon />}
      </button>
      <button id="download-button">
        <Download
          style={{ marginRight: "10px", width: "20px", height: "20px" }}
        />
        Download
      </button>
    </div>
  );
}
