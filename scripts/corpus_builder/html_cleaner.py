from bs4 import BeautifulSoup


def clean_html(html):

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    for tag in soup(
        [
            "script",
            "style",
            "header",
            "footer",
            "nav",
            "noscript",
        ]
    ):
        tag.decompose()

    text = soup.get_text(
        separator="\n",
    )

    lines = [
        line.strip()
        for line in text.splitlines()
    ]

    lines = [
        line
        for line in lines
        if line
    ]

    return "\n".join(lines)