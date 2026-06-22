from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional
from loguru import logger


@dataclass
class Document:
    content: str
    metadata: dict
    source_path: str
    doc_id: str


class BaseParser(ABC):
    @abstractmethod
    def parse(self, file_path: Path) -> List[Document]:
        pass

    def _create_doc_id(self, file_path: Path, chunk_index: int) -> str:
        return f"{file_path.stem}_{chunk_index}"


class DoclingStyleParser(BaseParser):
    def parse(self, file_path: Path) -> List[Document]:
        logger.info(f"Parsing with Docling-style parser: {file_path}")
        try:
            import fitz
            doc = fitz.open(file_path)
            documents = []
            for page_num, page in enumerate(doc):
                text = page.get_text("text")
                if text.strip():
                    documents.append(
                        Document(
                            content=text.strip(),
                            metadata={
                                "source": str(file_path),
                                "page": page_num + 1,
                                "parser": "docling_style",
                            },
                            source_path=str(file_path),
                            doc_id=self._create_doc_id(file_path, page_num),
                        )
                    )
            doc.close()
            logger.info(f"Extracted {len(documents)} pages from {file_path}")
            return documents
        except Exception as e:
            logger.error(f"Docling-style parsing failed for {file_path}: {e}")
            raise


class PyMuPDFParser(BaseParser):
    def parse(self, file_path: Path) -> List[Document]:
        logger.info(f"Parsing with PyMuPDF fallback: {file_path}")
        try:
            import fitz
            doc = fitz.open(file_path)
            documents = []
            for page_num, page in enumerate(doc):
                blocks = page.get_text("dict")["blocks"]
                page_text = ""
                for block in blocks:
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                page_text += span["text"]
                            page_text += "\n"
                if page_text.strip():
                    documents.append(
                        Document(
                            content=page_text.strip(),
                            metadata={
                                "source": str(file_path),
                                "page": page_num + 1,
                                "parser": "pymupdf",
                            },
                            source_path=str(file_path),
                            doc_id=self._create_doc_id(file_path, page_num),
                        )
                    )
            doc.close()
            logger.info(f"Extracted {len(documents)} pages from {file_path}")
            return documents
        except Exception as e:
            logger.error(f"PyMuPDF parsing failed for {file_path}: {e}")
            raise


class TextFileParser(BaseParser):
    def parse(self, file_path: Path) -> List[Document]:
        logger.info(f"Parsing text file: {file_path}")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            if content.strip():
                return [
                    Document(
                        content=content.strip(),
                        metadata={
                            "source": str(file_path),
                            "parser": "text_file",
                        },
                        source_path=str(file_path),
                        doc_id=file_path.stem,
                    )
                ]
            return []
        except Exception as e:
            logger.error(f"Text file parsing failed for {file_path}: {e}")
            raise