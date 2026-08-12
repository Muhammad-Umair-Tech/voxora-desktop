# Voxora

**Voxora** is an AI-native, fully offline desktop application for generating multi-voice speech audio from text and embedding it into video at a precise timestamp. It runs entirely on-device using local Piper TTS models and ffmpeg, and ships as a single Windows installer — no internet connection, cloud API, or command line required.

<p align="left">
  <img alt="platform" src="https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6">
  <img alt="offline" src="https://img.shields.io/badge/inference-100%25%20offline-brightgreen">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-lightgrey">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started (Development)](#getting-started-development)
- [API Reference](#api-reference)
- [Building the Installer](#building-the-installer)
- [Distribution](#distribution)
- [Roadmap](#roadmap)
- [Constraints](#constraints)

---

## Overview

Voxora lets you turn a script into natural-sounding speech and drop that audio directly into a video — either layered on top of the original soundtrack or replacing it entirely. Everything happens locally: text-to-speech inference (Piper), audio/video processing (ffmpeg via moviepy), and the web-based UI are all bundled into one executable that launches a local server and opens your browser automatically.

## Features

- **Offline text-to-speech** — generate speech from typed text or an uploaded `.txt` file using four bundled Piper voices (Alan, Sam, Bryce, Kathleen), with zero network calls.
- **Voice previews** — audition each voice with a short sample clip before generating.
- **Waveform playback** — review generated audio with a `wavesurfer.js` waveform, live timestamp, and one-click download.
- **Audio Library** — every clip generated in a session is saved and reusable when composing a video, enabling multi-track workflows.
- **Video embedding** — upload a video (or load a bundled sample), pick a track from the Audio Library, and drag a placement window to choose exactly where the audio starts.
- **Overlay or Replace** — mix the new audio with the original track, or strip the original entirely.
- **Safe bounds enforcement** — placement is automatically clamped, both in the UI and on the server, so audio can never be scheduled past the end of the video.
- **Light/dark theme** — a full CSS custom-property theme system, including waveform colors that adapt to the active theme.
- **Zero-install runtime** — packaged as a single Windows executable via PyInstallerd; no Python, Node, or ffmpeg installation required by the end user.
- **Clean lifecycle** — dynamic port selection avoids conflicts, and a Quit button gracefully shuts down the local server with no orphaned processes.

## Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Frontend         | React + Vite, Tailwind CSS, Lucide React icons    |
| Audio/Video UI   | `wavesurfer.js`, HTML5 `<audio>` / `<video>`      |
| Backend          | FastAPI on Uvicorn                                |
| Speech synthesis | `piper-tts` (offline, local `.onnx` voice models) |
| Media processing | `ffmpeg` (bundled binary), driven via `moviepy`   |
| Packaging        | PyInstaller (executable)                          |
| Landing page     | React + Vite, deployed to Vercel                  |
| Distribution     | GitHub Releases (installer asset)                 |

## Architecture

Voxora runs as a local client–server application entirely on the user's machine. The packaged executable boots a FastAPI/Uvicorn server in-process and opens the React SPA in the default browser.

```
┌─────────────────────────────────────────────────────────┐
│                  VoxoraSetup.exe (installed)             │
│                                                           │
│  ┌──────────────────────┐   ┌───────────────────────┐   │
│  │  Python Entrypoint    │   │  React SPA (static)   │   │
│  │  (main.py)             │   │  served by FastAPI     │   │
│  │  1. Find free port     │   │  on /                  │   │
│  │  2. Start Uvicorn      │   └───────────────────────┘   │
│  │  3. Open browser       │                               │
│  │                        │   ┌───────────────────────┐   │
│  │  FastAPI app           │──▶│  FastAPI Routes         │   │
│  │  (backend/main.py)     │   │  /api/generate-audio    │   │
│  └──────────────────────┘   │  /api/upload-video       │   │
│                               │  /api/process-video      │   │
│                               │  /api/audio-library       │   │
│                               │  /api/shutdown             │   │
│                               └───────────────────────┘   │
│                                                           │
│  Bundled assets: piper.exe · .onnx voice models · ffmpeg  │
└─────────────────────────────────────────────────────────┘
```

The UI is a two-screen, tab-based layout:

- **Audio screen** — script editor, voice selection, generation, and waveform playback.
- **Video screen** — video upload/preview, Audio Library, drag-based placement window, Overlay/Replace mode, and processing.

## Project Structure

```
voxora/
├── backend/
│   ├── main.py               # FastAPI app + startup entrypoint
│   ├── routers/
│   │   ├── audio.py          # /api/generate-audio, /api/audio-library
│   │   ├── video.py          # /api/upload-video, /api/process-video
│   │   └── system.py         # /api/shutdown
│   ├── services/
│   │   ├── tts_service.py        # Piper TTS subprocess wrapper
│   │   ├── video_service.py      # ffmpeg/moviepy processing logic
│   │   └── tempfile_service.py   # startup cleanup of stale temp files
│   ├── models/
│   │   └── schemas.py        # Pydantic request/response models
│   └── utils/
│       └── port_finder.py    # Dynamic port detection
├── frontend/
│   ├── src/
│   │   ├── components/       # AudioScreen, VideoScreen, and child components
│   │   ├── styles/           # Per-component CSS (theme tokens, animations)
│   │   ├── assets/           # Bundled voice previews + sample video
│   │   ├── hooks/
│   │   │   └── useAudioDuration.js
│   │   ├── api/
│   │   │   └── client.js     # Axios instance with dynamic base URL
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── models/                   # Bundled Piper .onnx voice models
├── tools/
│   ├── piper/piper.exe
│   └── ffmpeg/ffmpeg.exe
├── assets/
│   └── voxora_icon2.ico
├── voxora.spec                # PyInstaller spec file
├── installer.iss              # Inno Setup script
└── landing/                   # Vercel-hosted React + Vite landing page
```

## Getting Started (Development)

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- `ffmpeg` and Piper voice models available locally for development (bundled automatically at build time for the packaged app)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8765
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

During development, Vite proxies `/api` requests to `localhost:8765`. In the packaged executable, the frontend instead reads the runtime port from `window.__VOXORA_PORT__` (injected by the Python startup script) or falls back to a relative base URL, since FastAPI serves the built SPA directly.

## API Reference

All endpoints are served locally by the bundled FastAPI backend.

| Method | Endpoint              | Description                                                                                                    |
| ------ | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/generate-audio` | Generates speech from `{ text, voice_id }` using Piper TTS. Returns `{ audio_url, duration }`.                 |
| `GET`  | `/api/audio-library`  | Lists previously generated `.wav` files for the session, newest first.                                         |
| `POST` | `/api/upload-video`   | Uploads a video file (`.mp4`, `.mkv`, `.mov`, `.avi`). Returns `{ video_id, duration_seconds }`.               |
| `POST` | `/api/process-video`  | Embeds audio into video given `{ video_id, audio_path, start_time, replace_audio }`. Returns `{ output_url }`. |
| `GET`  | `/api/shutdown`       | Cleanly terminates the local Uvicorn server.                                                                   |
| `GET`  | `/files/{path}`       | Static file mount serving generated audio, video previews, and processed output.                               |

`start_time` is always clamped server-side to `max(0, video_duration - audio_duration)`, in addition to being constrained in the UI.

## Building the Installer

1. Build the frontend: `npm run build` (outputs to `frontend/dist`).
2. Build the executable: `pyinstaller voxora.spec` — bundles the React build, Piper models, and ffmpeg binaries into a `console=False` executable.
3. Compile the installer: run the Inno Setup script (`installer.iss`) to produce `VoxoraSetup.exe`, which installs to `Program Files`, registers an uninstaller, and creates a desktop shortcut.

## Distribution

- The compiled `VoxoraSetup.exe` is published as an asset on the project's GitHub Releases page.
- The `landing/` React + Vite app is deployed independently to Vercel and serves as the public download page, linking directly to the latest GitHub Release asset.

## Roadmap

Development follows a 7-day plan: project scaffolding, offline TTS integration, video processing pipeline, UI and timeline interface, end-to-end integration, packaging/testing, and final deployment/distribution. See `tasks.md` for the detailed, day-by-day task breakdown.

## Constraints

- Windows 10 / 11 only.
- Voice set is fixed and bundled; custom voice upload is not supported in v1.
- Output video format is `.mp4`.
- Single-user, single-instance per machine session.

---

<sub>All AI inference and media processing run entirely offline — no text, audio, or video ever leaves the user's machine.</sub>
