import torch
import numpy as np
from typing import List, Tuple
from loguru import logger

from src.utils.config import config
from src.retrieval.retriever import RetrievalResult
from src.vectorstore.store import VectorRecord


class CrossEncoderReranker:
    def __init__(self, model_name: str = None, device: str = None, max_length: int = None):
        self.model_name = model_name or config.get("models.reranker.name", "BAAI/bge-reranker-base")
        self.device = device or config.get("models.reranker.device", "cpu")
        self.max_length = max_length or config.get("models.reranker.max_length", 512)
        self._model = None
        self._tokenizer = None
        self._load_model()

    def _load_model(self):
        logger.info(f"Loading reranker model: {self.model_name}")
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self._model = AutoModelForSequenceClassification.from_pretrained(self.model_name).to(self.device)
        self._model.eval()
        logger.info("Reranker model loaded successfully")

    def rerank(self, query: str, results: List[RetrievalResult], top_k: int = None) -> List[RetrievalResult]:
        if not results:
            return []

        top_k = top_k or len(results)
        pairs = [[query, result.chunk.text] for result in results]

        inputs = self._tokenizer(
            pairs,
            padding=True,
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt",
        ).to(self.device)

        with torch.no_grad():
            scores = self._model(**inputs).logits.squeeze(-1).cpu().numpy()

        scored_results = list(zip(results, scores))
        scored_results.sort(key=lambda x: x[1], reverse=True)

        reranked = []
        for result, score in scored_results[:top_k]:
            result.score = float(score)
            reranked.append(result)

        logger.info(f"Reranked {len(results)} -> {len(reranked)} results")
        return reranked


class LightweightReranker:
    def __init__(self):
        self.embedder = None

    def _get_embedder(self):
        if self.embedder is None:
            from src.embeddings.embedder import get_embedder
            self.embedder = get_embedder("sbert")

    def rerank(self, query: str, results: List[RetrievalResult], top_k: int = None) -> List[RetrievalResult]:
        if not results:
            return []

        top_k = top_k or len(results)
        self._get_embedder()
        embedder = self.embedder
        query_emb = embedder.embed_query(query)

        scored = []
        for result in results:
            chunk_emb = embedder.embed([result.chunk.text])[0]
            similarity = float(np.dot(query_emb, chunk_emb))
            scored.append((result, similarity))

        scored.sort(key=lambda x: x[1], reverse=True)
        reranked = [r for r, _ in scored[:top_k]]
        for i, (r, s) in enumerate(scored[:top_k]):
            r.score = s

        logger.info(f"Lightweight reranked {len(results)} -> {len(reranked)} results")
        return reranked


def get_reranker(reranker_type: str = "cross_encoder"):
    if reranker_type == "cross_encoder":
        return CrossEncoderReranker()
    elif reranker_type == "lightweight":
        return LightweightReranker()
    else:
        raise ValueError(f"Unknown reranker type: {reranker_type}")