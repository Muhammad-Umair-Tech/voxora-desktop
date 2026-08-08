import os
import sys
from pathlib import Path
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip
import tempfile
import uuid


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


def process(
    video_path: Path | str,
    audio_path: Path | str,
    start_time: float,
    replace_audio: bool,
) -> Path:
    """
    Overlays or replaces audio in a video clip at a specified start time.

    Args:
        video_path (Path | str): The path to the original video file.
        audio_path (Path | str): The path to the generated audio file.
        start_time (float): The requested start time in the video in seconds.
        replace_audio (bool): If True, replaces the video's original audio.
                              If False, overlays the new audio over the original.

    Returns:
        Path: The file path to the newly rendered video.
    """
    # Load the video and audio clips
    video = VideoFileClip(str(video_path))
    audio = AudioFileClip(str(audio_path))

    # Clamp the newly generated audio
    clamped_start = max(0, min(start_time, video.duration - audio.duration))

    # Position the newly generated audio (we change the starting duration of the audio)
    new_audio = audio.with_start(clamped_start)

    # Determine the audio composition model
    if replace_audio:
        # Completely replace the video's original audio
        final_audio = new_audio
    else:
        # Keep the original audio and overlay the newly generated audio over it
        if video.audio is not None:
            final_audio = CompositeAudioClip([video.audio, new_audio])
        else:
            # Fallback if the original video has no audio track
            final_audio = new_audio

    # Apply the final audio track to the video
    final_video = video.with_audio(final_audio)

    # Prepare the output directory: %TEMP%\voxora\output\
    output_dir = Path(tempfile.gettempdir()) / "voxora" / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate the unique output filename
    output_filename = f"{uuid.uuid4().hex}.mp4"
    output_path = output_dir / output_filename

    # Write the output file utilizing the specified codecs
    final_video.write_videofile(
        str(output_path), codec="libx264", audio_codec="aac", logger=None
    )

    # Clean up and release file resources
    video.close()
    audio.close()
    final_video.close()

    return output_path
