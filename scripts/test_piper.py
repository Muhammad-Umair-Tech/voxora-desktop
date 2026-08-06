import subprocess
import wave
from pathlib import Path


def verify_piper_tts():
    # 1. Paths (Update these relative paths to match your actual files)
    piper_exe = Path("tools/piper/piper.exe")
    model_path = Path("models/en_US-bryce-medium.onnx")
    output_wav = Path("test_output.wav")

    test_text = "Hello! Voxora offline speech generation is working correctly."

    # 2. Verify model file exists
    if not model_path.exists():
        print(f"[ERROR] Model file not found at: {model_path.resolve()}")
        return

    # 3. Construct command
    # Piper CLI usage: echo "text" | piper --model model.onnx --output_file output.wav
    cmd = [str(piper_exe), "--model", str(model_path), "--output_file", str(output_wav)]

    print(f"Running command: {' '.join(cmd)}")

    try:
        # 4. Invoke via subprocess.run feeding text to stdin
        result = subprocess.run(
            cmd, input=test_text.encode("utf-8"), capture_output=True, check=True
        )
        print("[SUCCESS] Subprocess executed without errors.")

    except FileNotFoundError:
        print(f"[ERROR] Could not find the executable: {piper_exe}. Check your path.")
        return
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Piper execution failed with code {e.returncode}:")
        print(e.stderr.decode("utf-8", errors="ignore"))
        return

    # 5. Verify that .wav file was generated and is valid
    if output_wav.exists() and output_wav.stat().st_size > 0:
        try:
            with wave.open(str(output_wav), "rb") as wave_file:
                frames = wave_file.getnframes()
                rate = wave_file.getframerate()
                duration = frames / float(rate)
                channels = wave_file.getnchannels()

            print(f"[SUCCESS] Created valid .wav file!")
            print(f" - Path: {output_wav.resolve()}")
            print(f" - Duration: {duration:.2f} seconds")
            print(f" - Sample Rate: {rate} Hz")
            print(f" - Channels: {channels}")

        except wave.Error as e:
            print(f"[ERROR] File was created but is not a valid WAV file: {e}")
    else:
        print("[ERROR] Output WAV file was not created or is 0 bytes.")


if __name__ == "__main__":
    verify_piper_tts()
