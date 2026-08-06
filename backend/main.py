import os
import sys
import io
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from utils.port_finder import find_free_port

# Ensure the root directory (parent of backend/) is in sys.path when running as frozen .exe
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Fix PyInstaller console=False issue (sys.stdout and sys.stderr are None)
if sys.stdout is None:
    sys.stdout = io.StringIO()
if sys.stderr is None:
    sys.stderr = io.StringIO()

app = FastAPI()


# Example API route
@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# Path to built frontend static files
dist_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")

# Mount static files AFTER API routes so API endpoints take priority

# We are mounting the JS and CSS files Vite has generated to the default
# API route, enabling SPA
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    port = find_free_port(start=8765, retries=20)
    print(f"Starting server on http://127.0.0.1:{port}")

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
