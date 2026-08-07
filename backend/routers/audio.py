import tempfile
from pathlib import Path
from fastapi import APIRouter, HTTPException, status

from models.schemas import GenerateAudioRequest, GenerateAudioResponse
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

    # Return audio file relative path / URL string and calculated duration
    return GenerateAudioResponse(
        audio_url=str(wav_path),
        duration=duration,
    )
