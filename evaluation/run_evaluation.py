import csv
import json
from pathlib import Path

from tqdm import tqdm

from evaluation.metrics.exact_match import exact_match
from evaluation.metrics.token_f1 import token_f1
from evaluation.metrics.rouge_l import rouge_l
from evaluation.config import EXPERIMENTS
from src.pipeline.rag_pipeline import RAGPipeline


DATA_DIR = Path("evaluation/data")
RESULT_DIR = Path("evaluation/results")

RESULT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def load_dataset(name):

    with open(
        DATA_DIR / f"{name}.json",
        "r",
        encoding="utf-8",
    ) as f:

        return json.load(f)


def evaluate(
    pipeline,
    dataset,
):

    results = []

    for sample in tqdm(dataset):

        prediction = pipeline.query(

            query=sample["question"],

            role=sample["role"],

            user_id="evaluation",

        )

        em = exact_match(

            prediction.response,

            sample["answer"],

        )

        f1 = token_f1(

            prediction.response,

            sample["answer"],

        )

        rouge = rouge_l(

            prediction.response,

            sample["answer"],

        )

        results.append(

            {
                
                "experiment": experiment,

                "id": sample["id"],

                "role": sample["role"],

                "question": sample["question"],

                "ground_truth": sample["answer"],

                "prediction": prediction.response,

                "em": em,

                "f1": f1,

                "rouge_l": rouge,

                "latency_ms": prediction.latency_ms,


            }

        )

    return results


def save_predictions(results):

    output = RESULT_DIR / f"{experiment}_predictions.csv"

    with open(

        output,

        "w",

        newline="",

        encoding="utf-8",

    ) as f:

        writer = csv.DictWriter(

            f,

            fieldnames=results[0].keys(),

        )

        writer.writeheader()

        writer.writerows(results)

    print(f"Saved predictions -> {output}")


def save_summary(results):

    summary = {

        "exact_match":

            sum(r["em"] for r in results)

            / len(results),

        "token_f1":

            sum(r["f1"] for r in results)

            / len(results),

        "rouge_l":

            sum(r["rouge_l"] for r in results)

            / len(results),

        "latency_ms":

            sum(r["latency_ms"] for r in results)

            / len(results),

    }

    with open(

        RESULT_DIR / f"{experiment}_metrics.json",

        "w",

        encoding="utf-8",

    ) as f:

        json.dump(

            summary,

            f,

            indent=4,

        )

    print()

    print(summary)

    print()


def main():

    experiment = "full"

    settings = EXPERIMENTS[experiment]

    pipeline = RAGPipeline()

    pipeline.initialize()

    #
    # Change this when switching datasets
    #
    dataset_name = "counselchat"

    dataset = load_dataset(

        dataset_name

    )

    results = evaluate(

        pipeline,

        dataset,

    )

    save_predictions(

        results

    )

    save_summary(

        results

    )


if __name__ == "__main__":

    main()