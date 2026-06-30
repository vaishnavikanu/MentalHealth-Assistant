from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from src.pipeline.rag_pipeline import RAGPipeline
from src.utils.config import config
from src.utils.logging import setup_logging

from .routes import router, set_pipeline

from app.database import engine
from app.models import Base
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.history import router as history_router
from app.routers.moods import router as mood_router
from app.routers.journals import router as journal_router
from app.routers.settings_routes import router as settings_router
from app.routers.upload import router as upload_router



#
# Global singleton
#
pipeline: Optional[RAGPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup:
        - Load config
        - Setup logging
        - Create pipeline
        - Build indexes
        - Register pipeline
    """

    global pipeline

    setup_logging()

    config.load("configs/config.yaml")

    pipeline = RAGPipeline()

    pipeline.build_indexes()
    # #
    # # Load demo data
    # #
    # pipeline.ingest_user_data("patient_001")
    # pipeline.ingest_clinician_data("clinician_001")

    Base.metadata.create_all(bind=engine)

    #
    # Register pipeline so routes can access it
    #
    set_pipeline(pipeline)

    yield

    #
    # Future cleanup if needed
    # (close vector DB, flush logs, etc.)
    #


app = FastAPI(
    title="Mental Health RAG API",
    version="1.0.0",
    lifespan=lifespan,
)

app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

@app.get("/")
def root():
    return {
        "message": "Mental Health RAG API",
        "docs": "/docs",
        "health": "/api/health",
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(history_router)
app.include_router(mood_router)
app.include_router(journal_router)
app.include_router(settings_router)
app.include_router(upload_router)
