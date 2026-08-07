import os
import sys
from pathlib import Path


def configure_ffmpeg() -> Path:
    """
    Resolves the bundled ffmpeg.exe path and sets the appropriate environment
    variables so MoviePy can discover and execute it.
    """
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        # PyInstaller extraction directory
        base_path = Path(sys._MEIPASS)
    else:
        # Development mode (resolves relative to project root)
        # Adjust parent count depending on where this file is stored
        base_path = Path(__file__).resolve().parent.parent.parent

    ffmpeg_exe = base_path / "tools" / "ffmpeg" / "ffmpeg.exe"

    if not ffmpeg_exe.exists():
        raise FileNotFoundError(f"FFmpeg executable not found at: {ffmpeg_exe}")

    # Set environment variable so MoviePy / imageio_ffmpeg can find it automatically
    os.environ["IMAGEIO_FFMPEG_EXE"] = str(ffmpeg_exe)

    # Legacy MoviePy fallback compatibility (MoviePy v1.x)
    try:
        import moviepy.config as mp_config

        mp_config.FFMPEG_BINARY = str(ffmpeg_exe)
    except (ImportError, AttributeError):
        pass

    return ffmpeg_exe


# Call on module import or server startup
FFMPEG_EXE = configure_ffmpeg()
