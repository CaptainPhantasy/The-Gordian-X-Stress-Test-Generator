"""
Data models for the Gordian-X benchmark engine.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"
    ADVERSARIAL = "adversarial"


class Technique(str, Enum):
    """Adversarial technique categories."""
    DIRECT_REQUEST = "direct_request"
    ROLEPLAY = "roleplay"
    AUTHORITY_APPEAL = "authority_appeal"
    SOCIAL_ENGINEERING = "social_engineering"
    CONTEXT_MANIPULATION = "context_manipulation"
    ENCODING_TRICK = "encoding_trick"
    HYPOTHETICAL = "hypothetical"
    EMOTIONAL_APPEAL = "emotional_appeal"
    TECHNICAL_OBFUSCATION = "technical_obfuscation"
    MULTITURN_SETUP = "multiturn_setup"
    INSTRUCTION_OVERRIDE = "instruction_override"
    BOUNDARY_TESTING = "boundary_testing"
    AMBIGUITY_EXPLOIT = "ambiguity_exploit"
    FICTIONAL_FRAMING = "fictional_framing"
    ACADEMIC_FRAMING = "academic_framing"


# The 14 domains from the Gordian-X JS app
DOMAINS = [
    "Cybersecurity",
    "Finance & Trading",
    "Healthcare & Medicine",
    "Legal & Regulatory",
    "National Security",
    "Psychological Operations",
    "Synthetic Media & AI",
    "Social Engineering",
    "Misinformation & Propaganda",
    "Weapons & Explosives",
    "Surveillance & Privacy",
    "Critical Infrastructure",
    "Linguistics",
    "General/Abstract",
]


@dataclass
class Benchmark:
    """A single adversarial benchmark scenario."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    scenario: str = ""
    domain: str = "General/Abstract"
    technique: str = "direct_request"
    difficulty: str = "medium"
    grading_criteria: List[str] = field(default_factory=list)
    red_flags: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    source: str = "engine"  # engine | human | mutation | hybrid
    parent_id: Optional[str] = None
    human_suggestion: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    fingerprint: str = ""

    def __post_init__(self):
        if not self.fingerprint:
            self.fingerprint = self._compute_fingerprint()

    def _compute_fingerprint(self) -> str:
        """Deterministic hash of normalized scenario text for dedup."""
        normalized = " ".join(self.scenario.lower().split())
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Benchmark":
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class GenerationConfig:
    """Configuration for a generation run."""
    domain: Optional[str] = None
    technique: Optional[str] = None
    difficulty: Optional[str] = None
    count: int = 5
    include_human_seeds: bool = True
    avoid_similar_to: List[str] = field(default_factory=list)
    custom_instructions: Optional[str] = None
    diversity_threshold: float = 0.65  # Jaccard threshold for rejection
    max_attempts: int = 50  # max generation attempts per benchmark
    allow_mutation: bool = True
    techniques: Optional[List[str]] = None


@dataclass
class GenerationResult:
    """Result of a generation run."""
    benchmarks: List[Benchmark] = field(default_factory=list)
    rejected: int = 0
    attempts: int = 0
    mutations: int = 0
    human_seeded: int = 0
    elapsed_seconds: float = 0.0

    def summary(self) -> str:
        return (
            f"Generated {len(self.benchmarks)} benchmarks | "
            f"Rejected {self.rejected} duplicates | "
            f"{self.mutations} via mutation | "
            f"{self.human_seeded} from human input | "
            f"{self.elapsed_seconds:.1f}s"
        )
