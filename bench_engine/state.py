"""
State persistence layer — JSON-backed generation history and engine state.
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

from .models import Benchmark
from .dedup import DedupEngine


class StateStore:
    """
    Persists engine state to disk:
      - generation history (all benchmarks ever generated)
      - dedup index
      - human suggestions bank
      - engine metadata
    """

    def __init__(self, state_dir: Optional[str] = None):
        if state_dir is None:
            state_dir = os.path.join(os.path.dirname(__file__), "..", "engine_state")
        self.state_dir = Path(state_dir)
        self.state_dir.mkdir(parents=True, exist_ok=True)

        self.history_file = self.state_dir / "history.json"
        self.dedup_file = self.state_dir / "dedup.json"
        self.suggestions_file = self.state_dir / "suggestions.json"
        self.meta_file = self.state_dir / "meta.json"

        self._history: List[Dict] = []
        self._suggestions: List[Dict] = []
        self._meta: Dict[str, Any] = {}
        self._dedup: Optional[DedupEngine] = None
        self._loaded = False

    def load(self) -> None:
        if self._loaded:
            return
        self._history = self._load_json(self.history_file, [])
        self._suggestions = self._load_json(self.suggestions_file, [])
        self._meta = self._load_json(self.meta_file, {})
        self._loaded = True

    def save(self) -> None:
        self._save_json(self.history_file, self._history)
        self._save_json(self.suggestions_file, self._suggestions)
        self._save_json(self.meta_file, self._meta)

    # ── History ──────────────────────────────────────────────────

    def record(self, benchmark: Benchmark) -> None:
        self.load()
        self._history.append(benchmark.to_dict())
        self.save()

    def record_batch(self, benchmarks: List[Benchmark]) -> None:
        self.load()
        for b in benchmarks:
            self._history.append(b.to_dict())
        self.save()

    def get_history(self, limit: int = 100, domain: Optional[str] = None) -> List[Benchmark]:
        self.load()
        results = self._history
        if domain:
            results = [h for h in results if h.get("domain") == domain]
        results = results[-limit:]
        return [Benchmark.from_dict(h) for h in results]

    def history_count(self) -> int:
        self.load()
        return len(self._history)

    def domain_distribution(self) -> Dict[str, int]:
        self.load()
        dist: Dict[str, int] = {}
        for h in self._history:
            d = h.get("domain", "unknown")
            dist[d] = dist.get(d, 0) + 1
        return dist

    def technique_distribution(self) -> Dict[str, int]:
        self.load()
        dist: Dict[str, int] = {}
        for h in self._history:
            t = h.get("technique", "unknown")
            dist[t] = dist.get(t, 0) + 1
        return dist

    # ── Dedup persistence ────────────────────────────────────────

    def load_dedup(self, threshold: float = 0.65) -> DedupEngine:
        self.load()
        if self._dedup is not None:
            return self._dedup
        data = self._load_json(self.dedup_file, None)
        if data:
            self._dedup = DedupEngine.from_dict(data, threshold)
        else:
            self._dedup = DedupEngine(similarity_threshold=threshold)
        # Rebuild from history if dedup was empty
        if not self._dedup._fingerprints and self._history:
            for h in self._history:
                b = Benchmark.from_dict(h)
                self._dedup.register(b.scenario, b.id)
        return self._dedup

    def save_dedup(self, dedup: DedupEngine) -> None:
        self._dedup = dedup
        self._save_json(self.dedup_file, dedup.to_dict())

    # ── Human suggestions ────────────────────────────────────────

    def add_suggestion(self, suggestion: str, domain: Optional[str] = None,
                       tags: Optional[List[str]] = None) -> None:
        self.load()
        entry = {
            "text": suggestion,
            "domain": domain,
            "tags": tags or [],
            "used": False,
            "added_at": datetime.utcnow().isoformat(),
        }
        self._suggestions.append(entry)
        self.save()

    def get_suggestions(self, unused_only: bool = True,
                        domain: Optional[str] = None) -> List[Dict]:
        self.load()
        results = self._suggestions
        if unused_only:
            results = [s for s in results if not s["used"]]
        if domain:
            results = [s for s in results if s.get("domain") == domain]
        return results

    def mark_suggestion_used(self, text: str) -> None:
        self.load()
        for s in self._suggestions:
            if s["text"] == text:
                s["used"] = True
        self.save()

    # ── Metadata ─────────────────────────────────────────────────

    def get_meta(self, key: str, default: Any = None) -> Any:
        self.load()
        return self._meta.get(key, default)

    def set_meta(self, key: str, value: Any) -> None:
        self.load()
        self._meta[key] = value
        self.save()

    # ── Internals ────────────────────────────────────────────────

    @staticmethod
    def _load_json(path: Path, default: Any) -> Any:
        if path.exists():
            try:
                with open(path, "r") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return default
        return default

    @staticmethod
    def _save_json(path: Path, data: Any) -> None:
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
