import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BASE_DIR / 'pdfs'
PDF_DIR.mkdir(exist_ok=True)

moved = []
for p in BASE_DIR.glob('trip_log_*.pdf'):
    dest = PDF_DIR / p.name
    shutil.move(str(p), str(dest))
    moved.append(p.name)

print('Moved PDFs:', moved)
