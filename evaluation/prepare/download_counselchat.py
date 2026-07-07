from pathlib import Path
import requests

OUTPUT_DIR = Path("evaluation/raw/counselchat")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

URL = (
    "https://raw.githubusercontent.com/"
    "nbertagnolli/counsel-chat/master/"
    "data/20200325_counsel_chat.csv"
)

output_file = OUTPUT_DIR / "counselchat.csv"

print("Downloading CounselChat...")

r = requests.get(URL, timeout=60)
r.raise_for_status()

output_file.write_bytes(r.content)

print(f"Saved to {output_file}")