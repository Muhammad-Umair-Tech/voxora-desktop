# -*- mode: python ; coding: utf-8 -*-

import os
import sys

block_cipher = None

# ---------------------------------------------------------------------------
# 1. Data files to bundle
#    Each tuple: (source_path_on_disk, destination_folder_inside _MEIPASS)
# ---------------------------------------------------------------------------
datas = [
    # React build output — main.py looks for sys._MEIPASS/frontend/dist
    ('frontend/dist', 'frontend/dist'),
    # Piper TTS voice models
    ('models', 'models'),
]

# Bundle ffmpeg.exe if it exists alongside the spec (i.e. tools/ffmpeg.exe or root)
for ffmpeg_candidate in ['ffmpeg.exe', 'tools/ffmpeg.exe']:
    if os.path.exists(ffmpeg_candidate):
        datas.append((ffmpeg_candidate, '.'))
        break

# ---------------------------------------------------------------------------
# 2. Hidden imports
#    PyInstaller's static analyser misses dynamically-loaded modules. List
#    every module that is imported at runtime but not visible via normal
#    import tracing.
# ---------------------------------------------------------------------------
hiddenimports = [
    # ---- local backend packages ----
    'utils',
    'utils.port_finder',
    'routers',
    'routers.audio',
    'routers.video',
    'routers.system',
    'services',
    'services.tts_service',
    'services.video_service',
    'models',
    'models.schemas',

    # ---- uvicorn internals (not auto-detected) ----
    'uvicorn',
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.loops.asyncio',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',

    # ---- fastapi / starlette ----
    'fastapi',
    'fastapi.staticfiles',
    'starlette',
    'starlette.staticfiles',
    'starlette.responses',
    'starlette.routing',

    # ---- pydantic ----
    'pydantic',
    'pydantic.deprecated.class_validators',
    'pydantic.deprecated.config',
    'pydantic.deprecated.decorator',
    'pydantic.deprecated.tools',

    # ---- h11 (used by uvicorn) ----
    'h11',
    'h11._connection',
    'h11._events',
    'h11._util',

    # ---- moviepy (video processing) ----
    'moviepy',
    'moviepy.editor',
    'moviepy.video.io.VideoFileClip',
    'moviepy.audio.io.AudioFileClip',

    # ---- stdlib modules sometimes missed ----
    'webbrowser',
    'threading',
    'socket',
    'wave',
    'email.mime.text',
    'email.mime.multipart',
    'logging.handlers',
]

# ---------------------------------------------------------------------------
# 3. Analysis — entrypoint is backend/main.py
#    pathex includes backend/ so that local `from utils.port_finder import …`
#    is resolved correctly during the analysis phase.
# ---------------------------------------------------------------------------
analysis = Analysis(
    ['backend/main.py'],
    pathex=[
        '.',
        'backend',          # lets PyInstaller resolve `utils`, `routers`, etc.
    ],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude heavy packages that are not used by Voxora to keep the build lean.
        # Remove any entry here if you actually depend on it.
        'torch',
        'torchvision',
        'torchaudio',
        'tensorflow',
        'PySide6',
        'PyQt5',
        'PyQt6',
        'tkinter',
        'scipy',
        'pandas',
        'numba',
        'llvmlite',
        'pyarrow',
        'IPython',
        'jupyter',
        'matplotlib',
        'sklearn',
        'sqlalchemy',
        'psycopg2',
        'zmq',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(analysis.pure, analysis.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    analysis.scripts,
    [],
    exclude_binaries=True,      # onedir build — keeps the .exe small
    name='Voxora',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,              # No black terminal window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/voxora.ico' if os.path.exists('assets/voxora.ico') else None,
)

# COLLECT creates dist/Voxora/ with Voxora.exe + _internal/
coll = COLLECT(
    exe,
    analysis.binaries,
    analysis.zipfiles,
    analysis.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='Voxora',
)

# ---------------------------------------------------------------------------
# Build command:
#   pyinstaller voxora.spec --noconfirm
# ---------------------------------------------------------------------------
