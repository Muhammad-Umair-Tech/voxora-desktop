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

- [ ] **4.1** Build the root `App.jsx` layout: two-column grid (left: text/audio panel; right: video panel), header with app name and quit button. Wire up all top-level state variables as defined in the design doc.
- [ ] **4.2** Build `TextInput.jsx`: controlled `<textarea>` with a drag-and-drop overlay. On `.txt` file drop, use `FileReader` to populate the textarea value.
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
