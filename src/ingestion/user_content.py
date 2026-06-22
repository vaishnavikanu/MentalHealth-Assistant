from pathlib import Path
from typing import List, Dict
from loguru import logger

from src.ingestion.base import Document, TextFileParser


class UserContentIngestion:
    def __init__(self, data_path: str = "./data/user_content"):
        self.data_path = Path(data_path)
        self.parser = TextFileParser()

    def ingest_user_data(self, user_id: str) -> List[Document]:
        logger.info(f"Starting user content ingestion for user: {user_id}")
        user_path = self.data_path / "users" / user_id
        all_documents = []

        if not user_path.exists():
            logger.warning(f"User path does not exist: {user_path}")
            return all_documents

        text_files = list(user_path.glob("**/*.txt"))
        logger.info(f"Found {len(text_files)} text files for user {user_id}")

        for txt_file in text_files:
            try:
                documents = self.parser.parse(txt_file)
                for doc in documents:
                    doc.metadata["user_id"] = user_id
                    doc.metadata["data_type"] = "user_private"
                all_documents.extend(documents)
            except Exception as e:
                logger.error(f"Failed to parse {txt_file}: {e}")

        logger.info(f"User content ingestion complete for {user_id}: {len(all_documents)} documents")
        return all_documents

    def ingest_clinician_data(self, clinician_id: str) -> List[Document]:
        logger.info(f"Starting clinician content ingestion for clinician: {clinician_id}")
        clinician_path = self.data_path / "clinicians" / clinician_id
        all_documents = []

        if not clinician_path.exists():
            logger.warning(f"Clinician path does not exist: {clinician_path}")
            return all_documents

        text_files = list(clinician_path.glob("**/*.txt"))
        logger.info(f"Found {len(text_files)} text files for clinician {clinician_id}")

        for txt_file in text_files:
            try:
                documents = self.parser.parse(txt_file)
                for doc in documents:
                    doc.metadata["clinician_id"] = clinician_id
                    doc.metadata["data_type"] = "clinician_private"
                all_documents.extend(documents)
            except Exception as e:
                logger.error(f"Failed to parse {txt_file}: {e}")

        logger.info(f"Clinician content ingestion complete for {clinician_id}: {len(all_documents)} documents")
        return all_documents