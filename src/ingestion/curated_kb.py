from pathlib import Path
from typing import List
from loguru import logger

from src.ingestion.base import (
    Document,
    DoclingStyleParser,
    PyMuPDFParser,
    TextFileParser,
)


class CuratedKBIngestion:
    def __init__(self, data_path: str = "./data/curated_kb"):
        self.data_path = Path(data_path)
        self.primary_parser = DoclingStyleParser()
        self.fallback_parser = PyMuPDFParser()
        self.text_parser = TextFileParser()

    def ingest(self) -> List[Document]:
        logger.info(f"Starting curated KB ingestion from {self.data_path}")
        all_documents = []

        pdf_files = list(self.data_path.glob("**/*.pdf"))

        txt_files = list(self.data_path.glob("**/*.txt"))

        logger.info(
            f"Found {len(pdf_files)} PDFs and {len(txt_files)} text files"
        )

        for pdf_file in pdf_files:
            try:
                documents = self.primary_parser.parse(pdf_file)
                all_documents.extend(documents)
            except Exception as e:
                logger.warning(f"Primary parser failed for {pdf_file}, trying fallback: {e}")
                try:
                    documents = self.fallback_parser.parse(pdf_file)
                    all_documents.extend(documents)
                except Exception as e2:
                    logger.error(f"Both parsers failed for {pdf_file}: {e2}")

        #
        # Text Files
        #

        for txt_file in txt_files:

            try:

                documents = self.text_parser.parse(txt_file)

                all_documents.extend(documents)

            except Exception as e:

                logger.error(
                    f"Text parser failed for {txt_file}: {e}"
                )

        logger.info(f"Curated KB ingestion complete: {len(all_documents)} documents")
        return all_documents