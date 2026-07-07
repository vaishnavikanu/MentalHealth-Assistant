from pathlib import Path

from downloader import Downloader
from html_cleaner import clean_html
from sources import SOURCES
from crawler import SiteCrawler


OUTPUT_DIR = Path("data/curated_kb")


def main():

    downloader = Downloader(
        OUTPUT_DIR,
    )

    total = 0

    for source, urls in SOURCES.items():

        source_dir = OUTPUT_DIR / source

        source_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        for i, url in enumerate(urls):

            print(f"Downloading {url}")

            html_path = downloader.download(
                url,
                f"{source}_{i}.html",
            )

            html = html_path.read_text(
                encoding="utf-8",
            )

            cleaned = clean_html(html)

            txt_path = source_dir / f"{source}_{i}.txt"

            txt_path.write_text(
                cleaned,
                encoding="utf-8",
            )

            html_path.unlink()

            total += 1

    print(f"\nDownloaded {total} documents.")


if __name__ == "__main__":
    main()