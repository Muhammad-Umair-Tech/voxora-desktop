import "../styles/footer.css";
import { Mail } from "lucide-react";
import GitHubIcon from "./GitHubIcon";

export default function Footer() {
  return (
    <footer id="app-footer">
      <div id="footer-content">
        <div id="footer-brand">
          <div id="footer-logo">VOXORA</div>
        </div>

        <div id="footer-links">
          <a
            href="mailto:m.umair8890@gmail.com"
            className="footer-link-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail size={15} />
            <span>m.umair8890@gmail.com</span>
          </a>

          <a
            href="https://github.com/Muhammad-Umair-Tech/voxora-desktop"
            className="footer-link-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon size={15} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      <div id="footer-bottom">
        <span>© 2026 Voxora.</span>
      </div>
    </footer>
  );
}
