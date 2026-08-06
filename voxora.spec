# -*- mode: python ; coding: utf-8 -*-

import os
import sys

block_cipher = None

# 1. Static assets & data files
datas = [
    ('frontend/dist', 'frontend/dist'),
    ('models', 'models'),
]

if os.path.exists('ffmpeg.exe'):
    datas.append(('ffmpeg.exe', '.'))

# 2. Hidden imports for dynamic/lazy loads
hiddenimports = [
    'uvicorn',
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    'fastapi',
    'starlette',
    'pydantic',
    'moviepy',
]

analysis = Analysis(
    ['backend/main.py'],
    pathex=['.'],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
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
    exclude_binaries=True,  # Set to True for onedir build
    name='Voxora',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,          # Suppresses terminal window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/voxora.ico' if os.path.exists('assets/voxora.ico') else None,
)

# 3. COLLECT creates the onedir folder structure under dist/Voxora/
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