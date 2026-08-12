import "../styles/thank_you_section.css";
import { Download, CheckCircle2 } from "lucide-react";

export default function ThankYouPage({ remainOnDownloadPage }) {
  return (
    <section id="thank-you-section">
      <div id="thank-you-content">
        <div id="thank-you-logo">VOXORA</div>

        <div id="thank-you-icon" aria-hidden="true">
          <CheckCircle2 size={26} />
        </div>

        <span id="thank-you-eyebrow">DOWNLOAD STARTED</span>

        <h1 id="thank-you-headline">Thank you for downloading Voxora!</h1>

        <p id="thank-you-subcopy">
          Your download should start automatically. If it didn&apos;t, grab it
          directly using the button below.
        </p>

        <div id="thank-you-cta">
          <a
            className="cta-primary vx-button"
            href="https://github.com/Muhammad-Umair-Tech/voxora-desktop/releases/latest/download/Voxora-Windows.zip"
          >
            <Download size={18} />
            Download for Windows
          </a>

          <button
            type="button"
            className="cta-secondary vx-button"
            onClick={() => remainOnDownloadPage(false)}
          >
            Go to home
          </button>
        </div>
      </div>
    </section>
  );
}
