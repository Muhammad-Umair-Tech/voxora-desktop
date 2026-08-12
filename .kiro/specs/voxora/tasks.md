# Voxora — Implementation Tasks

## Day 1: Project Setup & Core Infrastructure

- [DONE] **1.1** Initialize the project repository with the directory structure defined in the design doc (`backend/`, `frontend/`, `models/`, `assets/`, `landing/`).
- [DONE] **1.2** Scaffold the FastAPI backend: create `backend/main.py` with a basic health-check route (`GET /api/health`) and Uvicorn startup call.
- [DONE] **1.3** Scaffold the React + Vite frontend: run `npm create vite@latest frontend -- --template react`, install `tailwindcss`, `lucide-react`, `axios`, and `wavesurfer.js`.
- [DONE] **1.4** Configure Tailwind CSS in `frontend/tailwind.config.js` and `frontend/src/index.css`.
- [DONE] **1.5** Configure Vite in `frontend/vite.config.js` to output the build to `frontend/dist` and proxy `/api` calls to `localhost:8765` during development.
- [DONE] **1.6** Implement `backend/utils/port_finder.py`: function `find_free_port(start=8765, retries=20) -> int` using the `socket` library.
- [DONE] **1.7** Update `backend/main.py` to use `find_free_port()` on startup and mount the `frontend/dist` static files at `/`.
- [DONE] **1.8** Draft the initial `voxora.spec` PyInstaller file. Confirm that a basic `pyinstaller voxora.spec` run produces an `.exe` that starts the server and serves a placeholder React page.
- [DONE] **1.9** Add a `.gitignore` covering `__pycache__`, `*.pyc`, `node_modules`, `frontend/dist`, `dist/`, `build/`, and `%TEMP%/voxora/`.

---

## Day 2: Offline AI Integration (Piper TTS)

- [DONE] **2.1** Download the chosen 3–5 Piper TTS voice models (`.onnx` + `.onnx.json` config files) and place them in the `models/` directory. Document the selected voices and their identifiers in a `models/VOICES.md` file.
- [DONE] **2.2** Verify that the bundled `piper` binary (or `piper-tts` Python package) can be invoked via `subprocess.run` and produces a valid `.wav` file from stdin text.
- [DONE] **2.3** Implement `backend/services/tts_service.py`:
  - `get_model_path(voice_id: str) -> Path` — resolves the bundled `.onnx` path using `sys._MEIPASS` when frozen, or a relative path in dev mode.
  - `generate(text: str, voice_id: str) -> tuple[Path, float]` — runs the Piper subprocess, returns the output `.wav` path and duration.
- [DONE] **2.4** Implement the helper `get_wav_duration(path: Path) -> float` using Python's `wave` standard library.
- [DONE] **2.5** Define Pydantic schemas in `backend/models/schemas.py`: `GenerateAudioRequest`, `GenerateAudioResponse`.
- [DONE] **2.6** Implement `backend/routers/audio.py` with `POST /api/generate-audio`. Write output `.wav` files to `%TEMP%\voxora\audio\`.
- [DONE] **2.7** Register the audio router in `backend/main.py`.
- [DONE] **2.8** Test the endpoint manually with `curl` or Postman: send a sample text and voice ID, confirm a `.wav` is returned and playable.

---

## Day 3: Video Processing Engine

- [DONE] **3.1** Confirm `moviepy` and its dependency on `ffmpeg` are installed. Resolve the bundled `ffmpeg.exe` path using `sys._MEIPASS` and set `moviepy.config.FFMPEG_BINARY` at startup.
- [DONE] **3.2** Implement `backend/routers/video.py` — `POST /api/upload-video`:
  - Accept multipart `UploadFile`.
  - Validate file extension (`.mp4`, `.mkv`, `.mov`, `.avi`).
  - Save to `%TEMP%\voxora\video\`.
  - Read duration via `moviepy.VideoFileClip`.
  - Return `{ video_id, duration_seconds }`.
- [DONE] **3.3** Implement `backend/services/video_service.py` — `process(video_path, audio_path, start_time, replace_audio) -> Path`:
  - Load `VideoFileClip` and `AudioFileClip`.
  - Clamp `start_time` to `max(0, min(start_time, video.duration - audio.duration))`.
  - If `replace_audio`: set the audio clip at the clamped start time on a silent video.
  - If overlay: build a `CompositeAudioClip([original_audio, new_audio.set_start(start_time)])`.
  - Write output to `%TEMP%\voxora\output\<uuid>.mp4`.
  - Return output path.
- [DONE] **3.4** Implement `POST /api/process-video` route in `backend/routers/video.py` using the service above. Return `{ output_url }` pointing to the static file mount.
- [DONE] **3.5** Mount a `StaticFiles` route in `backend/main.py` at `/files` serving the Voxora temp directory.
- [DONE] **3.6** Implement `backend/routers/system.py` — `GET /api/shutdown`: send response then schedule `os.kill(os.getpid(), signal.SIGTERM)` via `asyncio.get_event_loop().call_later(0.5, ...)`.
- [DONE] **3.7** Test the full video pipeline: upload a video, run a generate-audio call, call process-video, and confirm the output `.mp4` plays correctly with the embedded audio.

---

## Day 4: React UI & Timeline Interface

- [DONE] **4.1** Build the root `App.jsx` layout: two screens (audio and video), header with app name and quit button. Wire up all top-level state variables.
- [DONE] **4.2** Build a controlled `<textarea>` with a drag-and-drop overlay. On `.txt` file drop, use `FileReader` to populate the textarea value.
- [ ] **4.3** Build `VoiceSelector.jsx`: render one card per voice (name, language tag). Highlight the selected voice. Accept `voices` array and `onSelect` prop.
- [ ] **4.4** Build `AudioPlayer.jsx`: initialize `WaveSurfer` on a `useRef` div. Accept a `src` URL prop; re-initialize when `src` changes. Include play/pause button using a Lucide icon.
- [ ] **4.5** Build `VideoUpload.jsx`: drag-and-drop zone that calls `POST /api/upload-video` on file drop. On success, render an HTML5 `<video>` preview. Store `video_id` and `duration` in parent state via callback.
- [ ] **4.6** Build `Timeline.jsx`: `<input type="range" min=0 max={maxStart} step=0.1>`. Display the value as `MM:SS`. Accept `videoDuration`, `audioDuration`, `value`, and `onChange` props. Disable the slider when either duration is null.
- [ ] **4.7** Build `EmbedControls.jsx`: toggle switch (Overlay / Replace), "Process Video" button. On click, call `POST /api/process-video`. Show a spinner (Lucide `Loader2`) during processing. On success, show a download link.
- [ ] **4.8** Build `QuitButton.jsx`: on click, call `GET /api/shutdown` then `window.close()`.
- [ ] **4.9** Wire all components into `App.jsx`. Verify the full UI renders without errors and all props flow correctly.
- [ ] **4.10** Apply Tailwind styling: dark theme base, consistent card/panel spacing, accessible color contrast on interactive elements.

---

## Day 5: End-to-End Local Integration

- [ ] **5.1** Implement the dynamic port injection: after `find_free_port()`, the Python startup script writes the port into `frontend/dist/index.html` by replacing a placeholder string `__VOXORA_PORT__` with the actual port number before Uvicorn starts.
- [ ] **5.2** Update `frontend/src/api/client.js` to read `window.__VOXORA_PORT__` and construct the `baseURL` accordingly (with relative URL fallback for dev mode).
- [ ] **5.3** Connect `TextInput` and `VoiceSelector` to the "Generate Audio" button in `App.jsx`. On click, call `POST /api/generate-audio`, update `generatedAudioUrl` and `audioDuration` state, and pass the URL to `AudioPlayer`.
- [ ] **5.4** Connect `VideoUpload` success callback to update `videoId` and `videoDuration` in `App.jsx` state.
- [ ] **5.5** Connect `Timeline` slider to `startTime` state; recompute `maxStart` whenever `videoDuration` or `audioDuration` changes.
- [ ] **5.6** Connect `EmbedControls` to call `POST /api/process-video` with all required fields from state. On success, update `outputUrl` and render download link.
- [ ] **5.7** Implement the `webbrowser.open` background thread in `backend/main.py`: start thread before `uvicorn.run` blocks, sleep 1.5s, then open browser.
- [ ] **5.8** Run a full end-to-end test in development mode: type text → pick voice → generate audio → upload video → set timestamp → pick mode → process → download output. Fix any integration issues.

---

## Day 6: Testing & Packaging

- [ ] **6.1** Write edge-case tests for `port_finder.py`: simulate occupied ports to confirm retry logic.
- [ ] **6.2** Write edge-case tests for `video_service.py`: confirm `start_time` clamping when the value exceeds `video_duration - audio_duration`.
- [ ] **6.3** Finalize `voxora.spec`:
  - Add all `datas` entries: `('frontend/dist', 'frontend/dist')`, `('models', 'models')`, `('ffmpeg.exe', '.')`.
  - Add `hiddenimports` for `moviepy`, `uvicorn`, `fastapi`, `piper`, and all discovered missing modules.
  - Set `console=False`, `icon='assets/voxora.ico'`.
- [ ] **6.4** Run `pyinstaller voxora.spec` and launch the resulting `.exe`. Verify:
  - No console window appears.
  - The browser opens automatically.
  - Audio generation works from the packaged binary.
  - Video processing completes successfully.
  - The Quit button closes the app cleanly with no lingering Python processes (check Task Manager).
- [ ] **6.5** Test the installer on a clean Windows machine (or VM) that has never had Python installed. Confirm all bundled dependencies are self-contained.
- [ ] **6.6** Fix any packaging issues found in 6.4–6.5 and re-run the build.

---

## Day 7: Deployment & Distribution

- [ ] **7.1** Create `assets/voxora.ico` — a 256×256 application icon in `.ico` format.
- [ ] **7.2** Write `installer.iss` (Inno Setup script):
  - Set `AppName=Voxora`, `AppVersion`, `DefaultDirName={autopf}\Voxora`.
  - Include desktop shortcut creation.
  - Include LICENSE page.
  - Register uninstaller in Windows Add/Remove Programs.
- [ ] **7.3** Compile the installer: run `iscc installer.iss`. Confirm `VoxoraSetup.exe` is generated and the wizard installs cleanly, creates a desktop shortcut, and the app launches correctly from the shortcut.
- [ ] **7.4** Tag a `v1.0.0` release on GitHub and upload `VoxoraSetup.exe` as a release asset. Copy the direct download URL of the asset.
- [ ] **7.5** Build the Vercel landing page in `landing/index.html`:
  - Hero section: "Voxora" name, tagline ("AI-native audio generation for your videos").
  - Features section: three feature cards (Offline TTS, Multi-track audio, Video embedding).
  - Download CTA button linking to the GitHub Release asset URL from 7.4.
- [ ] **7.6** Deploy the `landing/` directory to Vercel. Confirm the page loads, is mobile-responsive, and the download button correctly fetches `VoxoraSetup.exe`.
- [ ] **7.7** Perform a final smoke test of the full distribution chain: land on the Vercel page → click download → install → launch → use the app end-to-end → quit cleanly.

---

## AFTER UI REQUIREMENTS UPDATE

> From Day 4 onwards the UI requirements changed significantly. The tasks below reflect what was actually built, estimated from the final source code. All tasks are marked DONE.

---

## Day 4: UI Architecture & Audio Screen

- [DONE] **4.1** Decided on a **two-screen tabbed layout** (Audio / Video) instead of the original two-column single-page approach. Defined the navbar as the persistent shell housing the tab switcher, theme toggle, and quit button.
- [DONE] **4.2** Built `App.jsx` as the root shell: navbar with Voxora icon, segmented tab switch (Audio / Video) with a sliding CSS indicator, a light/dark theme toggle button (sun/moon icons), and a red pill-shaped Quit button with a confirmation dialog. Theme is stored in state and applied as `data-theme` on the root div. Shutdown state replaces the whole UI with a shutdown screen.
- [DONE] **4.3** Built the shutdown screen: shown when `isShutDown` is `true` after the quit flow; displays the Voxora icon, "Voxora Has Shut Down" heading, and a message to close the tab.
- [DONE] **4.4** Built `AudioScreen.jsx` as a fully self-contained component owning all its own state (script, voice, fileName, isDragging, isGenerating, genError, audioResult). Laid out as a single-column card, max-width 3xl, centred.
- [DONE] **4.5** Built the script textarea with a live character counter, drag-and-drop overlay (onDragOver / onDragLeave / onDrop), and a hidden `<input type="file">` triggered by an Import button. A Clear button resets script, filename, and audio result; it is disabled during generation.
- [DONE] **4.6** Built the voice selector as a 2×2 grid of cards (Alan, Sam, Bryce, Kathleen), each showing a decorative waveform bar group and the voice name. Selecting a card plays the corresponding preview `.wav` asset via the Web Audio API (`new Audio(file)`) and triggers a waveform bar pulse animation for ~900ms via a `setTimeout` ref.
- [DONE] **4.7** Built `AudioResultPanel.jsx`: initialises a WaveSurfer instance on a `useRef` div, reading waveform/progress/cursor colors from computed CSS variables so it respects the current theme. Exposes Play/Pause toggle, a live `HH:MM:SS` current/total timestamp display, and a Save (download) button. The WaveSurfer instance is destroyed and recreated when `src` or `currentTheme` changes.
- [DONE] **4.8** Wired the Generate button in `AudioScreen` to `POST /api/generate-audio`. On success, renders `AudioResultPanel` inline below the button. On error, shows an inline error box. A loading bar animation is shown while generating.
- [DONE] **4.9** Bundled four voice preview `.wav` files (`alan_voice.wav`, `sam_voice.wav`, `kathleen_voice.wav`, `bryce_voice.wav`) and `sample_video.mp4` as static Vite assets in `frontend/src/assets/`.

---

## Day 5: Video Screen

- [DONE] **5.1** Built `VideoScreen.jsx` as the state owner for all video-screen data. State includes `videoFile`, `videoId`, `videoSrc`, `fileName`, `videoDuration`, `startTime`, `selectedAudio`, `mode`, `isGenerating`, and `videoResult`. The component handles blob URL cleanup via a `useEffect` return.
- [DONE] **5.2** Built `VideoPlayerPanel.jsx`: renders a card with a `<video>` element previewing the loaded video. Header contains dynamic buttons — Upload + Load Sample when no video is loaded; Clear when a video is loaded. During processing, the video fades to 40% opacity and an absolute-positioned spinner overlay appears. The component also renders `AudioPlacementRange` below itself.
- [DONE] **5.3** Implemented the **Load Sample** button: fetches the bundled `sample_video.mp4` Vite asset via `fetch()`, converts the response to a `Blob`, wraps it in a `File`, and passes it through the same `onLoadVideo` handler as a regular upload.
- [DONE] **5.4** Built `AudioPlacementRange.jsx`: a custom drag-based timeline window. The component renders a track bar with a sliding coloured window whose width represents the audio duration as a proportion of the video duration, and whose left position represents `startTime`. Mouse drag is handled by attaching `mousemove`/`mouseup` listeners to `window` while dragging. The offset label displays `M:SS – M:SS`. If selected audio exceeds video duration, an error alert replaces the slider.
- [DONE] **5.5** Created `useAudioDuration.js` custom hook to probe audio duration, shared between `AudioPlacementRange` and `AddAudioButton` so both components always use the same duration value for the same track.
- [DONE] **5.6** Built `AudioLibraryPanel.jsx`: a fixed-height (380px) panel with a scrollable list. On mount, fetches `GET /api/audio-library`. Each item shows a music note icon (or checkmark if selected, or animated volume icon if playing). Clicking an item selects it and starts playback via `new Audio(url)`; clicking again toggles pause/play. A Refresh button re-fetches the list.
- [DONE] **5.7** Built `OverlayReplaceToggle.jsx`: two side-by-side buttons inside a single bordered container, controlled by a `mode` prop (`"overlay"` | `"replace"`). Default is `"replace"`. Active button is styled via a `data-active` CSS attribute.
- [DONE] **5.8** Built `AddAudioButton.jsx`: reads `videoId`, `videoDuration`, `startTime`, `selectedAudio`, and `mode` props. The `canAdd` flag requires all four to be valid and audio duration ≤ video duration. On click, calls `POST /api/process-video` with `{ video_id, audio_path, start_time, replace_audio }`. Shows a spinner during processing. On error, renders an inline error box.
- [DONE] **5.9** Built `VideoResultPanel.jsx`: appears below the video player after a successful process. Auto-scrolls into view via `scrollIntoView({ behavior: "smooth", block: "center" })` on mount. Renders an HTML5 `<video>` player with controls, a Play/Pause button, and a Download button that saves the output as `<original-name>-voxora.mp4`.
- [DONE] **5.10** Added `GET /api/audio-library` endpoint to `backend/routers/audio.py`, returning `list[AudioLibraryItem]` sorted by `modified_at` descending. Added `AudioLibraryItem` Pydantic schema to `schemas.py`.

---

## Day 6: Backend Refinement & Styling

- [DONE] **6.1** Implemented `backend/services/tempfile_service.py` with `cleanup_old_temp_files(max_age_hours=24)`. Called from `backend/main.py` at startup before Uvicorn binds. Errors on individual files are caught and printed without aborting.
- [DONE] **6.2** Tightened all Pydantic schemas with `Field(..., min_length=1)`, `gt=0`, `ge=0` validators and description strings for Swagger documentation.
- [DONE] **6.3** Implemented video upload streaming in 1 MB chunks (`while chunk := await file.read(1024 * 1024)`) to handle large files without memory pressure.
- [DONE] **6.4** Replaced the video processing endpoint's `audio_url` parameter with `audio_path` (absolute disk path) to avoid the server having to resolve a URL back to a file. Updated the frontend `AddAudioButton` to send `item.audio_path`.
- [DONE] **6.5** Built the full CSS theme system in `App.css` using CSS custom properties (`--ink`, `--primary`, `--surface`, etc.) scoped under `[data-theme="light"]` and `[data-theme="dark"]` selectors. Per-component `.css` files in `frontend/src/styles/` define component-specific tokens and animated states.
- [DONE] **6.6** Implemented the `vx-segment-switch` navbar tab control in CSS: a wrapper with a `::before` pseudo-element that translates horizontally based on `data-mode` to create a sliding box indicator.

---

## Day 7: Packaging Fixes & Distribution

- [DONE] **7.1** Fixed `backend/main.py` import ordering: moved stdout/stderr null-guard and `sys.path` insertion (pointing to `backend/`) to the top of the file, before any local module imports, to prevent silent crashes in the frozen exe with `console=False`.
- [DONE] **7.2** Fixed `frontend/dist` path resolution in `main.py`: uses `sys._MEIPASS` when `getattr(sys, 'frozen', False)` is true, and a relative `../frontend/dist` path in dev mode.
- [DONE] **7.3** Added `__init__.py` to `backend/`, `backend/utils/`, `backend/routers/`, `backend/services/`, and `backend/models/` so PyInstaller can discover them as packages during analysis.
- [DONE] **7.4** Finalised `voxora.spec`: added `pathex=['backend']` so local packages resolve correctly; added `hiddenimports` for all uvicorn internals, fastapi/starlette, pydantic, h11, moviepy, and local backend packages; added `excludes` for `torch`, `PySide6`, `scipy`, `pandas`, `numba`, `llvmlite`, `pyarrow`, and other heavy packages that were being pulled in from the global Python environment.
- [DONE] **7.5** Fixed ffmpeg bundling in `voxora.spec`: changed from copying `ffmpeg.exe` to the bundle root to copying the entire `tools/ffmpeg/` directory as `('tools/ffmpeg', 'tools/ffmpeg')`, matching the path that `video_service.configure_ffmpeg()` resolves at runtime.
- [DONE] **7.6** Fixed the `imageio` metadata crash: added `.dist-info` directory entries to `voxora.spec`'s `datas` for `imageio`, `imageio_ffmpeg`, `moviepy`, `proglog`, `decorator`, `numpy`, `pillow`, and `tqdm`, so `importlib.metadata.version()` calls during import succeed in the frozen environment.
- [DONE] **7.7** Updated the exe icon in `voxora.spec` to `assets/voxora_icon2.ico`.
- [DONE] **7.8** Confirmed the packaged `dist/Voxora/Voxora.exe` launches without a console window, opens the browser automatically after a 1.5s delay, and the full audio-generation and video-processing pipelines work from the bundled exe.
- [DONE] **7.9** Built the landing page as a React + Vite app in `landing/` using `lucide-react`. Deployed to Vercel with a download button linking to the GitHub Release asset.
