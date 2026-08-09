import os
import shutil
import time
from pathlib import Path
import tempfile

VOXORA_TEMP_DIR = Path(tempfile.gettempdir()) / "voxora"


def cleanup_old_temp_files(max_age_hours: int = 24) -> None:
    """
    Deletes files and directories inside the Voxora temp directory
    that were modified longer ago than `max_age_hours`.
    """
    if not VOXORA_TEMP_DIR.exists():
        return

    cutoff_time = time.time() - (max_age_hours * 3600)

    for entry in VOXORA_TEMP_DIR.iterdir():
        try:
            mtime = entry.stat().st_mtime
            if mtime < cutoff_time:
                if entry.is_file() or entry.is_symlink():
                    entry.unlink()
                elif entry.is_dir():
                    shutil.rmtree(entry)
        except Exception as e:
            # Handle potential file access errors gracefully
            print(f"Failed to cleanup temp item '{entry}': {e}")
