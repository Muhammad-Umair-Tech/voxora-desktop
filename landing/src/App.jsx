import TitleBar from "./components/TitleBar";
import "./App.css";
import { useState, useEffect } from "react";

export default function App() {
  const [theme, setTheme] = useState("light");

  // Set the data-theme attribute on the root <html> tag i.e. <html data-theme="dark">
  // useEffect is used to handle side effects: operations outside
  // React's main rendering cycle, such as manually interacting with the DOM here.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <TitleBar theme={theme} onThemeChange={setTheme} />
    </>
  );
}
