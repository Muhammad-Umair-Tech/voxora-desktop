import uuid
import sys
import subprocess
import tempfile
import wave
import contextlib
from pathlib import Path


def get_piper_exe() -> Path:
    """Resolves absolute path to piper executable."""
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        base_path = Path(sys._MEIPASS)
    else:
        # Resolves project_root/tools/piper/piper.exe
        # __file__ = backend/services/tts_service.py
        base_path = Path(__file__).resolve().parent.parent.parent

    piper_exe = base_path / "tools" / "piper" / "piper.exe"

    if not piper_exe.exists():
        raise FileNotFoundError(f"Piper executable not found at {piper_exe}")

    return piper_exe


def get_model_path(voice_id: str) -> Path:
    """
    Resolves the path to the Piper .onnx model file for a given voice_id.
    Handles PyInstaller frozen environment (sys._MEIPASS) and development mode.
    """
    model_filename = f"{voice_id}.onnx"

    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        # PyInstaller bundle directory
        base_path = Path(sys._MEIPASS) / "models"
    else:
        # Development mode: relative path from project root or backend
        base_path = Path(__file__).resolve().parent.parent.parent / "models"

    model_path = base_path / model_filename

    if not model_path.exists():
        raise FileNotFoundError(
            f"Piper model for voice '{voice_id}' not found at {model_path}"
        )

    return model_path


def generate(
    text: str, voice_id: str, output_dir: Path | str | None = None
) -> tuple[Path, float]:
    """
    Executes the Piper TTS CLI subprocess to render input text into a WAV file.

    Args:
        text (str): The text to synthesize.
        voice_id (str): The model ID/name to use.
        output_dir (Path | str | None): Target directory for the generated audio.
                                        Defaults to %TEMP%/voxora/audio.

    Returns:
        tuple[Path, float]: Path to the generated WAV audio file and its duration in seconds.
    """
    model_path = get_model_path(voice_id)
    piper_exe = get_piper_exe()

    # Determine output directory and ensure it exists
    if output_dir is None:
        target_dir = Path(tempfile.gettempdir()) / "voxora" / "audio"
    else:
        target_dir = Path(output_dir)

    target_dir.mkdir(parents=True, exist_ok=True)

    # Create a unique filename inside target_dir
    filename = f"tts_{uuid.uuid4().hex}.wav"
    output_path = target_dir / filename

    # Build Piper command
    cmd = [
        str(piper_exe),
        "--model",
        str(model_path),
        "--output_file",
        str(output_path),
    ]

    try:
        # Pass text via stdin to Piper.
        # CREATE_NO_WINDOW prevents Windows from flashing a black console window
        # when spawning the Piper child process from a windowed (console=False) exe.
        subprocess.run(
            cmd,
            input=text,
            text=True,
            capture_output=True,
            check=True,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
    except subprocess.CalledProcessError as e:
        if output_path.exists():
            output_path.unlink()
        raise RuntimeError(f"Piper TTS generation failed: {e.stderr.strip()}") from e

    # Calculate audio duration in seconds using wave module
    try:
        with contextlib.closing(wave.open(str(output_path), "rb")) as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration = frames / float(rate)
    except Exception as e:
        if output_path.exists():
            output_path.unlink()
        raise RuntimeError(
            f"Failed to calculate audio duration for {output_path}: {e}"
        ) from e

    return output_path, duration


if __name__ == "__main__":
    generate(
        "I'm Kathleen. How can I help you?",
        "en_US-kathleen-low",
    )
