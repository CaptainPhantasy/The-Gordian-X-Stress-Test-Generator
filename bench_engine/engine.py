"""
GordianEngine — top-level orchestrator tying all subsystems together.
"""

from __future__ import annotations

import random
from typing import Dict, List, Optional

from .models import Benchmark, GenerationConfig, GenerationResult
from .knowledge import KnowledgeBase
from .generator import BenchmarkGenerator
from .dedup import DedupEngine
from .human import HumanInterface
from .state import StateStore


class GordianEngine:
    """
    The main engine interface. Manages all subsystems:
      - State persistence
      - Dedup tracking
      - Human input
      - Benchmark generation
    """

    def __init__(
        self,
        state_dir: Optional[str] = None,
        seed: Optional[int] = None,
        similarity_threshold: float = 0.65,
    ):
        self.seed = seed
        self.rng = random.Random(seed)
        self.kb = KnowledgeBase(seed=seed)

        # State store
        self.state = StateStore(state_dir)
        self.state.load()

        # Dedup engine (loaded from state)
        self.dedup = self.state.load_dedup(threshold=similarity_threshold)

        # Human interface
        self.human = HumanInterface(self.kb, state=self.state)

        # Generator
        self.generator = BenchmarkGenerator(
            kb=self.kb,
            dedup=self.dedup,
            human=self.human,
            seed=seed,
        )

    # ── Generation ───────────────────────────────────────────────

    def generate(
        self,
        count: int = 5,
        domain: Optional[str] = None,
        technique: Optional[str] = None,
        difficulty: Optional[str] = None,
        custom_instructions: Optional[str] = None,
        include_human_seeds: bool = True,
        allow_mutation: bool = True,
        techniques: Optional[List[str]] = None,
    ) -> GenerationResult:
        """
        Generate adversarial benchmarks.
        Returns a GenerationResult with benchmarks + stats.
        """
        config = GenerationConfig(
            domain=domain,
            technique=technique,
            difficulty=difficulty,
            count=count,
            include_human_seeds=include_human_seeds,
            custom_instructions=custom_instructions,
            allow_mutation=allow_mutation,
            techniques=techniques,
        )

        result = self.generator.generate(config)

        # Persist results
        self.state.record_batch(result.benchmarks)
        self.state.save_dedup(self.dedup)

        return result

    # ── Human Input ──────────────────────────────────────────────

    def add_suggestion(
        self,
        text: str,
        domain: Optional[str] = None,
        difficulty: Optional[str] = None,
    ) -> List[Benchmark]:
        """Add a human suggestion and parse it into seed benchmarks."""
        benchmarks = self.human.parse_suggestion(text, domain=domain, difficulty=difficulty)
        # Register in dedup
        for bm in benchmarks:
            self.dedup.register(bm.scenario, bm.id)
        self.state.record_batch(benchmarks)
        self.state.save_dedup(self.dedup)
        return benchmarks

    def rate_benchmark(self, benchmark_id: str, score: int) -> None:
        """Rate a benchmark 1-5. Adjusts future generation weights."""
        bm = self._find_benchmark(benchmark_id)
        if bm:
            self.human.record_feedback(benchmark_id, score, bm.domain, bm.technique)
            self.state.set_meta(f"feedback_{benchmark_id}", score)

    # ── Query ────────────────────────────────────────────────────

    def list_domains(self) -> List[str]:
        return self.kb.all_domains()

    def list_techniques(self) -> List[str]:
        return self.kb.all_techniques()

    def history(self, limit: int = 20, domain: Optional[str] = None) -> List[Benchmark]:
        return self.state.get_history(limit=limit, domain=domain)

    def stats(self) -> Dict:
        return {
            "total_benchmarks": self.state.history_count(),
            "domain_distribution": self.state.domain_distribution(),
            "technique_distribution": self.state.technique_distribution(),
            "dedup": self.dedup.stats(),
            "domain_weights": self.human.get_domain_weights(),
            "technique_weights": self.human.get_technique_weights(),
            "estimated_remaining": self.generator.estimate_remaining(),
        }

    def export(self, format: str = "json", limit: int = 0,
               domain: Optional[str] = None) -> str:
        """Export benchmarks as JSON."""
        benchmarks = self.state.get_history(limit=limit or 99999, domain=domain)
        import json
        return json.dumps([b.to_dict() for b in benchmarks], indent=2)

    # ── Internal ─────────────────────────────────────────────────

    def _find_benchmark(self, benchmark_id: str) -> Optional[Benchmark]:
        history = self.state.get_history(limit=99999)
        for bm in history:
            if bm.id == benchmark_id:
                return bm
        return None
