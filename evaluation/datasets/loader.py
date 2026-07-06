from evaluation.datasets.pubmedqa import PubMedQADataset
from evaluation.datasets.medqa import MedQADataset
from evaluation.datasets.counselchat import CounselChatDataset


def load_dataset(name):

    name = name.lower()

    if name == "pubmedqa":
        return PubMedQADataset()

    if name == "medqa":
        return MedQADataset()

    if name == "counselchat":
        return CounselChatDataset()

    raise ValueError(name)