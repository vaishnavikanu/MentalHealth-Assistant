from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

MENTAL_HEALTH_KEYWORDS = [
    "mental",
    "depression",
    "anxiety",
    "stress",
    "therapy",
    "ptsd",
    "trauma",
    "psychology",
    "bipolar",
    "sleep",
    "suicide",
    "panic",
    "ocd",
    "adhd",
    "wellbeing",
    "well-being",
]


def discover_urls(seed_url):

    print(f"Discovering links from {seed_url}")

    response = requests.get(
        seed_url,
        timeout=20,
        headers={
            "User-Agent": "MentalHealthGraphRAG"
        },
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    base = urlparse(seed_url).netloc

    urls = set()

    for a in soup.find_all("a"):

        href = a.get("href")

        if not href:
            continue

        full = urljoin(seed_url, href)

        parsed = urlparse(full)

        if parsed.netloc != base:
            continue

        lower = full.lower()

        if any(
            keyword in lower
            for keyword in MENTAL_HEALTH_KEYWORDS
        ):
            urls.add(full)

    return sorted(urls)