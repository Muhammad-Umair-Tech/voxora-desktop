import tempfile
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from models.schemas import GenerateAudioRequest, GenerateAudioResponse, AudioLibraryItem
from services import tts_service

router = APIRouter(prefix="/api", tags=["Audio"])


def get_audio_output_dir() -> Path:
    """
    Returns Path to system temp directory under 'voxora/audio/'.
    On Windows, this resolves to %TEMP%\\voxora\\audio\\.
    """
    temp_dir = Path(tempfile.gettempdir()) / "voxora" / "audio"
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir


@router.post(
    "/generate-audio",
    response_model=GenerateAudioResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_audio(request: GenerateAudioRequest):
    """
    Generate a .wav audio file from provided text and voice_id using Piper TTS.
    """
    output_dir = get_audio_output_dir()

    try:
        # Generate the audio file using tts_service
        wav_path, duration = tts_service.generate(
            text=request.text,
            voice_id=request.voice_id,
            output_dir=output_dir,
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e

    # `wav_path` is an absolute filesystem path (e.g. .../voxora/audio/tts_xxx.wav).
    # The app mounts StaticFiles at "/files" -> "<temp>/voxora", so the file is
    # reachable over HTTP at "/files/audio/<filename>". Return that browser-usable
    # URL instead of the raw OS path so the frontend can play/download it.
    audio_url = f"/files/audio/{wav_path.name}"

    return GenerateAudioResponse(
        audio_url=audio_url,
        duration=duration,
    )


@router.get(
    "/audio-library",
    response_model=list[AudioLibraryItem],
)
async def list_audio_library():
    """
    Lists previously generated .wav files sitting in the temp audio folder,
    newest first, so the frontend can show them as an audio library.
    """
    output_dir = get_audio_output_dir()

    items = [
        AudioLibraryItem(
            name=wav_file.stem,
            audio_url=f"/files/audio/{wav_file.name}",
            path=str(wav_file),
            modified_at=wav_file.stat().st_mtime,
        )
        for wav_file in output_dir.glob("*.wav")
    ]

    items.sort(key=lambda item: item.modified_at, reverse=True)

    return items