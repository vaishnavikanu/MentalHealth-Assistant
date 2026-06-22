import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from loguru import logger

from src.utils.config import config
from src.vectorstore.store import FAISSVectorStore, VectorRecord
from src.embeddings.embedder import get_embedder
from src.chunking.chunker import Chunk


@dataclass
class RetrievalResult:
    chunk: VectorRecord
    score: float
    source: str


class BM25Retriever:
    def __init__(self):
        self.corpus = []
        self.doc_ids = []
        self.bm25 = None

    def build_index(self, chunks: List[Chunk]):
        from rank_bm25 import BM25Okapi
        self.corpus = [chunk.text.split() for chunk in chunks]
        self.doc_ids = [chunk.chunk_id for chunk in chunks]
        self.bm25 = BM25Okapi(self.corpus)
        logger.info(f"BM25 index built with {len(chunks)} documents")

    def search(self, query: str, top_k: int = 10) -> List[Tuple[str, float]]:
        if self.bm25 is None:
            return []
        tokenized_query = query.split()
        scores = self.bm25.get_scores(tokenized_query)
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [(self.doc_ids[i], float(scores[i])) for i in top_indices if scores[i] > 0]


class DenseRetriever:
    def __init__(self, embedder_type: str):
        self.embedder = get_embedder(embedder_type)
        self.embedder_type = embedder_type

    def search(self, store: FAISSVectorStore, query: str, top_k: int = None) -> List[RetrievalResult]:
        top_k = top_k or config.get("retrieval.dense_top_k", 20)
        query_embedding = self.embedder.embed_query(query)
        results = store.search(query_embedding, top_k)
        return [
            RetrievalResult(chunk=record, score=score, source=f"dense_{self.embedder_type}")
            for record, score in results
        ]


class KnowledgeGraphExpander:
    def __init__(self):
        self.medical_terms = {
            "depression": ["MDD", "major depressive disorder", "melancholia", "dysthymia"],
            "anxiety": ["GAD", "generalized anxiety disorder", "panic disorder", "phobia"],
            "therapy": ["CBT", "cognitive behavioral therapy", "psychotherapy", "counseling"],
            "medication": ["SSRI", "SNRI", "antidepressant", "anxiolytic"],
            "symptom": ["insomnia", "fatigue", "concentration", "appetite", "mood"],
        }

    def expand_query(self, query: str) -> List[str]:
        expanded = [query]
        query_lower = query.lower()
        for term, synonyms in self.medical_terms.items():
            if term in query_lower:
                expanded.extend(synonyms)
        return expanded

    def expand_results(self, results: List[RetrievalResult], limit: int = None) -> List[RetrievalResult]:
        limit = limit or config.get("retrieval.kg_expansion_limit", 10)
        return results[:limit]


class PatientRetriever:
    def __init__(self, vector_store_manager):
        self.vector_store_manager = vector_store_manager
        self.dense_retriever = DenseRetriever("sbert")
        self.bm25_retriever = BM25Retriever()
        self._bm25_built = False

    def _build_bm25_if_needed(self, store: FAISSVectorStore):
        if not self._bm25_built and store.index.ntotal > 0:
            chunks = [
                Chunk(text=r.text, chunk_id=r.chunk_id, parent_id=r.parent_id, metadata=r.metadata)
                for r in store.records.values()
                if r.metadata.get("chunk_type") == "child"
            ]
            if chunks:
                self.bm25_retriever.build_index(chunks)
                self._bm25_built = True

    def retrieve(self, query: str, user_id: str, top_k: int = None) -> List[RetrievalResult]:
        top_k = top_k or config.get("retrieval.final_top_k", 5)
        logger.info(f"Patient retrieval for user {user_id}: {query}")

        curated_store = self.vector_store_manager.get_store("curated_kb_sbert")
        user_store = self.vector_store_manager.get_user_store(user_id)

        self._build_bm25_if_needed(curated_store)

        dense_results = self.dense_retriever.search(curated_store, query, top_k * 2)
        user_results = self.dense_retriever.search(user_store, query, top_k)

        sparse_results = []
        if self._bm25_built:
            bm25_hits = self.bm25_retriever.search(query, top_k * 2)
            for chunk_id, score in bm25_hits:
                for record in curated_store.records.values():
                    if record.chunk_id == chunk_id:
                        sparse_results.append(RetrievalResult(chunk=record, score=score, source="bm25"))
                        break

        fused_results = self._reciprocal_rank_fusion([dense_results, sparse_results, user_results])
        logger.info(f"Patient retrieval: {len(fused_results)} fused results")
        return fused_results[:top_k * 2]

    def _reciprocal_rank_fusion(self, result_lists: List[List[RetrievalResult]], k: int = None) -> List[RetrievalResult]:
        k = k or config.get("retrieval.rrf_k", 60)
        scores = {}
        for results in result_lists:
            for rank, result in enumerate(results):
                key = result.chunk.chunk_id
                if key not in scores:
                    scores[key] = {"score": 0.0, "result": result}
                scores[key]["score"] += 1.0 / (k + rank + 1)

        fused = sorted(scores.values(), key=lambda x: x["score"], reverse=True)
        return [item["result"] for item in fused]


class ClinicianRetriever:
    def __init__(self, vector_store_manager):
        self.vector_store_manager = vector_store_manager
        self.dense_retriever = DenseRetriever("medcpt")
        self.kg_expander = KnowledgeGraphExpander()

    def retrieve(self, query: str, clinician_id: str, top_k: int = None) -> List[RetrievalResult]:
        top_k = top_k or config.get("retrieval.final_top_k", 5)
        logger.info(f"Clinician retrieval for clinician {clinician_id}: {query}")

        curated_store = self.vector_store_manager.get_store("curated_kb_medcpt")
        clinician_store = self.vector_store_manager.get_clinician_store(clinician_id)

        expanded_queries = self.kg_expander.expand_query(query)

        all_results = []
        for eq in expanded_queries:
            dense_results = self.dense_retriever.search(curated_store, eq, top_k)
            all_results.extend(dense_results)

        clinician_results = self.dense_retriever.search(clinician_store, query, top_k)
        all_results.extend(clinician_results)

        unique_results = {}
        for r in all_results:
            key = r.chunk.chunk_id
            if key not in unique_results or r.score > unique_results[key].score:
                unique_results[key] = r

        expanded_results = self.kg_expander.expand_results(list(unique_results.values()))
        logger.info(f"Clinician retrieval: {len(expanded_results)} results after KG expansion")
        return expanded_results[:top_k * 2]