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

---

## AFTER UI REQUIREMENTS UPDATE

> The following requirements reflect the application as actually built. They supersede or extend the original requirements above where differences exist.

### UI Architecture Change

The originally planned single-page two-column layout was replaced with a **two-screen tabbed layout**. The navbar contains a segmented tab control that switches between an **Audio screen** and a **Video screen**. This is a fundamental structural change from the original design.

### Updated REQ-1: Text Input & Script Editor (Audio Screen)

- **REQ-1.1** *(unchanged)* The application accepts `.txt` file uploads via drag-and-drop.
- **REQ-1.2** *(unchanged)* Users may type or paste text directly into the script textarea.
- **REQ-1.3** *(unchanged)* Dropped `.txt` file content populates the textarea for review before generation.
- **REQ-1.4** *(unchanged)* The generate button is disabled when the script is empty.
- **REQ-1.5** *(new)* An **Import** button opens a file picker as an alternative to drag-and-drop.
- **REQ-1.6** *(new)* A **Clear** button resets the script, filename, and any audio result simultaneously. It is disabled while generation is in progress.
- **REQ-1.7** *(new)* A character count is displayed live next to the script label.

### Updated REQ-2: Voice Selection & Audio Generation (Audio Screen)

- **REQ-2.1** *(updated)* Exactly **four** predefined voices are available: Alan (en_GB), Sam (en_GB), Bryce (en_US), Kathleen (en_US).
- **REQ-2.2** *(unchanged)* All models are bundled locally as `.onnx` files and work fully offline.
- **REQ-2.3** *(updated)* One voice is selected per generation run (not multi-track per session). Multi-track composition is achieved by generating multiple audio files and combining them in the Video screen via the Audio Library.
- **REQ-2.4** *(unchanged)* The backend exposes `POST /api/generate-audio` returning `{ audio_url, duration }`.
- **REQ-2.5** *(updated)* The generated audio is displayed in an inline **AudioResultPanel** below the generate button, featuring a wavesurfer.js waveform, a Play/Pause button, a Save (download) button, and a live timestamp display (`HH:MM:SS` current / total).
- **REQ-2.6** *(new)* Clicking a voice card **plays a short preview sample** of that voice (`alan_voice.wav`, `sam_voice.wav`, etc. bundled as frontend assets) and triggers a brief waveform bar animation on the card.
- **REQ-2.7** *(new)* The backend exposes `GET /api/audio-library` which lists all previously generated `.wav` files from the session temp directory, sorted newest-first, for use in the Video screen.

### Updated REQ-3: Video Upload & Preview (Video Screen)

- **REQ-3.1** *(updated)* Video is uploaded via a **button click** (file picker) rather than drag-and-drop. Accepted formats: `.mp4`, `.mkv`, `.mov`, `.avi`, and any `video/*` MIME type.
- **REQ-3.2** *(unchanged)* The uploaded video is previewed in an HTML5 `<video>` player.
- **REQ-3.3** *(unchanged)* The backend saves the video to `%TEMP%\voxora\video\` and returns `{ video_id, duration_seconds }`.
- **REQ-3.4** *(new)* A **Load Sample** button fetches a bundled `sample_video.mp4` asset and loads it as if the user had uploaded a file, enabling testing without having a video file on hand.
- **REQ-3.5** *(new)* A **Clear** button removes the loaded video and resets all video-screen state. It is disabled while video processing is in progress.
- **REQ-3.6** *(new)* During video processing, the video player displays an overlay with a spinner and "Processing Video..." label, and all video controls are disabled.

### Updated REQ-4: Audio Placement (Video Screen)

- **REQ-4.1** *(updated)* The timeline control is a custom **drag-and-drop placement range** visualised as a sliding window on a track bar, not a standard `<input type="range">`.
- **REQ-4.2** *(unchanged)* The window's maximum left position is clamped to `video_duration - audio_duration`.
- **REQ-4.3** *(updated)* The current offset is displayed as a range: `Offset: M:SS – M:SS` (start to start + audio duration).
- **REQ-4.4** *(new)* If the selected audio is longer than the video, the placement range is replaced with an inline error message and the Add button is disabled.
- **REQ-4.5** *(new)* If no audio is selected from the library, the placement range shows a descriptive prompt instead of the slider.

### Updated REQ-5: Audio Embedding Mode (Video Screen)

- **REQ-5.1** *(updated)* The mode selector is a two-button **segmented toggle** (Overlay / Replace) styled as a single bordered control, not a simple toggle switch. Default mode is **Replace**.
- **REQ-5.2** *(unchanged)* The mode is passed as `replace_audio: bool` to the processing endpoint.

### Updated REQ-6: Video Processing & Export (Video Screen)

- **REQ-6.1** *(updated)* The `POST /api/process-video` endpoint now accepts `audio_path` (absolute local disk path) instead of `audio_url`, since the server processes files on disk.
- **REQ-6.2** *(unchanged)* The pipeline uses `moviepy` with the bundled `ffmpeg` binary.
- **REQ-6.3** *(unchanged)* `start_time` is server-side clamped to `max(0, video_duration - audio_duration)`.
- **REQ-6.4** *(updated)* The output video is displayed in a **VideoResultPanel** that auto-scrolls into view. It includes an HTML5 video player, a Play/Pause button, and a **Download** button that saves the file as `<original-name>-voxora.mp4`.
- **REQ-6.5** *(updated)* The **Add** button (labeled "Add" with a `+` icon) is the primary action. It is disabled unless a video is uploaded, an audio track is selected from the library, and the audio is not longer than the video.

### REQ-7: Audio Library (Video Screen — new)

- **REQ-7.1** The Video screen includes a persistent **Audio Library** panel listing all `.wav` files generated during the session.
- **REQ-7.2** Clicking a library item selects it for use in the placement/add workflow and begins playing it inline.
- **REQ-7.3** Clicking a currently playing item toggles play/pause.
- **REQ-7.4** A **Refresh** button re-fetches the library from the backend.
- **REQ-7.5** If no audio has been generated yet, a prompt directs the user to the Audio tab.

### Updated REQ-8: Application Lifecycle & Navigation

- **REQ-8.1** *(updated)* The navbar contains a **segmented tab switch** (Audio / Video) with a sliding indicator animation to switch between screens.
- **REQ-8.2** *(new)* The navbar contains a **light/dark theme toggle** (sun/moon icon) that applies a `data-theme` attribute to the root element, switching the entire CSS variable palette.
- **REQ-8.3** *(updated)* The **Quit** button is a red pill-shaped button in the top-right of the navbar with a `LogOut` icon. It prompts for confirmation before calling `/api/shutdown`.
- **REQ-8.4** *(new)* After shutdown is confirmed, the app replaces the entire UI with a **shutdown screen** showing the Voxora icon, "Voxora Has Shut Down", and a message to close the tab.

### Updated REQ-9: Packaging & Distribution

- **REQ-9.1** *(updated)* The app icon is `assets/voxora_icon2.ico`. The same icon is used as a `.png` in the React UI (`voxora_icon2.png`).
- **REQ-9.2** The piper binary is bundled under `tools/piper/piper.exe`; ffmpeg is bundled under `tools/ffmpeg/ffmpeg.exe`. Both are included in the PyInstaller `datas` with their directory structure preserved.
- **REQ-9.3** Package metadata (`.dist-info` folders) for `imageio`, `imageio_ffmpeg`, `moviepy`, `proglog`, `decorator`, `numpy`, `pillow`, and `tqdm` are explicitly bundled to satisfy `importlib.metadata.version()` calls at runtime.
- **REQ-9.4** *(new)* The landing page is a **React + Vite application** (not plain HTML), located in `landing/`, and uses `lucide-react`. It is deployed independently to Vercel.

### New Non-Functional Requirements

- **NFR-8 — Temp File Cleanup:** A `tempfile_service.py` module runs a startup cleanup pass deleting Voxora temp files older than 24 hours. The cleanup is non-blocking and suppresses individual file errors.
- **NFR-9 — Audio Duration Hook:** A shared `useAudioDuration.js` React hook probes audio duration either from a `duration` property on the item or via a throwaway `<audio>` element's `loadedmetadata` event. This ensures `AudioPlacementRange` and `AddAudioButton` always agree on the same duration value.
- **NFR-10 — Theme System:** The UI uses a CSS custom-property theme system with `data-theme="light"` and `data-theme="dark"` on the root element. The wavesurfer.js waveform colors are read from computed CSS variables so they update correctly on theme change.
- **NFR-11 — Per-Component CSS:** Each major component has a dedicated `.css` file in `frontend/src/styles/` rather than relying entirely on Tailwind utility classes for complex or animated styles.
