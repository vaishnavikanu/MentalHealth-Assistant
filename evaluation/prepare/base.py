from abc import ABC, abstractmethod
from pathlib import Path
import json


class BasePreprocessor(ABC):

    def __init__(self, output_dir="evaluation/data"):

        self.output_dir = Path(output_dir)

        self.output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

    @abstractmethod
    def prepare(self):
        pass

    def save(self, name, data):

        output_path = self.output_dir / f"{name}.json"

        with open(
            output_path,
            "w",
            encoding="utf-8",
        ) as f:

            json.dump(
                data,
                f,
                indent=2,
                ensure_ascii=False,
            )

        print(
            f"Saved {len(data)} samples to {output_path}"
        )