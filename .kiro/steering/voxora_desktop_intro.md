---
inclusion: always
---

<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
------------------------------------------------------------------------------------->

# VOXORA_SPEC.md

## 1. Voxora Introduction

- Voxora is an AI-native audio generation and video speech-integration application.
- The application accepts `.txt` file uploads, or allows the user to type text, to generate local, multi-track speech audio using three to five predefined local Piper TTS voices.
- Users can embed the newly generated audio into a chosen video at a specific timestamp.
- The system allows the user to either overlay the new audio on top of the original track or strip the original audio entirely to replace it.
- To ensure a seamless user experience, the system is packaged as a single Windows desktop executable that runs a background server and automatically launches a local web browser interface.

---

## 2. Technology Stack

- **Frontend Framework:** React + Vite (configured as a Fast SPA build tool).
- **Styling & Icons:** Tailwind CSS and Lucide React.
- **Media Interfaces:** `wavesurfer.js` for audio waveform visualization, alongside standard HTML5 `<audio>` and `<video>` elements.
- **Backend Server:** FastAPI running a local Uvicorn process.
- **Audio Generation Engine:** `piper-tts` (running entirely offline via local `.onnx` models).
- **Video Processing Pipeline:** `ffmpeg` system binary controlled via `moviepy` (or `pydub`) to handle slicing, trimming, and overlaying clips.
- **Packaging Tooling:** PyInstaller (for bundling the Python environment, models, and React static files into a `.exe`) and Inno Setup (for creating the Windows installation wizard).
- **Distribution:** Vercel (landing page hosting) and GitHub Releases (executable storage).

---

## 3. Deployment Notes

- **Dynamic Port Binding & Browser Automation:** Because hardcoded ports (like `8000`) can cause conflicts on a user's machine, the startup script uses the `socket` library to detect an available local port dynamically. Once Uvicorn binds to this port, a background thread utilizes Python's `webbrowser` module to automatically launch the default browser pointing to the correct localhost URL.
- **Graceful Process Termination:** Because the FastAPI backend runs silently without a terminal, the React frontend includes a "Quit Application" button. This triggers a specific `/api/shutdown` endpoint to cleanly terminate the background Uvicorn server and avoid zombie processes.
- **Executable Bundling via PyInstaller:** The Vite-compiled React build (from `/frontend/dist`), the Piper TTS voice models, and all ffmpeg dependencies are explicitly bundled into the executable via the PyInstaller `.spec` file. The build is configured with `console=False` so that no black command prompt window is visible to the user.
- **Windows Installer Compilation (Inno Setup):** An Inno Setup script compiles the PyInstaller output directory into a standard `VoxoraSetup.exe` wizard. The script handles writing to the user's `Program Files` directory, registering an uninstaller, and generating a desktop shortcut utilizing a custom `.ico` app logo.
- **Release & Landing Page Integration:** The compiled `VoxoraSetup.exe` is uploaded as an asset to the project's GitHub Releases page. The Vercel-hosted landing page serves as the public facade, featuring a "Download" button that hotlinks directly to the GitHub Release `.exe` asset, abstracting the repository from everyday users.

---

## 4. 7-Day Roadmap

- **Day 1: Project Setup & Core Infrastructure**
  - Initialize the FastAPI backend and the React app with Vite.
  - Install and configure Tailwind CSS, Axios, and the base project folder structure.
  - Draft the initial PyInstaller `.spec` file to confirm that a basic FastAPI server serving a static React build can be packaged successfully.
- **Day 2: Offline AI Integrations**
  - Download and bundle the chosen predefined Piper TTS `.onnx` voice models.
  - Build the FastAPI endpoint to parse text files and trigger local Piper TTS generation.
- **Day 3: Video Processing Engine**
  - Implement the local storage endpoint for target video uploads.
  - Write the core media processing function accepting video path, audio path, start time, and a replacement boolean flag.
  - Implement the `moviepy`/`ffmpeg` bounding math (`max_start_time = video_duration - audio_duration`) and render logic.
- **Day 4: React UI & Timeline Interface**
  - Build drag-and-drop file dropzones for text files and video files.
  - Construct the interactive video player alongside a range slider/timeline visualizer that automatically clamps to the valid start bounds.
  - Add the necessary UI toggle switches for "Overlay Audio" versus "Replace Original Audio".
- **Day 5: End-to-End Local Integration**
  - Connect the React UI to the FastAPI endpoints.
  - Implement the dynamic port detection function and the automatic `webbrowser` launch hook.
  - Add the `/api/shutdown` application termination loop.
- **Day 6: Testing & Packaging**
  - Finalize the PyInstaller `.spec` file configurations, ensuring all media libraries, `ffmpeg` binaries, and AI models are properly targeted in the `datas` array.
  - Conduct edge-case testing, ensuring the app opens automatically, handles audio generation without crashing, and closes without leaving background Python processes running.
- **Day 7: Deployment & Distribution**
  - Write the Inno Setup compiler script to create the desktop shortcut and final installer.
  - Create a release on the GitHub monorepo and upload the final installer asset.
  - Design, build, and deploy the simple static landing page to Vercel, linking the download button to the GitHub artifact.
