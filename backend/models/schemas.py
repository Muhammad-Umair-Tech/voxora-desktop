from pydantic import BaseModel, Field


class GenerateAudioRequest(BaseModel):
    text: str = Field(
        ..., min_length=1, description="Text content to be converted into speech."
    )
    voice_id: str = Field(
        ..., min_length=1, description="ID of the Piper voice model to use."
    )


class GenerateAudioResponse(BaseModel):
    audio_url: str = Field(
        ..., description="Relative or full URL path to the generated .wav file."
    )
    duration: float = Field(
        ..., gt=0, description="Duration of the generated audio in seconds."
    )
