from url_discovery import discover_urls

SOURCES = {

    "who":
        discover_urls(
            "https://www.who.int/health-topics/mental-health"
        ),

    "nimh":
        discover_urls(
            "https://www.nimh.nih.gov/health/topics"
        ),

    "nhs":
        discover_urls(
            "https://www.nhs.uk/mental-health/"
        ),

    "medlineplus":
        discover_urls(
            "https://medlineplus.gov/mentalhealth.html"
        ),
}   