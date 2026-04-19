"""
Gordian-X Offline Benchmark Engine
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Pure-stdlib Python engine for adversarial LLM benchmark generation.
Zero dependencies. Fully offline.
"""

from .engine import GordianEngine
from .models import Benchmark, DOMAINS, Technique, Difficulty, GenerationConfig
from .generator import BenchmarkGenerator
from .dedup import DedupEngine
from .human import HumanInterface
from .state import StateStore

__version__ = "1.0.0"
__all__ = [
    "GordianEngine",
    "Benchmark",
    "DOMAINS",
    "Technique",
    "Difficulty",
    "GenerationConfig",
    "BenchmarkGenerator",
    "DedupEngine",
    "HumanInterface",
    "StateStore",
]
