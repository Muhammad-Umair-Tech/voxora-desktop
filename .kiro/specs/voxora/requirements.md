# Voxora — Requirements

## Overview

Voxora is an AI-native audio generation and video transcription desktop application for Windows. It runs entirely offline and is distributed as a single Windows installer. Users can generate multi-track speech audio from text using local Piper TTS voices and embed that audio into a target video at a chosen timestamp — either overlaying or replacing the original audio track.

---

## Functional Requirements

### 1. Text Input & File Upload

- **REQ-1.1** The application shall accept plain-text input via a drag-and-drop file dropzone that supports `.txt` files.
- **REQ-1.2** The application shall allow the user to type or paste text directly into an in-app text editor as an alternative to file upload.
- **REQ-1.3** Uploaded `.txt` file content shall be loaded into the text editor so the user can review and edit before generation.
- **REQ-1.4** The system shall validate that the text input is non-empty before allowing audio generation to proceed.

### 2. Voice Selection & Audio Generation

- **REQ-2.1** The application shall expose three to five predefined Piper TTS voices for the user to choose from.
- **REQ-2.2** All voice models shall be bundled locally (`.onnx` format) and shall not require an internet connection.
- **REQ-2.3** The user shall be able to assign one voice per audio track, allowing multi-track composition.
- **REQ-2.4** The backend shall expose a `/api/generate-audio` endpoint that accepts text and a voice identifier, runs the local Piper TTS binary, and returns the generated `.wav` audio file.
- **REQ-2.5** The generated audio shall be playable directly in the UI via an audio player with waveform visualization (wavesurfer.js).

### 3. Video Upload & Preview

- **REQ-3.1** The application shall accept video file uploads via a drag-and-drop dropzone supporting common formats (`.mp4`, `.mkv`, `.mov`, `.avi`).
- **REQ-3.2** The uploaded video shall be previewed in an HTML5 `<video>` player within the UI.
- **REQ-3.3** The backend shall store the uploaded video temporarily in a local working directory and return its file path and duration metadata.

### 4. Timestamp & Timeline Control

- **REQ-4.1** The UI shall display a range slider or timeline control allowing the user to select the start time at which the generated audio will be embedded into the video.
- **REQ-4.2** The slider shall automatically clamp its maximum value to `video_duration - audio_duration` to prevent out-of-bounds placement.
- **REQ-4.3** The selected timestamp shall be displayed numerically alongside the slider in `MM:SS` format.

### 5. Audio Embedding Mode

- **REQ-5.1** The UI shall present a toggle switch with two modes: **Overlay** (mix new audio with original) and **Replace** (strip original audio and substitute with generated audio).
- **REQ-5.2** The selected mode shall be passed as a boolean parameter (`replace_audio: bool`) to the video processing endpoint.

### 6. Video Processing & Export

- **REQ-6.1** The backend shall expose a `/api/process-video` endpoint accepting: video path, audio path, start time (seconds), and the replace/overlay flag.
- **REQ-6.2** The processing pipeline shall use `ffmpeg` (via `moviepy` or `pydub`) to splice, mix, and render the final video.
- **REQ-6.3** The system shall enforce `max_start_time = video_duration - audio_duration` server-side to prevent invalid renders.
- **REQ-6.4** The processed output video shall be saved to a local output directory and made available for download via the UI.
- **REQ-6.5** The UI shall display a progress indicator during video processing and notify the user upon completion with a download link.

### 7. Application Lifecycle

- **REQ-7.1** On launch, the executable shall dynamically detect an available local port using the `socket` library and start the Uvicorn/FastAPI server on that port.
- **REQ-7.2** After the server is ready, a background thread shall open the user's default browser to the correct `localhost:<port>` URL automatically.
- **REQ-7.3** The React UI shall include a **Quit Application** button that calls the `/api/shutdown` endpoint to cleanly terminate the Uvicorn server process.
- **REQ-7.4** No command prompt or terminal window shall be visible to the user during normal operation (`console=False` in PyInstaller).

### 8. Packaging & Distribution

- **REQ-8.1** The application shall be bundled into a single Windows `.exe` via PyInstaller, including the React static build, Piper TTS models, and ffmpeg binaries.
- **REQ-8.2** An Inno Setup script shall compile the PyInstaller output into a `VoxoraSetup.exe` installer that handles `Program Files` installation, uninstaller registration, and desktop shortcut creation.
- **REQ-8.3** The final installer shall be uploaded as an asset to the project's GitHub Releases page.
- **REQ-8.4** A static landing page hosted on Vercel shall serve as the public-facing download page, with a download button linking directly to the GitHub Release asset.

---

## Non-Functional Requirements

- **NFR-1 — Offline Operation:** All AI inference (TTS) and media processing (ffmpeg) must function without any internet connection.
- **NFR-2 — Performance:** Audio generation for a 500-word text block should complete in under 30 seconds on a mid-range Windows machine.
- **NFR-3 — Port Safety:** The dynamic port selection must avoid conflicts with well-known ports and retry if the selected port is unavailable.
- **NFR-4 — Clean Shutdown:** The `/api/shutdown` endpoint must ensure no zombie Python or ffmpeg processes remain after the application exits.
- **NFR-5 — Installer UX:** The installer wizard must follow standard Windows conventions (Next/Install/Finish flow) and require no technical knowledge from the end user.
- **NFR-6 — No Visible Terminal:** The packaged `.exe` must not display a console or command prompt window at any point during normal use.
- **NFR-7 — Single Executable:** The distributed artifact must be a single self-contained installer file (`VoxoraSetup.exe`); no separate dependency installation should be required from the user.

---

## Constraints

- Target OS: Windows only (Windows 10 / Windows 11).
- All TTS voices are predefined and bundled; no custom voice upload is supported in v1.
- Video processing output format is `.mp4`.
- The application is single-user and single-instance per machine session.
