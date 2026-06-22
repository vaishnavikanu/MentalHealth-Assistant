from abc import ABC, abstractmethod
from typing import List, Optional
import torch
from loguru import logger

from src.utils.config import config
from src.vectorstore.store import VectorRecord
from src.retrieval.retriever import RetrievalResult


class BaseGenerator(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        pass

    @abstractmethod
    def generate_with_context(self, query: str, context_chunks: List[RetrievalResult], role: str, **kwargs) -> str:
        pass


class LocalLLMGenerator(BaseGenerator):
    def __init__(
        self,
        model_name: str = None,
        device: str = None,
        max_length: int = None,
        temperature: float = None,
        top_p: float = None,
    ):
        self.model_name = model_name or config.get("models.generator.name", "microsoft/phi-2")
        self.device = device or config.get("models.generator.device", "cpu")
        self.max_length = max_length or config.get("models.generator.max_length", 2048)
        self.temperature = temperature or config.get("models.generator.temperature", 0.7)
        self.top_p = top_p or config.get("models.generator.top_p", 0.9)
        self._model = None
        self._tokenizer = None
        self._load_model()

    def _load_model(self):
        logger.info(f"Loading generator model: {self.model_name}")
        from transformers import AutoModelForCausalLM, AutoTokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        if self._tokenizer.pad_token is None:
            self._tokenizer.pad_token = self._tokenizer.eos_token
        self._model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True,
        ).to(self.device)
        self._model.eval()
        logger.info("Generator model loaded successfully")

    def generate(self, prompt: str, **kwargs) -> str:
        max_new_tokens = kwargs.get("max_new_tokens", 512)
        temperature = kwargs.get("temperature", self.temperature)
        top_p = kwargs.get("top_p", self.top_p)

        inputs = self._tokenizer(prompt, return_tensors="pt", truncation=True, max_length=self.max_length - max_new_tokens).to(self.device)

        with torch.no_grad():
            outputs = self._model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=temperature > 0,
                pad_token_id=self._tokenizer.pad_token_id,
                eos_token_id=self._tokenizer.eos_token_id,
            )

        generated = self._tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        return generated.strip()

    def generate_with_context(self, query: str, context_chunks: List[RetrievalResult], role: str, **kwargs) -> str:
        context = self._assemble_context(context_chunks)
        prompt = self._build_prompt(query, context, role)
        return self.generate(prompt, **kwargs)

    def _assemble_context(self, chunks: List[RetrievalResult]) -> str:
        if not chunks:
            return "No relevant context found."

        seen_parents = set()
        context_parts = []

        for chunk in chunks:
            parent_id = chunk.chunk.parent_id
            if parent_id and parent_id not in seen_parents:
                parent_chunk = self._get_parent_chunk(chunk.chunk, parent_id)
                if parent_chunk:
                    context_parts.append(f"[Source: {parent_chunk.metadata.get('source', 'Unknown')}]\n{parent_chunk.text}")
                    seen_parents.add(parent_id)
            elif not parent_id:
                context_parts.append(f"[Source: {chunk.chunk.metadata.get('source', 'Unknown')}]\n{chunk.chunk.text}")

        return "\n\n---\n\n".join(context_parts[:5])

    def _get_parent_chunk(self, chunk: VectorRecord, parent_id: str) -> Optional[VectorRecord]:
        if parent_id in chunk.metadata.get("parent_text", ""):
            return chunk
        return None

    def _build_prompt(self, query: str, context: str, role: str) -> str:
        if role == "patient":
            return self._build_patient_prompt(query, context)
        elif role == "clinician":
            return self._build_clinician_prompt(query, context)
        else:
            return self._build_default_prompt(query, context)

    def _build_patient_prompt(self, query: str, context: str) -> str:
        return f"""You are a supportive mental health assistant. Provide helpful, empathetic information based on the context below.

IMPORTANT GUIDELINES:
- Use a warm, supportive, and non-clinical tone
- Do NOT provide diagnoses or medical advice
- Encourage professional help when appropriate
- Focus on coping strategies, psychoeducation, and general wellness information
- Be validating and hopeful

Context:
{context}

User Question: {query}

Response:"""

    def _build_clinician_prompt(self, query: str, context: str) -> str:
        return f"""You are a clinical decision support assistant for mental health professionals. Provide structured, evidence-based information.

GUIDELINES:
- Use precise clinical terminology
- Reference specific sources from the context
- Provide structured clinical reasoning
- Include relevant diagnostic criteria, treatment guidelines, or research findings
- Note limitations and when to refer to specialists

Context:
{context}

Clinical Query: {query}

Structured Response:"""

    def _build_default_prompt(self, query: str, context: str) -> str:
        return f"""Context: {context}

Question: {query}

Answer:"""


class MockGenerator(BaseGenerator):
    def __init__(self):
        pass

    def generate(self, prompt: str, **kwargs) -> str:
        return f"[MOCK RESPONSE] Generated response for: {prompt[:100]}..."

    def generate_with_context(self, query: str, context_chunks: List[RetrievalResult], role: str, **kwargs) -> str:
        context_summary = "\n".join([f"- {c.chunk.text[:100]}..." for c in context_chunks[:3]])
        return f"[MOCK {role.upper()} RESPONSE]\nQuery: {query}\nContext used:\n{context_summary}\n\nThis is a mock response. Replace with actual LLM for production."


import requests

class OllamaGenerator(BaseGenerator):
    def __init__(self, model: str = "llama3", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url

    def generate(self, prompt: str, **kwargs) -> str:
        response = requests.post(
            f"{self.base_url}/api/generate",
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
        )

        if response.status_code != 200:
            logger.error(f"Ollama error: {response.text}")
            return "Error generating response"

        return response.json()["response"]

    def generate_with_context(self, query: str, context_chunks: List[RetrievalResult], role: str, **kwargs) -> str:
        context = self._assemble_context(context_chunks)
        prompt = self._build_prompt(query, context, role)
        return self.generate(prompt)

    # reuse SAME logic as LocalLLMGenerator
    def _assemble_context(self, chunks: List[RetrievalResult]) -> str:
        if not chunks:
            return "No relevant context found."

        context_parts = []
        for chunk in chunks[:5]:
            context_parts.append(chunk.chunk.text)

        return "\n\n---\n\n".join(context_parts)

    def _build_prompt(self, query: str, context: str, role: str) -> str:
        if role == "patient":
            return f"""You are a supportive mental health assistant.

Context:
{context}

User Query:
{query}

Answer:"""

        elif role == "clinician":
            return f"""You are a clinical assistant.

Context:
{context}

Clinical Query:
{query}

Answer:"""

        else:
            return f"""Context:
{context}

Query:
{query}

Answer:"""

def get_generator(generator_type: str = "ollama") -> BaseGenerator:
    if generator_type == "local":
        return LocalLLMGenerator()
    elif generator_type == "ollama":
        return OllamaGenerator()
    elif generator_type == "mock":
        return MockGenerator()
    else:
        raise ValueError(f"Unknown generator type: {generator_type}")