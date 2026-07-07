import re
import string


def normalize(text: str) -> str:

    text = text.lower()

    text = "".join(
        c for c in text
        if c not in string.punctuation
    )

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def exact_match(
    prediction: str,
    ground_truth: str,
) -> float:

    return float(

        normalize(prediction)

        ==

        normalize(ground_truth)

    )