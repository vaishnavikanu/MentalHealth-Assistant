import sys
import os
import argparse
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.config import config
from src.utils.logging import setup_logging
from src.pipeline.rag_pipeline import RAGPipeline
from loguru import logger


def main():
    parser = argparse.ArgumentParser(description="Query the RAG system")
    parser.add_argument("query", type=str, help="Query string")
    parser.add_argument("--role", type=str, choices=["patient", "clinician"], required=True, help="User role")
    parser.add_argument("--user-id", type=str, required=True, help="User ID")
    parser.add_argument("--top-k", type=int, default=5, help="Number of results")
    parser.add_argument("--mock", action="store_true", help="Use mock generator")
    args = parser.parse_args()

    setup_logging()
    config.load("configs/config.yaml")

    pipeline = RAGPipeline(use_mock_generator=args.mock)

    print("Loading indexes...")
    pipeline.build_indexes()

    print(f"Querying as {args.role} (user: {args.user_id})...")
    result = pipeline.query(args.query, role=args.role, user_id=args.user_id, top_k=args.top_k)

    print(f"\nResponse ({result.latency_ms:.0f}ms):")
    print(result.response)

    print(f"\nRetrieved {len(result.retrieved_chunks)} chunks:")
    for i, chunk in enumerate(result.retrieved_chunks):
        print(f"  {i+1}. [{chunk.source}] {chunk.chunk.text[:100]}... (score: {chunk.score:.4f})")


if __name__ == "__main__":
    main()