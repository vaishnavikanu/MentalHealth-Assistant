import sys
from loguru import logger
from src.utils.config import config


def setup_logging() -> None:
    log_level = config.get("logging.level", "INFO")
    log_format = config.get(
        "logging.format",
        "{time:YYYY-MM-DD HH:mm:ss} | {level} | {module}:{function}:{line} | {message}",
    )

    logger.remove()
    logger.add(
        sys.stdout,
        level=log_level,
        format=log_format,
        colorize=True,
    )
    logger.add(
        "logs/rag_system.log",
        level=log_level,
        format=log_format,
        rotation="10 MB",
        retention="7 days",
    )
    logger.info("Logging configured")


def get_logger(name: str):
    return logger.bind(module=name)