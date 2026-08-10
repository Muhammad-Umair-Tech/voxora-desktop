from fastapi import APIRouter, status, HTTPException, UploadFile, File
from pathlib import Path
import tempfile
import uuid
from moviepy import VideoFileClip
from models.schemas import (
    UploadVideoResponse,
    ProcessVideoRequest,
    ProcessVideoResponse,
)
from services import video_service

router = APIRouter(prefix="/api", tags=["Video"])

ALLOWED_EXTENSIONS = {".mp4", ".mkv", ".mov", ".avi"}


def get_video_output_dir() -> Path:
    """
    Returns Path to system temp directory under 'voxora/video/'.
    On Windows, this resolves to %TEMP%\\voxora\\video\\.
    """
    temp_dir = Path(tempfile.gettempdir()) / "voxora" / "video"
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir


@router.post(
    "/upload-video",
    response_model=UploadVideoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_video(file: UploadFile = File(...)):
    """
    Accepts video upload, validates format, saves to temp storage,
    and returns its assigned video_id and duration.
    """
    # Validate file extension
    file_extension = Path(file.filename or "").suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{file_extension}. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Prepare storage destination
    video_id = uuid.uuid4().hex
    output_dir = get_video_output_dir()
    saved_filename = f"{video_id}{file_extension}"
    saved_path = output_dir / saved_filename

    # Save uploaded videos to %TEMP%\voxora\video\
    try:
        with open(saved_path, "wb") as buffer:
            # await file.read(1024 * 1024) streams large video uploads in 1MB increments
            # so the server process doesn't run out of memory.
            while chunk := await file.read(1024 * 1024):  # Read in 1MB chunks
                buffer.write(chunk)
    except Exception as e:
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload video file: {str(e)}",
        ) from e

    # Read duration using MoviePy
    try:
        with VideoFileClip(str(saved_path)) as clip:
            duration_seconds = float(clip.duration)
    except Exception as e:
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Uploaded file could not be parsed as valid video entity: {str(e)}",
        ) from e

    return UploadVideoResponse(video_id=video_id, duration_seconds=duration_seconds)


@router.post(
    "/process-video",
    response_model=ProcessVideoResponse,
    status_code=status.HTTP_200_OK,
)
async def process_video(request: ProcessVideoRequest):
    """
    Adds generated audio into the uploaded video and returns a URL to the result.
    """
    # Resolve the uploaded video path
    video_dir = get_video_output_dir()

    # We use glob because the extension might be .mp4, .mkv, .mov, or .avi
    video_files = list(video_dir.glob(f"{request.video_id}.*"))
    if not video_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID '{request.video_id}' not found.",
        )
    video_path = video_files[0]

    # Verify the audio file exists
    audio_path = Path(request.audio_path)
    if not audio_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio file not found at '{request.audio_path}'.",
        )

    # Process the video using the synchronous video_service
    try:
        output_path = video_service.process(
            video_path=video_path,
            audio_path=audio_path,
            start_time=request.start_time,
            replace_audio=request.replace_audio,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video processing failed: {str(e)}",
        )

    # Return the URL pointing to the static file mount
    return ProcessVideoResponse(output_url=f"/files/output/{output_path.name}")
