import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.config import config
from src.utils.logging import setup_logging
from src.pipeline.rag_pipeline import RAGPipeline
from loguru import logger


def main():
    setup_logging()
    config.load("configs/config.yaml")

    logger.info("Starting data ingestion")

    pipeline = RAGPipeline(generator_type="ollama")

    print("Building curated KB indexes...")
    pipeline.build_indexes()

    print("Ingesting sample user data...")
    pipeline.ingest_user_data("patient_001")

    print("Ingesting sample clinician data...")
    pipeline.ingest_clinician_data("clinician_001")

    stats = pipeline.get_stats()
    print("\nIngestion complete. Index stats:")
    for name, store_stats in stats["stores"].items():
        print(f"  {name}: {store_stats['total_vectors']} vectors")

    logger.info("Ingestion complete")


if __name__ == "__main__":
    main()