import json
import re
from pathlib import Path
from typing import Dict, List


class EntityExtractor:

    def __init__(self):

        ontology_path = (
            Path(__file__)
            .resolve()
            .parents[2]
            / "resources"
            / "medical_entities.json"
        )

        aliases_path = (
            Path(__file__)
            .resolve()
            .parents[2]
            / "resources"
            / "aliases.json"
        )

        with open(
            aliases_path,
            "r",
            encoding="utf-8",
        ) as f:
            
            self.aliases = json.load(f)

        with open(
            ontology_path,
            "r",
            encoding="utf-8",
        ) as f:

            ontology = json.load(f)

        self.entities = {}

        for category, terms in ontology.items():

            for term in terms:

                self.entities[
                    term.lower()
                ] = category

        self.patterns = {}

        for entity in self.entities:

            self.patterns[entity] = re.compile(
                r"\b" + re.escape(entity) + r"\b",
                re.IGNORECASE,
            )

    def extract(
        self,
        text: str,
    ) -> List[Dict]:

        text = text.lower()

        found = []
        seen = set()

        for entity in sorted(
            self.entities.keys(),
            key=len,
            reverse=True,
        ):

            entity_type = self.entities[entity]

            if self.patterns[entity].search(text):
                canonical = self.aliases.get(
                    entity,
                    entity,
                )

                if canonical in seen:
                    continue

                seen.add(canonical)

                found.append(
                    {
                        "entity": canonical,
                        "type": entity_type,
                    }
                )

        return found