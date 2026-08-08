from pydantic import BaseModel, Field


class GenerateAudioRequest(BaseModel):
    text: str = Field(
        ..., min_length=1, description="Text content to be converted into speech."
    )
    voice_id: str = Field(
        ..., min_length=1, description="ID of the Piper voice model to use."
    )


# gt=0 ensures non-negative entries.
# description="..." helps in Swagger documentation.


class GenerateAudioResponse(BaseModel):
    audio_url: str = Field(
        ..., description="Relative or full URL path to the generated .wav file."
    )
    duration: float = Field(
        ..., gt=0, description="Duration of the generated audio in seconds."
    )


class UploadVideoResponse(BaseModel):
    video_id: str = Field(
        ..., min_length=1, description="Unique UUID string identifying the video file."
    )
    duration_seconds: float = Field(
        ..., gt=0, description="Total duration of the uploaded video in seconds."
    )


class ProcessVideoRequest(BaseModel):
    video_id: str = Field(
        ..., min_length=1, description="ID of the video to be processed."
    )
    audio_path: str = Field(
        ..., min_length=1, description="ID of the AI-generated audio to be processed."
    )
    start_time: float = Field(
        ...,
        gt=0,
        description="Video timestamp where the audio will be added/overlayed.",
    )
    replace_audio: bool = True


class ProcessVideoResponse(BaseModel):
    output_url: str
