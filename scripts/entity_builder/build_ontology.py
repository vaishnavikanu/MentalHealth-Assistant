import json
from pathlib import Path

ONTOLOGY_DIR = Path("resources/ontology")
OUTPUT_FILE = Path("resources/medical_entities.json")

ontology = {}

for json_file in sorted(ONTOLOGY_DIR.glob("*.json")):

    category = json_file.stem

    print(f"Loading {category}")

    with open(
        json_file,
        encoding="utf-8",
    ) as f:

        terms = json.load(f)

    cleaned = sorted(
        {
            t.lower().strip()
            for t in terms
            if t.strip()
        }
    )

    ontology[category] = cleaned

OUTPUT_FILE.parent.mkdir(
    exist_ok=True
)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
) as f:

    json.dump(
        ontology,
        f,
        indent=4,
        ensure_ascii=False,
    )

total = sum(
    len(v)
    for v in ontology.values()
)

print()
print(f"Categories : {len(ontology)}")
print(f"Total Terms : {total}")
print(f"Saved -> {OUTPUT_FILE}")