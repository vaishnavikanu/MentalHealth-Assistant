from rouge_score import rouge_scorer


scorer = rouge_scorer.RougeScorer(

    ["rougeL"],

    use_stemmer=True,

)


def rouge_l(

    prediction,

    ground_truth,

):

    return scorer.score(

        ground_truth,

        prediction,

    )["rougeL"].fmeasure