import re
import string
from collections import Counter


def normalize(text):

    text = text.lower()

    text = "".join(

        c

        for c in text

        if c not in string.punctuation

    )

    return re.sub(

        r"\s+",

        " ",

        text,

    ).strip()


def token_f1(

    prediction,

    ground_truth,

):

    pred_tokens = normalize(prediction).split()

    gt_tokens = normalize(ground_truth).split()

    common = Counter(pred_tokens) & Counter(gt_tokens)

    overlap = sum(common.values())

    if overlap == 0:

        return 0.0

    precision = overlap / len(pred_tokens)

    recall = overlap / len(gt_tokens)

    return 2 * precision * recall / (

        precision + recall

    )