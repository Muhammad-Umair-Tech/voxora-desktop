import os
import signal
import asyncio
from fastapi import APIRouter, status

router = APIRouter(prefix="/api", tags=["System"])


@router.get(
    "/shutdown",
    status_code=status.HTTP_200_OK,
)
async def shutdown():
    """
    Schedules the server to shut down shortly after returning the response.
    """
    # Retrieve the active event loop
    loop = asyncio.get_event_loop()

    # Schedule the termination signal 0.5 seconds in the future
    # call_later passes subsequent arguments directly to the callback function
    loop.call_later(0.5, os.kill, os.getpid(), signal.SIGTERM)

    return {"detail": "Server shutdown initiated."}
