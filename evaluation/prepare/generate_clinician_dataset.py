from pathlib import Path
import json

from src.ingestion.curated_kb import CuratedKBIngestion
from src.chunking.chunker import ParentChildChunker


OUTPUT = Path("evaluation/data")
OUTPUT.mkdir(parents=True, exist_ok=True)


def main():

    ingestion = CuratedKBIngestion()
    documents = ingestion.ingest()

    chunker = ParentChildChunker()
    chunks = chunker.chunk_documents(documents)

    child_chunks = [
        c
        for c in chunks
        if c.metadata.get("chunk_type") == "child"
    ]

    print(f"Total child chunks : {len(child_chunks)}")

    #
    # Take one every four chunks
    #
    selected = child_chunks[::4]

    print(f"Selected chunks : {len(selected)}")

    dataset = []

    for chunk in selected:

        dataset.append(
            {
                "chunk_id": chunk.chunk_id,
                "document": chunk.metadata.get("source"),
                "text": chunk.text,
            }
        )

    with open(
        OUTPUT / "clinician_candidates.json",
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            dataset,
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(
        f"Saved {len(dataset)} candidate chunks."
    )


if __name__ == "__main__":
    main()