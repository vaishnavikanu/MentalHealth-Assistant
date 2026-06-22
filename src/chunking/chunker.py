import re
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from loguru import logger

from src.utils.config import config


@dataclass
class Chunk:
    text: str
    chunk_id: str
    parent_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)
    embedding: Optional[List[float]] = None


class ParentChildChunker:
    def __init__(
        self,
        parent_size: int = None,
        child_size: int = None,
        overlap_sentences: int = None,
    ):
        self.parent_size = parent_size or config.get("chunking.parent_size", 512)
        self.child_size = child_size or config.get("chunking.child_size", 128)
        self.overlap_sentences = overlap_sentences or config.get("chunking.overlap_sentences", 2)

    def _split_into_sentences(self, text: str) -> List[str]:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        return [s.strip() for s in sentences if s.strip()]

    def _create_parent_chunks(self, text: str, doc_id: str, metadata: dict) -> List[Chunk]:
        sentences = self._split_into_sentences(text)
        parents = []
        current_parent = []
        current_length = 0
        parent_index = 0

        for sentence in sentences:
            sentence_length = len(sentence)
            if current_length + sentence_length > self.parent_size and current_parent:
                parent_text = " ".join(current_parent)
                parent_id = f"{doc_id}_parent_{parent_index}"
                parents.append(
                    Chunk(
                        text=parent_text,
                        chunk_id=parent_id,
                        parent_id=None,
                        metadata={**metadata, "chunk_type": "parent", "parent_index": parent_index},
                    )
                )
                parent_index += 1
                current_parent = [sentence]
                current_length = sentence_length
            else:
                current_parent.append(sentence)
                current_length += sentence_length

        if current_parent:
            parent_text = " ".join(current_parent)
            parent_id = f"{doc_id}_parent_{parent_index}"
            parents.append(
                Chunk(
                    text=parent_text,
                    chunk_id=parent_id,
                    parent_id=None,
                    metadata={**metadata, "chunk_type": "parent", "parent_index": parent_index},
                )
            )

        return parents

    def _create_child_chunks(self, parent: Chunk) -> List[Chunk]:
        sentences = self._split_into_sentences(parent.text)
        children = []
        child_index = 0

        for i in range(0, len(sentences), max(1, self.child_size // 20)):
            end_idx = min(i + self.overlap_sentences + (self.child_size // 20), len(sentences))
            child_sentences = sentences[i:end_idx]
            if not child_sentences:
                break

            child_text = " ".join(child_sentences)
            child_id = f"{parent.chunk_id}_child_{child_index}"
            children.append(
                Chunk(
                    text=child_text,
                    chunk_id=child_id,
                    parent_id=parent.chunk_id,
                    metadata={
                        **parent.metadata,
                        "chunk_type": "child",
                        "child_index": child_index,
                        "parent_text": parent.text,
                    },
                )
            )
            child_index += 1

            if end_idx >= len(sentences):
                break

        return children

    def chunk_document(self, document) -> List[Chunk]:
        all_chunks = []
        parents = self._create_parent_chunks(document.content, document.doc_id, document.metadata)

        for parent in parents:
            all_chunks.append(parent)
            children = self._create_child_chunks(parent)
            all_chunks.extend(children)

        logger.debug(f"Document {document.doc_id}: {len(parents)} parents, {len(all_chunks) - len(parents)} children")
        return all_chunks

    def chunk_documents(self, documents) -> List[Chunk]:
        all_chunks = []
        for doc in documents:
            chunks = self.chunk_document(doc)
            all_chunks.extend(chunks)
        logger.info(f"Total chunks created: {len(all_chunks)}")
        return all_chunks