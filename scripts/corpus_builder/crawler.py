from collections import deque
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


MENTAL_HEALTH_KEYWORDS = [

    "mental",
    "depression",
    "anxiety",
    "stress",
    "suicide",
    "therapy",
    "psychology",
    "bipolar",
    "ptsd",
    "trauma",
    "sleep",
    "wellbeing",
    "well-being",
    "panic",
    "ocd",
    "adhd",
]


class SiteCrawler:

    def __init__(

        self,

        domain,

        max_pages=50,

    ):

        self.domain = domain

        self.max_pages = max_pages

        self.visited = set()

    def is_valid(self, url):

        parsed = urlparse(url)

        if self.domain not in parsed.netloc:

            return False

        lower = url.lower()

        return any(

            keyword in lower

            for keyword in MENTAL_HEALTH_KEYWORDS

        )

    def crawl(self, seed):

        queue = deque([seed])

        pages = []

        while queue and len(pages) < self.max_pages:

            url = queue.popleft()

            if url in self.visited:

                continue

            self.visited.add(url)

            try:

                response = requests.get(

                    url,

                    timeout=20,

                    headers={

                        "User-Agent":

                        "MentalHealthGraphRAG"

                    }

                )

                if response.status_code != 200:

                    continue

                pages.append(

                    (

                        url,

                        response.text,

                    )

                )

                soup = BeautifulSoup(

                    response.text,

                    "html.parser",

                )

                for link in soup.find_all("a"):

                    href = link.get("href")

                    if not href:

                        continue

                    full = urljoin(url, href)

                    if self.is_valid(full):

                        queue.append(full)

            except Exception:

                continue

        return pages