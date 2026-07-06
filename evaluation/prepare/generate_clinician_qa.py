import json
import re
from pathlib import Path

from tqdm import tqdm

from src.generation.generator import get_generator

INPUT = Path("evaluation/data/clinician_candidates.json")
OUTPUT = Path("evaluation/data/clinician_qa.json")

PROMPT = """
You are an expert psychiatrist.

Below is a passage from an authoritative mental health guideline.

Generate EXACTLY ONE clinician-level question.

Rules:

1. The question must be answerable ONLY from this passage.
2. The question should test clinical knowledge.
3. Do NOT generate an answer.
4. Do NOT explain anything.

Return ONLY JSON.

{{
    "question":"..."
}}

PASSAGE

----------------

{context}

----------------
"""


def extract_reference_answer(text: str, max_sentences: int = 3):

    #
    # Split into sentences
    #
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())

    #
    # Remove very short sentences
    #
    sentences = [

        s.strip()

        for s in sentences

        if len(s.strip()) > 40

    ]

    #
    # Keep first few informative sentences
    #
    return " ".join(

        sentences[:max_sentences]

    )


def main():

    generator = get_generator("ollama")

    with open(INPUT, "r", encoding="utf-8") as f:

        chunks = json.load(f)

    dataset = []

    skipped = 0

    for sample in tqdm(chunks):

        prompt = PROMPT.format(

            context=sample["text"]

        )

        try:

            response = generator.generate(prompt)

            #
            # Sometimes Ollama adds markdown
            #
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

            qa = json.loads(response)

            answer = extract_reference_answer(

                sample["text"]

            )

            if len(answer) < 40:

                skipped += 1

                continue

            dataset.append(

                {

                    "id": str(len(dataset)),

                    "role": "clinician",

                    "question": qa["question"],

                    "answer": answer,

                    "evidence": sample["text"],

                    "document": sample["document"],

                    "chunk_id": sample["chunk_id"],

                }

            )

        except Exception:

            skipped += 1

            continue

    with open(

        OUTPUT,

        "w",

        encoding="utf-8",

    ) as f:

        json.dump(

            dataset,

            f,

            indent=2,

            ensure_ascii=False,

        )

    print("\n===========================")
    print(f"Generated : {len(dataset)}")
    print(f"Skipped   : {skipped}")
    print("===========================\n")


if __name__ == "__main__":

    main()