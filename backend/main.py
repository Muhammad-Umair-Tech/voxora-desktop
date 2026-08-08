import os
import sys
import io

# Fix PyInstaller console=False issue FIRST (sys.stdout and sys.stderr are None)
if sys.stdout is None:
    sys.stdout = io.StringIO()
if sys.stderr is None:
    sys.stderr = io.StringIO()

# Ensure the backend directory is in sys.path BEFORE any relative imports
# This must happen before importing from utils or any local packages
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from utils.port_finder import find_free_port
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers.audio import router as audio_router
from routers.video import router as video_router
from routers.system import router as system_router
from services.video_service import FFMPEG_EXE
from pathlib import Path
import tempfile

app = FastAPI(title="Voxora")
app.include_router(audio_router)
app.include_router(video_router)
app.include_router(system_router)


# Example API route
@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# Define the base temp directory for all Voxora files
voxora_temp_dir = Path(tempfile.gettempdir()) / "voxora"
voxora_temp_dir.mkdir(parents=True, exist_ok=True)

# Path to built frontend static files
# When frozen by PyInstaller, use sys._MEIPASS to find bundled assets
if getattr(sys, "frozen", False):
    # Running as compiled executable
    base_path = sys._MEIPASS
    dist_path = os.path.join(base_path, "frontend", "dist")
else:
    # Running in development mode
    dist_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")

# Mount the Voxora temp directory BEFORE the catch-all SPA route
app.mount("/files", StaticFiles(directory=str(voxora_temp_dir)), name="files")

# Mount static files AFTER API routes so API endpoints take priority

# We are mounting the JS and CSS files Vite has generated to the default
# API route, enabling SPA
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import threading
    import webbrowser
    import time

    port = find_free_port(start=8765, retries=20)

    url = f"http://127.0.0.1:{port}"

    # Open the browser in a background thread after the server has had time to bind
    def _open_browser():
        time.sleep(1.5)
        webbrowser.open(url)

    threading.Thread(target=_open_browser, daemon=True).start()

    # Passing an empty log_config dictionary disables Uvicorn's fileConfig and color formatting checks
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        reload=False,
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {},
            "handlers": {},
            "loggers": {},
        },
    )
