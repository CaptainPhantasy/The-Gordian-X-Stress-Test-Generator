"""
Deduplication engine — hash exact + Jaccard semantic similarity.
Pure stdlib, zero dependencies.
"""

from __future__ import annotations

import hashlib
import math
import re
from collections import Counter
from typing import Dict, List, Set, Optional, Tuple


class DedupEngine:
    """
    Two-layer deduplication:
      1. Exact-match via SHA-256 fingerprint
      2. Semantic near-duplicate via Jaccard similarity on word n-grams
    """

    def __init__(
        self,
        similarity_threshold: float = 0.65,
        ngram_size: int = 2,
    ):
        self.similarity_threshold = similarity_threshold
        self.ngram_size = ngram_size
        self._fingerprints: Set[str] = set()
        self._ngram_profiles: Dict[str, Counter] = {}  # id -> ngram counter
        self._corpus_ngrams: Counter = Counter()  # global frequency

    # ── Fingerprint layer ────────────────────────────────────────

    @staticmethod
    def fingerprint(text: str) -> str:
        normalized = " ".join(text.lower().split())
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]

    def is_exact_duplicate(self, text: str) -> bool:
        return self.fingerprint(text) in self._fingerprints

    # ── N-gram layer ─────────────────────────────────────────────

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        text = text.lower()
        tokens = re.findall(r"[a-z0-9]+(?:'[a-z]+)?", text)
        return tokens

    def _ngrams(self, tokens: List[str]) -> Tuple[str, ...]:
        if len(tokens) < self.ngram_size:
            return tuple(tokens) if tokens else ()
        return tuple(
            " ".join(tokens[i : i + self.ngram_size])
            for i in range(len(tokens) - self.ngram_size + 1)
        )

    def jaccard_similarity(self, text_a: str, text_b: str) -> float:
        """Compute Jaccard similarity between two texts using character n-grams."""
        ng_a = set(self._ngrams(self._tokenize(text_a)))
        ng_b = set(self._ngrams(self._tokenize(text_b)))
        if not ng_a and not ng_b:
            return 1.0
        if not ng_a or not ng_b:
            return 0.0
        intersection = len(ng_a & ng_b)
        union = len(ng_a | ng_b)
        return intersection / union if union > 0 else 0.0

    def max_similarity(self, text: str) -> Tuple[float, Optional[str]]:
        """Return (max_similarity, matched_id) against all stored profiles."""
        tokens = self._tokenize(text)
        query_ngrams = set(self._ngrams(tokens))
        if not query_ngrams:
            return 0.0, None

        best_sim = 0.0
        best_id = None
        for pid, profile in self._ngram_profiles.items():
            profile_set = set(profile.keys())
            intersection = len(query_ngrams & profile_set)
            union = len(query_ngrams | profile_set)
            sim = intersection / union if union > 0 else 0.0
            if sim > best_sim:
                best_sim = sim
                best_id = pid

        return best_sim, best_id

    def is_near_duplicate(self, text: str) -> Tuple[bool, float, Optional[str]]:
        """Check if text is too similar to anything stored. Returns (is_dup, score, match_id)."""
        sim, match_id = self.max_similarity(text)
        return sim >= self.similarity_threshold, sim, match_id

    # ── Registration ─────────────────────────────────────────────

    def register(self, text: str, item_id: str) -> None:
        """Register a text into the dedup index."""
        fp = self.fingerprint(text)
        self._fingerprints.add(fp)

        tokens = self._tokenize(text)
        ngram_counter = Counter(self._ngrams(tokens))
        self._ngram_profiles[item_id] = ngram_counter
        self._corpus_ngrams.update(ngram_counter)

    def register_batch(self, items: List[Tuple[str, str]]) -> None:
        """Register multiple (text, id) pairs."""
        for text, item_id in items:
            self.register(text, item_id)

    def check_and_register(self, text: str, item_id: str) -> Tuple[bool, float]:
        """
        Check if text is a duplicate, then register it regardless.
        Returns (is_duplicate, similarity_score).
        """
        # Exact check first
        if self.is_exact_duplicate(text):
            return True, 1.0

        # Semantic check
        is_dup, sim, _ = self.is_near_duplicate(text)

        # Register regardless (caller decides what to do)
        self.register(text, item_id)

        return is_dup, sim

    # ── Stats & Serialization ────────────────────────────────────

    def stats(self) -> Dict:
        return {
            "fingerprints": len(self._fingerprints),
            "profiles": len(self._ngram_profiles),
            "unique_ngrams": len(self._corpus_ngrams),
        }

    def to_dict(self) -> Dict:
        return {
            "fingerprints": list(self._fingerprints),
            "profiles": {
                k: dict(v) for k, v in self._ngram_profiles.items()
            },
        }

    @classmethod
    def from_dict(cls, data: Dict, threshold: float = 0.65) -> "DedupEngine":
        engine = cls(similarity_threshold=threshold)
        engine._fingerprints = set(data.get("fingerprints", []))
        for pid, counts in data.get("profiles", {}).items():
            engine._ngram_profiles[pid] = Counter(counts)
            engine._corpus_ngrams.update(counts)
        return engine

    def reset(self) -> None:
        self._fingerprints.clear()
        self._ngram_profiles.clear()
        self._corpus_ngrams.clear()
