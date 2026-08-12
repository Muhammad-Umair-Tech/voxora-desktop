import TitleBar from "./components/TitleBar";
import BannerSection from "./components/BannerSection.jsx";
import AudioSection from "./components/AudioSection.jsx";
import VideoSection from "./components/VideoSection.jsx";
import Models from "./components/Models.jsx";
import Footer from "./components/Footer.jsx";
import ThankYouPage from "./components/ThankYouSection.jsx";
import "./App.css";
import { useState, useEffect } from "react";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [downloadClicked, setDownloadClicked] = useState(false);

  // Set the data-theme attribute on the root <html> tag i.e. <html data-theme="dark">
  // useEffect is used to handle side effects: operations outside
  // React's main rendering cycle, such as manually interacting with the DOM here.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (downloadClicked) {
    return <ThankYouPage remainOnDownloadPage={setDownloadClicked} />;
  }

  return (
    <>
      <TitleBar
        theme={theme}
        onThemeChange={setTheme}
        onDownloadClicked={setDownloadClicked}
      />
      <BannerSection onDownloadClicked={setDownloadClicked} />
      <AudioSection />
      <Models />
      <VideoSection />
      <Footer />
    </>
  );
}
