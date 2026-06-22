from abc import ABC, abstractmethod
from typing import List, Optional
import torch
import numpy as np
from loguru import logger

from src.utils.config import config

_EMBEDDER_CACHE = {}

class BaseEmbedder(ABC):
    @abstractmethod
    def embed(self, texts: List[str]) -> np.ndarray:
        pass

    @abstractmethod
    def embed_query(self, query: str) -> np.ndarray:
        pass


class SBERTEmbedder(BaseEmbedder):
    def __init__(self, model_name: str = None, device: str = None, max_length: int = None):
        self.model_name = model_name or config.get("models.sbert.name", "sentence-transformers/all-MiniLM-L6-v2")
        self.device = device or config.get("models.sbert.device", "cpu")
        self.max_length = max_length or config.get("models.sbert.max_length", 512)
        self._model = None
        self._load_model()

    def _load_model(self):
        logger.info(f"Loading SBERT model: {self.model_name}")
        from sentence_transformers import SentenceTransformer
        self._model = SentenceTransformer(self.model_name, device=self.device)
        self._model.max_seq_length = self.max_length
        logger.info("SBERT model loaded successfully")

    def embed(self, texts: List[str]) -> np.ndarray:
        embeddings = self._model.encode(
            texts,
            batch_size=32,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
        return embeddings.astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        return self.embed([query])[0]


class MedCPTEmbedder(BaseEmbedder):
    def __init__(self, model_name: str = None, device: str = None, max_length: int = None):
        self.model_name = model_name or config.get("models.medcpt.name", "ncbi/MedCPT-Article-Encoder")
        self.device = device or config.get("models.medcpt.device", "cpu")
        self.max_length = max_length or config.get("models.medcpt.max_length", 512)
        self._model = None
        self._tokenizer = None
        self._load_model()

    def _load_model(self):
        logger.info(f"Loading MedCPT model: {self.model_name}")
        from transformers import AutoModel, AutoTokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self._model = AutoModel.from_pretrained(self.model_name).to(self.device)
        self._model.eval()
        logger.info("MedCPT model loaded successfully")

    def _mean_pooling(self, model_output, attention_mask):
        token_embeddings = model_output[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

    def embed(self, texts: List[str]) -> np.ndarray:
        all_embeddings = []
        batch_size = 8

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            encoded = self._tokenizer(
                batch_texts,
                padding=True,
                truncation=True,
                max_length=self.max_length,
                return_tensors="pt",
            ).to(self.device)

            with torch.no_grad():
                model_output = self._model(**encoded)
                embeddings = self._mean_pooling(model_output, encoded["attention_mask"])
                embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
                all_embeddings.append(embeddings.cpu().numpy())

        return np.vstack(all_embeddings).astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        return self.embed([query])[0]


def get_embedder(name: str):
    global _EMBEDDER_CACHE

    if name not in _EMBEDDER_CACHE:
        if name == "sbert":
            _EMBEDDER_CACHE[name] = SBERTEmbedder()
        elif name == "medcpt":
            _EMBEDDER_CACHE[name] = MedCPTEmbedder()
        else:
            raise ValueError(f"Unknown embedder: {name}")

    return _EMBEDDER_CACHE[name]