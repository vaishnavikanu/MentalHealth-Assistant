# Role-Aware Privacy-Isolated RAG System

A production-grade, locally-running RAG system with strict data isolation between patient and clinician data, dual embedding pipelines, and role-aware retrieval/generation.

## Architecture Overview

### Layers 1-5 Implementation

| Layer | Component | Description |
|-------|-----------|-------------|
| 1 | **Ingestion** | Separate pipelines for curated KB (PDFs) and user content (text files) |
| 2 | **Chunking + Embeddings** | Parent-child chunking with dual embedders (SBERT + MedCPT) |
| 3 | **Vector Storage** | FAISS indexes per collection (curated_sbert, curated_medcpt, user_{id}, clinician_{id}) |
| 4 | **Retrieval** | Role-based routing: Patient (SBERT + BM25 + RRF) / Clinician (MedCPT + KG expansion) |
| 5 | **Generation** | Local LLM with dual prompt system (supportive vs clinical tone) |

## Key Features

- **Strict Data Isolation**: Separate FAISS indexes per user/role - no metadata filtering
- **Dual Embedding Pipelines**: SBERT for patient/conversational, MedCPT for clinical/structured
- **Parent-Child Chunking**: Paragraph-level parents with sentence-overlap children
- **Role-Aware Retrieval**: 
  - Patient: Dense (SBERT) + Sparse (BM25) → RRF → Rerank
  - Clinician: Dense (MedCPT) + Knowledge Graph expansion → Rerank
- **Local-Only Execution**: No API calls, all models run locally via HuggingFace transformers

## Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Run Full Demo

```bash
python main.py
```

This will:
1. Create sample data (curated KB + patient journal + clinician notes)
2. Build all FAISS indexes
3. Run example queries for both roles
4. Show system stats

### Ingest Custom Data

```bash
# Add PDFs to data/curated_kb/
# Add patient text files to data/user_content/users/{user_id}/
# Add clinician text files to data/user_content/clinicians/{clinician_id}/

python scripts/ingest.py
```

### Query the System

```bash
# Patient query
python scripts/query.py "I've been feeling depressed lately" --role patient --user-id patient_001

# Clinician query
python scripts/query.py "DSM-5 criteria for MDD" --role clinician --user-id clinician_001
```

## Project Structure

```
src/
├── ingestion/          # Layer 1: Document parsing
│   ├── base.py         # Base parser classes
│   ├── curated_kb.py   # PDF ingestion (Docling-style + PyMuPDF fallback)
│   └── user_content.py # User/clinician text file ingestion
├── chunking/           # Layer 2: Parent-child chunking
├── embeddings/         # Layer 2: Dual embedders (SBERT + MedCPT)
├── vectorstore/        # Layer 3: FAISS index management
├── retrieval/          # Layer 4: Role-based retrieval + RRF + KG expansion
├── reranker/           # Layer 4: Cross-encoder / lightweight reranking
├── generation/         # Layer 5: Local LLM + dual prompt system
├── pipeline/           # End-to-end orchestration
└── utils/              # Config, logging

scripts/
├── ingest.py           # Build indexes from data/
└── query.py            # CLI for querying

configs/
└── config.yaml         # All configuration

data/
├── curated_kb/         # PDFs for knowledge base
└── user_content/
    ├── users/          # Patient private data
    └── clinicians/     # Clinician private data
```

## Data Isolation Guarantees

```
┌─────────────────────────────────────────────────────────────┐
│                     PATIENT PATH                            │
├─────────────────────────────────────────────────────────────┤
│ Query → SBERT Embedding → curated_kb_sbert.index            │
│                ↓                                            │
│          BM25 on curated KB                                 │
│                ↓                                            │
│          RRF Fusion → Rerank → Patient Prompt → Generation  │
│                ↓                                            │
│          user_{id}_private.index (SBERT)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CLINICIAN PATH                           │
├─────────────────────────────────────────────────────────────┤
│ Query → MedCPT Embedding → curated_kb_medcpt.index          │
│                ↓                                            │
│          KG Expansion (medical synonyms)                    │
│                ↓                                            │
│          Combined → Rerank → Clinician Prompt → Generation  │
│                ↓                                            │
│          clinician_{id}_private.index (MedCPT)              │
└─────────────────────────────────────────────────────────────┘
```

**Critical**: Patient and clinician data NEVER share indexes. No cross-contamination possible.

## Configuration

All settings in `configs/config.yaml`:

- Model names and parameters
- Chunking sizes (parent/child/overlap)
- Retrieval parameters (top-k, RRF k, etc.)
- Vector store paths
- Logging levels

## Models Used (All Local)

| Purpose | Model | Size |
|---------|-------|------|
| Patient Embeddings | `sentence-transformers/all-MiniLM-L6-v2` | ~80MB |
| Clinical Embeddings | `ncbi/MedCPT-Article-Encoder` | ~500MB |
| Reranking | `BAAI/bge-reranker-base` | ~300MB |
| Generation | `microsoft/phi-2` | ~1.5GB |

First run downloads models to HF cache (~2.4GB total).

## Extending the System

### Add New Embedder
```python
# src/embeddings/embedder.py
class MyEmbedder(BaseEmbedder):
    def embed(self, texts): ...
    def embed_query(self, query): ...

# Register in get_embedder()
```

### Add New Retrieval Strategy
```python
# src/retrieval/retriever.py
class MyRetriever:
    def retrieve(self, query, user_id): ...

# Wire into RAGPipeline
```

### Swap Generator
```python
# src/generation/generator.py
class MyGenerator(BaseGenerator):
    def generate(self, prompt): ...
    def generate_with_context(self, query, context, role): ...

# Use: get_generator("my_generator")
```

## Requirements

- Python 3.10+
- 8GB+ RAM (for local models)
- CPU-only (no GPU required, but faster with CUDA)

## License

MIT