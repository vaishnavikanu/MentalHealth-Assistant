def recall_at_k(

    retrieved,

    relevant,

    k,

):

    retrieved = retrieved[:k]

    return float(

        relevant in retrieved

    )


def mrr(

    retrieved,

    relevant,

):

    for idx, doc in enumerate(retrieved):

        if doc == relevant:

            return 1 / (idx + 1)

    return 0