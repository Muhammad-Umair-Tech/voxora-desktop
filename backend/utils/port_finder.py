import socket


def find_free_port(start: int = 8765, retries: int = 20) -> int:
    """
    Finds an available TCP port starting from `start`.

    Tries binding to `start`, incrementing the port number by 1 up to `retries` times.
    Returns the first available port integer.
    Raises RuntimeError if no free port is found within the retry range.
    """
    for port in range(start, start + retries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                # Attempt to bind to localhost on the candidate port
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                # Port is in use, continue to next candidate
                continue

    raise RuntimeError(
        f"Could not find a free port in range {start} to {start + retries - 1}"
    )
