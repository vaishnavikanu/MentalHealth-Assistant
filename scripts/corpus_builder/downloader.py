from pathlib import Path

import requests


class Downloader:

    def __init__(self, output_dir):

        self.output_dir = Path(output_dir)

        self.output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

    def download(self, url, filename):

        response = requests.get(
            url,
            timeout=30,
            headers={
                "User-Agent": "MentalHealthGraphRAG/1.0"
            },
        )

        response.raise_for_status()

        path = self.output_dir / filename

        path.write_text(
            response.text,
            encoding="utf-8",
        )

        return path