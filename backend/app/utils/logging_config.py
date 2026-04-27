"""
Structured logging configuration for the application.

Call ``setup_logging()`` once at startup (inside the lifespan handler).
"""

import logging
import sys


LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)-30s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(*, level: int = logging.INFO) -> None:
    """Configure the root logger with a rich console handler."""
    root = logging.getLogger()
    root.setLevel(level)

    # Avoid duplicate handlers on reload
    if root.handlers:
        return

    console = logging.StreamHandler(sys.stdout)
    console.setLevel(level)
    console.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    root.addHandler(console)

    # Quiet noisy third-party loggers
    for name in ("httpcore", "httpx", "chromadb", "openai", "urllib3"):
        logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger (prefer ``__name__`` from calling module)."""
    return logging.getLogger(name)
