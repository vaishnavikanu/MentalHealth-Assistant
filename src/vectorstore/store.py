import faiss
import numpy as np
import pickle
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from loguru import logger

from src.utils.config import config
from src.chunking.chunker import Chunk


@dataclass
class VectorRecord:
    chunk_id: str
    parent_id: Optional[str]
    text: str
    metadata: dict
    embedding: np.ndarray


class FAISSVectorStore:
    def __init__(self, index_name: str, index_path: str = None, dimension: int = 384):
        self.index_name = index_name
        self.index_path = Path(index_path or config.get("vectorstore.index_path", "./indexes"))
        self.index_path.mkdir(parents=True, exist_ok=True)
        self.dimension = dimension
        self.index: Optional[faiss.Index] = None
        self.records: Dict[int, VectorRecord] = {}
        self._id_counter = 0
        self._load_or_create()

        if self.index is not None:
            assert self.index.d == self.dimension, \
                f"Loaded index dim {self.index.d} != expected {self.dimension}"

    def _get_index_file(self) -> Path:
        return self.index_path / f"{self.index_name}.index"

    def _get_metadata_file(self) -> Path:
        return self.index_path / f"{self.index_name}_metadata.pkl"

    def _get_mapping_file(self) -> Path:
        return self.index_path / f"{self.index_name}_mapping.json"

    def _load_or_create(self):
        index_file = self._get_index_file()
        metadata_file = self._get_metadata_file()

        if index_file.exists() and metadata_file.exists():
            logger.info(f"Loading existing index: {self.index_name}")
            self.index = faiss.read_index(str(index_file))
            with open(metadata_file, "rb") as f:
                self.records = pickle.load(f)
            self._id_counter = len(self.records)
            logger.info(f"Loaded {self._id_counter} vectors from {self.index_name}")
        else:
            logger.info(f"Creating new index: {self.index_name}")
            self.index = faiss.IndexFlatIP(self.dimension)
            self.records = {}
            self._id_counter = 0

    def add_chunks(self, chunks: List[Chunk], embeddings: np.ndarray):
        if len(chunks) != len(embeddings):
            raise ValueError("Number of chunks must match number of embeddings")

        logger.info(f"Adding {len(chunks)} chunks to {self.index_name}")

        for chunk, embedding in zip(chunks, embeddings):
            if embedding.shape[0] != self.dimension:
                raise ValueError(f"Embedding dimension {embedding.shape[0]} != index dimension {self.dimension}")

            record = VectorRecord(
                chunk_id=chunk.chunk_id,
                parent_id=chunk.parent_id,
                text=chunk.text,
                metadata=chunk.metadata,
                embedding=embedding,
            )
            self.index.add(embedding.reshape(1, -1))
            self.records[self._id_counter] = record
            self._id_counter += 1

        self._save()

    def search(self, query_embedding: np.ndarray, top_k: int = 10) -> List[Tuple[VectorRecord, float]]:
        if self.index.ntotal == 0:
            return []

        query_embedding = query_embedding.reshape(1, -1).astype(np.float32)
        scores, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx in self.records:
                results.append((self.records[idx], float(score)))

        return results

    def get_parent_chunks(self, parent_ids: List[str]) -> List[VectorRecord]:
        parents = []
        for record in self.records.values():
            if record.chunk_id in parent_ids and record.metadata.get("chunk_type") == "parent":
                parents.append(record)
        return parents

    def _save(self):
        index_file = self._get_index_file()
        metadata_file = self._get_metadata_file()

        faiss.write_index(self.index, str(index_file))
        with open(metadata_file, "wb") as f:
            pickle.dump(self.records, f)

        logger.info(f"Saved {self.index_name}: {self.index.ntotal} vectors")

    def get_stats(self) -> dict:
        return {
            "index_name": self.index_name,
            "total_vectors": self.index.ntotal,
            "dimension": self.dimension,
            "unique_parents": len(set(r.parent_id for r in self.records.values() if r.parent_id)),
        }


class VectorStoreManager:
    def __init__(self, index_path: str = None):
        self.index_path = Path(index_path or config.get("vectorstore.index_path", "./indexes"))
        self.stores: Dict[str, FAISSVectorStore] = {}
        
    def get_store(self, collection_name: str, dimension: int = None) -> FAISSVectorStore:
        if collection_name not in self.stores:
            # Explicit routing (NO string hacks)
            if dimension is not None:
                dim = dimension
            elif collection_name.startswith("clinician_") or "medcpt" in collection_name:
                dim = 768
            else:
                dim = 384

            self.stores[collection_name] = FAISSVectorStore(
                collection_name,
                str(self.index_path),
                dim
            )
        return self.stores[collection_name]

    def get_patient_stores(self) -> Tuple[FAISSVectorStore, FAISSVectorStore]:
        curated_sbert = self.get_store("curated_kb_sbert")
        return curated_sbert, None

    def get_clinician_stores(self) -> Tuple[FAISSVectorStore, FAISSVectorStore]:
        curated_medcpt = self.get_store("curated_kb_medcpt")
        return curated_medcpt, None

    def get_user_store(self, user_id: str) -> FAISSVectorStore:
        return self.get_store(f"user_{user_id}_private")

    def get_clinician_store(self, clinician_id: str) -> FAISSVectorStore:
        return self.get_store(f"clinician_{clinician_id}_private")

    def save_all(self):
        for store in self.stores.values():
            store._save()