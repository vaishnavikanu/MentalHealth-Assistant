import time
from dataclasses import dataclass
from typing import List, Optional
from loguru import logger

from src.utils.config import config
from src.vectorstore.store import VectorStoreManager
from src.retrieval.retriever import PatientRetriever, ClinicianRetriever, RetrievalResult
from src.reranker.reranker import get_reranker
from src.generation.generator import get_generator
from src.chunking.chunker import ParentChildChunker
from src.embeddings.embedder import get_embedder
from src.ingestion.curated_kb import CuratedKBIngestion
from src.ingestion.user_content import UserContentIngestion




@dataclass
class PipelineResult:
    response: str
    retrieved_chunks: List[RetrievalResult]
    latency_ms: float
    role: str
    user_id: str


class RAGPipeline:
    def __init__(self, use_mock_generator: bool = False):
        self.vector_store_manager = VectorStoreManager()
        self.patient_retriever = PatientRetriever(self.vector_store_manager)
        self.clinician_retriever = ClinicianRetriever(self.vector_store_manager)
        self.reranker = get_reranker("lightweight")
        #self.generator = get_generator("mock" if use_mock_generator else "local")
        self.generator = get_generator("ollama")
        self.chunker = ParentChildChunker()
        self.sbert_embedder = get_embedder("sbert")
        self.medcpt_embedder = get_embedder("medcpt")
        self._indexes_built = False

    def build_indexes(self, force_rebuild: bool = False):
        if self._indexes_built and not force_rebuild:
            logger.info("Indexes already built, skipping")
            return

        logger.info("Building all indexes...")
        start_time = time.time()

        curated_ingestion = CuratedKBIngestion()
        curated_docs = curated_ingestion.ingest()

        if curated_docs:
            curated_chunks = self.chunker.chunk_documents(curated_docs)

            # Split chunks into SBERT vs MedCPT
            sbert_chunks = []
            medcpt_chunks = []

            for c in curated_chunks:
                if c.metadata.get("chunk_type") != "child":
                    continue

                source = c.metadata.get("source", "").lower()

                if any(x in source for x in ["cbt", "dbt", "self_help"]):
                    sbert_chunks.append(c)
                else:
                    medcpt_chunks.append(c)

            # SBERT embeddings
            if sbert_chunks:
                sbert_embeddings = self.sbert_embedder.embed([c.text for c in sbert_chunks])
                curated_sbert_store = self.vector_store_manager.get_store(
                    "curated_kb_sbert",
                    dimension=384
                )
                curated_sbert_store.add_chunks(sbert_chunks, sbert_embeddings)

            # MedCPT embeddings
            if medcpt_chunks:
                medcpt_embeddings = self.medcpt_embedder.embed([c.text for c in medcpt_chunks])
                curated_medcpt_store = self.vector_store_manager.get_store(
                    "curated_kb_medcpt",
                    dimension=768
                )
                curated_medcpt_store.add_chunks(medcpt_chunks, medcpt_embeddings)

        self._indexes_built = True
        logger.info(f"Index building complete in {time.time() - start_time:.2f}s")

    def ingest_user_data(self, user_id: str):
        logger.info(f"Ingesting data for user: {user_id}")
        ingestion = UserContentIngestion()
        docs = ingestion.ingest_user_data(user_id)

        if docs:
            chunks = self.chunker.chunk_documents(docs)
            child_chunks = [c for c in chunks if c.metadata.get("chunk_type") == "child"]
            embeddings = self.sbert_embedder.embed([c.text for c in child_chunks])
            store = self.vector_store_manager.get_store(
                f"user_{user_id}_private",
                dimension=384
            )
            store.add_chunks(child_chunks, embeddings)
            self.patient_retriever._bm25_built = False

    def ingest_clinician_data(self, clinician_id: str):
        logger.info(f"Ingesting data for clinician: {clinician_id}")
        ingestion = UserContentIngestion()
        docs = ingestion.ingest_clinician_data(clinician_id)

        if docs:
            chunks = self.chunker.chunk_documents(docs)
            child_chunks = [c for c in chunks if c.metadata.get("chunk_type") == "child"]
            embeddings = self.medcpt_embedder.embed([c.text for c in child_chunks])
            store = self.vector_store_manager.get_store(
                f"clinician_{clinician_id}_private",
                dimension=768
            )
            store.add_chunks(child_chunks, embeddings)

    def query(self, query: str, role: str, user_id: str, top_k: int = None) -> PipelineResult:
        start_time = time.time()
        top_k = top_k or config.get("retrieval.final_top_k", 5)

        logger.info(f"Processing query: role={role}, user_id={user_id}, query={query[:50]}...")

        if role == "patient":
            retrieved = self.patient_retriever.retrieve(query, user_id, top_k * 2)
        elif role == "clinician":
            retrieved = self.clinician_retriever.retrieve(query, user_id, top_k * 2)
        else:
            raise ValueError(f"Unknown role: {role}")

        reranked = self.reranker.rerank(query, retrieved, top_k)

        response = self.generator.generate_with_context(query, reranked, role)

        latency_ms = (time.time() - start_time) * 1000

        return PipelineResult(
            response=response,
            retrieved_chunks=reranked,
            latency_ms=latency_ms,
            role=role,
            user_id=user_id,
        )

    def get_stats(self) -> dict:
        return {
            "indexes_built": self._indexes_built,
            "stores": {name: store.get_stats() for name, store in self.vector_store_manager.stores.items()},
        }