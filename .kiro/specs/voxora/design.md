# Voxora — Design

## 1. Architecture Overview

Voxora follows a **local client–server architecture** where both the client and server run on the same Windows machine. The packaged `.exe` boots a FastAPI/Uvicorn server in-process and opens the React SPA in the user's default browser.

```
┌─────────────────────────────────────────────────────────┐
│                  VoxoraSetup.exe (installed)             │
│                                                         │
│  ┌──────────────────────┐   ┌───────────────────────┐  │
│  │  Python Entrypoint   │   │  React SPA (static)   │  │
│  │  (main.py)           │   │  served by FastAPI     │  │
│  │                      │   │  on /                  │  │
│  │  1. Find free port   │   └───────────────────────┘  │
│  │  2. Start Uvicorn    │                               │
│  │  3. Open browser     │   ┌───────────────────────┐  │
│  │                      │   │  FastAPI Routes        │  │
│  │  FastAPI app         │──▶│  /api/generate-audio   │  │
│  │  (backend/main.py)   │   │  /api/process-video    │  │
│  │                      │   │  /api/shutdown         │  │
│  └──────────────────────┘   └───────────────────────┘  │
│                                                         │
│  Bundled Assets: piper binary + .onnx models + ffmpeg  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
voxora/
├── backend/
│   ├── main.py               # FastAPI app + startup entrypoint
│   ├── routers/
│   │   ├── audio.py          # /api/generate-audio
│   │   ├── video.py          # /api/process-video, /api/upload-video
│   │   └── system.py         # /api/shutdown
│   ├── services/
│   │   ├── tts_service.py    # Piper TTS subprocess wrapper
│   │   └── video_service.py  # ffmpeg/moviepy processing logic
│   ├── models/
│   │   └── schemas.py        # Pydantic request/response models
│   └── utils/
│       └── port_finder.py    # Dynamic port detection
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TextInput.jsx       # Text editor + .txt dropzone
│   │   │   ├── VoiceSelector.jsx   # Voice picker cards
│   │   │   ├── AudioPlayer.jsx     # wavesurfer.js waveform player
│   │   │   ├── VideoUpload.jsx     # Video dropzone + HTML5 preview
│   │   │   ├── Timeline.jsx        # Range slider + timestamp display
│   │   │   ├── EmbedControls.jsx   # Overlay/Replace toggle + generate btn
│   │   │   └── QuitButton.jsx      # Calls /api/shutdown
│   │   ├── pages/
│   │   │   └── App.jsx             # Main single-page layout
│   │   ├── api/
│   │   │   └── client.js           # Axios instance with dynamic base URL
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── models/                   # Bundled Piper .onnx voice model files
│   ├── en_US-amy-medium.onnx
│   ├── en_US-amy-medium.onnx.json
│   └── ... (3–5 voices)
├── assets/
│   └── voxora.ico            # App icon
├── voxora.spec               # PyInstaller spec file
├── installer.iss             # Inno Setup script
└── landing/                  # Vercel static landing page
    ├── index.html
    └── assets/
```

---

## 3. Backend Design

### 3.1 Startup Sequence (`main.py`)

1. Call `find_free_port()` → returns an available port (starting search from 8765, avoiding well-known ports).
2. Write the chosen port to a shared in-memory variable accessible to the React build via an injected `window.__VOXORA_PORT__` or via a `/api/config` endpoint.
3. Start Uvicorn programmatically: `uvicorn.run(app, host="127.0.0.1", port=port)`.
4. On a background thread (started before `uvicorn.run` blocks), sleep 1.5s then call `webbrowser.open(f"http://127.0.0.1:{port}")`.

### 3.2 API Endpoints

#### `POST /api/generate-audio`
- **Request body:** `{ text: str, voice_id: str }`
- **Logic:** Calls `tts_service.generate(text, voice_id)` → runs the Piper binary as a subprocess, writing `.wav` output to a temp file in `%TEMP%/voxora/audio/`.
- **Response:** `{ audio_url: str, duration_seconds: float }`

#### `POST /api/upload-video`
- **Request:** multipart form with video file.
- **Logic:** Saves file to `%TEMP%/voxora/video/`, uses `moviepy.VideoFileClip` to read duration.
- **Response:** `{ video_id: str, duration_seconds: float }`

#### `POST /api/process-video`
- **Request body:** `{ video_id: str, audio_url: str, start_time: float, replace_audio: bool }`
- **Logic:**
  1. Load video via `VideoFileClip`.
  2. Load audio via `AudioFileClip`.
  3. Clamp: `start_time = min(start_time, video.duration - audio.duration)`.
  4. If `replace_audio`: strip original audio, set audio clip at `start_time`.
  5. If overlay: composite original audio with new audio clip at `start_time` using `CompositeAudioClip`.
  6. Write final `.mp4` to `%TEMP%/voxora/output/`.
- **Response:** `{ output_url: str }`

#### `GET /api/shutdown`
- **Logic:** Sets a shutdown flag, then calls `os.kill(os.getpid(), signal.SIGTERM)` (or uses a threading event to break out of the Uvicorn loop).
- **Response:** `{ status: "shutting_down" }` — response sent before process exits.

#### `GET /files/{path}`
- Static file mount for serving generated audio, uploaded video previews, and processed output files from the temp directory.

### 3.3 TTS Service (`tts_service.py`)

```python
def generate(text: str, voice_id: str) -> tuple[Path, float]:
    model_path = get_model_path(voice_id)   # resolves to bundled .onnx path
    output_path = get_temp_path("audio") / f"{uuid4()}.wav"
    subprocess.run(
        ["piper", "--model", str(model_path), "--output_file", str(output_path)],
        input=text.encode(),
        check=True
    )
    duration = get_wav_duration(output_path)
    return output_path, duration
```

### 3.4 Video Service (`video_service.py`)

- Uses `moviepy.editor` for clip manipulation.
- `ffmpeg` binary is resolved from the bundled path (set via `moviepy.config.FFMPEG_BINARY`).
- All intermediate files are written to `%TEMP%/voxora/` and cleaned up on app shutdown.

### 3.5 Pydantic Schemas (`schemas.py`)

```python
class GenerateAudioRequest(BaseModel):
    text: str
    voice_id: str

class ProcessVideoRequest(BaseModel):
    video_id: str
    audio_url: str
    start_time: float
    replace_audio: bool
```

---

## 4. Frontend Design

### 4.1 Dynamic Port Resolution

Because the port is determined at runtime, the React app reads the port from `window.__VOXORA_PORT__` injected into `index.html` by the Python startup script (via template substitution), or falls back to fetching `/api/config` from a relative URL since FastAPI also serves the static files.

The Axios instance in `client.js`:
```js
const BASE_URL = window.__VOXORA_PORT__
  ? `http://127.0.0.1:${window.__VOXORA_PORT__}`
  : '';  // relative — works because FastAPI serves the SPA

export const api = axios.create({ baseURL: BASE_URL });
```

### 4.2 Page Layout

The single-page app is organized in a two-column layout on wide screens and stacks vertically on narrow viewports:

```
┌─────────────────────────────────────────────────────┐
│  Voxora                               [Quit App]    │
├──────────────────────┬──────────────────────────────┤
│  LEFT PANEL          │  RIGHT PANEL                 │
│                      │                              │
│  [TextInput]         │  [VideoUpload / preview]     │
│  [VoiceSelector]     │  [Timeline slider]           │
│  [AudioPlayer]       │  [EmbedControls toggle]      │
│  [Generate Audio btn]│  [Process Video btn]         │
│                      │  [Download link]             │
└──────────────────────┴──────────────────────────────┘
```

### 4.3 Component Responsibilities

| Component | Responsibility |
|---|---|
| `TextInput` | Controlled textarea + drag-and-drop `.txt` handler. Reads `FileReader` API to populate state. |
| `VoiceSelector` | Renders 3–5 voice cards with name, language, and sample. Highlights active selection. |
| `AudioPlayer` | Mounts wavesurfer.js on a `<div>` ref. Accepts a blob URL or server URL. Exposes play/pause. |
| `VideoUpload` | Drag-and-drop zone; on drop, POSTs to `/api/upload-video`, then renders `<video>` preview. Stores returned `duration` and `video_id` in parent state. |
| `Timeline` | `<input type="range">` with `max = videoDuration - audioDuration`. Displays current value in `MM:SS`. |
| `EmbedControls` | Toggle (Overlay / Replace) + "Process Video" button. On click, calls `/api/process-video` and shows spinner then download link. |
| `QuitButton` | Calls `GET /api/shutdown` then closes the tab (`window.close()`). |

### 4.4 State Flow

```
App (root state)
├── text: string
├── selectedVoice: string
├── generatedAudioUrl: string | null
├── audioDuration: number | null
├── videoId: string | null
├── videoDuration: number | null
├── startTime: number (slider value)
├── replaceAudio: boolean
└── outputUrl: string | null
```

All API calls are centralized in the `api/client.js` module; components receive handlers as props from `App.jsx`.

---

## 5. Packaging Design

### 5.1 PyInstaller `.spec` File

Key configuration points:
- `datas`: includes `frontend/dist` → `frontend/dist`, `models/` → `models/`, `ffmpeg.exe` → `.`
- `hiddenimports`: `moviepy`, `piper`, `uvicorn`, `fastapi`, and all transitive dependencies.
- `console=False` to suppress the terminal window.
- `icon='assets/voxora.ico'`
- The entrypoint is `backend/main.py`.

### 5.2 Inno Setup Script (`installer.iss`)

- **AppName:** Voxora
- **AppVersion:** read from a `VERSION` file.
- **DefaultDirName:** `{autopf}\Voxora`
- **DefaultGroupName:** Voxora
- Creates a desktop shortcut pointing to `Voxora.exe`.
- Registers an uninstaller entry in Add/Remove Programs.
- Includes a LICENSE agreement page.

### 5.3 Build Pipeline (manual / CI)

```
1. npm run build          (in /frontend → outputs /frontend/dist)
2. pyinstaller voxora.spec
3. iscc installer.iss     (Inno Setup compiler)
4. Upload VoxoraSetup.exe → GitHub Release
```

---

## 6. Landing Page Design

- Single static HTML/CSS page hosted on Vercel.
- Sections: Hero (name + tagline), Features (3 bullet cards), Download CTA button.
- Download button `href` points to the GitHub Release asset URL.
- No JavaScript framework required — plain HTML + CSS or Tailwind CDN.

---

## 7. Error Handling

| Scenario | Handling |
|---|---|
| Port already in use | `port_finder.py` increments and retries up to 20 times |
| TTS subprocess fails | Return HTTP 500 with `{ error: "TTS generation failed", detail: stderr }` |
| Video upload too large | FastAPI `UploadFile` size check — return HTTP 413 |
| `start_time` out of bounds | Server-side clamp; no error, silently corrected |
| ffmpeg not found | Check bundled path on startup; raise fatal error with user-readable message before browser opens |
| Browser fails to open | Log warning; user can manually navigate to the printed URL (shown in a fallback tray or log) |

---

## 8. Temp File Management

- All working files are written to `%TEMP%\voxora\{session_id}\`.
- On `/api/shutdown`, the app recursively deletes the session temp directory.
- A startup cleanup pass deletes any leftover `%TEMP%\voxora\` directories older than 24 hours.
