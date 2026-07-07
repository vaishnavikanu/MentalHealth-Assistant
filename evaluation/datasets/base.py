from abc import ABC, abstractmethod


class BaseDataset(ABC):

    @abstractmethod
    def load(self):
        """
        Returns

        [
            {
                "id": "...",
                "question": "...",
                "answer": "...",
                "role": "...",
                "language": "en"
            }
        ]
        """
        pass