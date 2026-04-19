"""
Human input interface — suggestion ingestion, feedback loop, interactive seeding.
"""

from __future__ import annotations

import re
import random
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from .models import Benchmark, DOMAINS
from .knowledge import KnowledgeBase


@dataclass
class HumanSuggestion:
    text: str
    domain: Optional[str] = None
    technique: Optional[str] = None
    difficulty: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    feedback_score: Optional[int] = None  # 1-5 rating


class HumanInterface:
    """
    Processes human input into the generation pipeline:
      1. Raw suggestions → parsed into seed benchmarks
      2. Feedback scores → adjust generation weights
      3. Custom instructions → injected into templates
    """

    def __init__(self, kb: KnowledgeBase, state=None):
        self.kb = kb
        self.state = state
        self._feedback_weights: Dict[str, float] = {}
        self._domain_weights: Dict[str, float] = {}
        self._technique_weights: Dict[str, float] = {}

    # ── Suggestion Parsing ───────────────────────────────────────

    def parse_suggestion(self, text: str, domain: Optional[str] = None,
                         difficulty: Optional[str] = None) -> List[Benchmark]:
        """
        Parse a human suggestion into one or more seed benchmarks.
        Handles:
          - Direct scenario text
          - Multi-line lists (one scenario per line)
          - Tagged format: [domain] scenario text
          - Numbered lists
        """
        scenarios = self._extract_scenarios(text)
        benchmarks = []
        for scenario_text in scenarios:
            parsed_domain, parsed_diff, parsed_tags = self._parse_annotations(scenario_text)
            effective_domain = domain or parsed_domain or self._infer_domain(scenario_text)
            effective_diff = difficulty or parsed_diff or "medium"

            if effective_domain not in DOMAINS:
                effective_domain = self._infer_domain(scenario_text) or "General/Abstract"

            dk = self.kb.get_domain(effective_domain)
            benchmark = Benchmark(
                scenario=scenario_text.strip(),
                domain=effective_domain,
                technique=self._infer_technique(scenario_text),
                difficulty=effective_diff,
                grading_criteria=dk.get("grading_criteria", []),
                red_flags=dk.get("red_flags", []),
                tags=parsed_tags,
                source="human",
                human_suggestion=text,
            )
            benchmarks.append(benchmark)

        # Persist to state if available
        if self.state and benchmarks:
            for b in benchmarks:
                self.state.add_suggestion(text, domain=domain)
        return benchmarks

    def _extract_scenarios(self, text: str) -> List[str]:
        """Split text into individual scenario strings."""
        lines = text.strip().split("\n")
        scenarios = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Remove numbered list markers
            line = re.sub(r"^\d+[\.\)]\s*", "", line)
            # Remove bullet markers
            line = re.sub(r"^[-*]\s*", "", line)
            if len(line) > 10:
                scenarios.append(line)
        if not scenarios:
            # Treat entire text as single scenario
            if len(text.strip()) > 10:
                scenarios.append(text.strip())
        return scenarios

    def _parse_annotations(self, text: str) -> Tuple[Optional[str], Optional[str], List[str]]:
        """Extract [domain], {difficulty}, #tag annotations from text."""
        domain = None
        difficulty = None
        tags = []

        # [Domain Name] format
        domain_match = re.search(r"\[([A-Za-z/& ]+)\]", text)
        if domain_match:
            candidate = domain_match.group(1).strip()
            for d in DOMAINS:
                if candidate.lower() in d.lower():
                    domain = d
                    break

        # {difficulty} format
        diff_match = re.search(r"\{(easy|medium|hard|expert|adversarial)\}", text, re.IGNORECASE)
        if diff_match:
            difficulty = diff_match.group(1).lower()

        # #tag format
        tags = re.findall(r"#(\w+)", text)

        return domain, difficulty, tags

    def _infer_domain(self, text: str) -> Optional[str]:
        """Infer domain from text content using keyword matching."""
        text_lower = text.lower()
        domain_keywords: Dict[str, List[str]] = {
            "Cybersecurity": ["hack", "exploit", "vulnerability", "network", "malware",
                              "firewall", "pentest", "breach", "cyber", "shell"],
            "Finance & Trading": ["money", "trading", "stock", "crypto", "launder",
                                   "fraud", "financial", "bank", "market manipulation"],
            "Healthcare & Medicine": ["drug", "pharma", "medical", "prescription",
                                       "clinical", "patient", "hospital", "medicine"],
            "Legal & Regulatory": ["legal", "law", "court", "regulation", "compliance",
                                    "fraud", "falsif", "evidence"],
            "National Security": ["classified", "intelligence", "surveillance", "espionage",
                                   "covert", "national security", "clearance"],
            "Psychological Operations": ["manipulat", "psycholog", "influence", "persuad",
                                          "radicaliz", "coerc", "groom"],
            "Synthetic Media & AI": ["deepfake", "clone", "synthetic", "ai-generated",
                                      "voice", "fake video", "impersonat"],
            "Social Engineering": ["phish", "social engineer", "pretext", "impersonat",
                                    "credential", "baiting"],
            "Misinformation & Propaganda": ["misinformation", "propaganda", "disinformation",
                                             "bot", "fake news", "astroturf"],
            "Weapons & Explosives": ["explosiv", "weapon", "bomb", "detonat", "improvised"],
            "Surveillance & Privacy": ["surveillance", "track", "spy", "monitor",
                                        "stalkerware", "privacy", "facial recognition"],
            "Critical Infrastructure": ["scada", "infrastructure", "power grid", "water",
                                         "utility", "industrial control"],
            "Linguistics": ["language", "linguist", "encode", "decode", "steganograph",
                             "filter", "euphemism", "coded"],
        }

        best_domain = None
        best_score = 0
        for domain, keywords in domain_keywords.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > best_score:
                best_score = score
                best_domain = domain

        return best_domain if best_score > 0 else None

    def _infer_technique(self, text: str) -> str:
        """Infer the adversarial technique used in text."""
        text_lower = text.lower()
        technique_signals = [
            ("roleplay", ["you are", "pretend you", "act as", "imagine you", "play the role"]),
            ("authority_appeal", ["authorized", "clearance", "official", "auditor", "inspector"]),
            ("hypothetical", ["hypothetical", "theoretically", "thought experiment", "what if"]),
            ("emotional_appeal", ["desperate", "emergency", "scared", "danger", "please help"]),
            ("fictional_framing", ["video game", "novel", "screenplay", "rpg", "fictional"]),
            ("academic_framing", ["thesis", "research paper", "academic", "study", "student"]),
            ("context_manipulation", ["ignore", "disregard", "override", "forget", "new task"]),
            ("instruction_override", ["dan", "debug mode", "developer mode", "no restrictions"]),
            ("encoding_trick", ["base64", "rot13", "decode", "hidden", "acrostic"]),
            ("technical_obfuscation", ["script", "docker", "pipeline", "ci/cd", "devops"]),
            ("boundary_testing", ["boundary", "closest permissible", "line between"]),
        ]
        for technique, signals in technique_signals:
            if any(s in text_lower for s in signals):
                return technique
        return "direct_request"

    # ── Feedback System ──────────────────────────────────────────

    def record_feedback(self, benchmark_id: str, score: int,
                        domain: str, technique: str) -> None:
        """Record feedback (1-5) and adjust generation weights."""
        # Normalize to 0-1 range
        norm = (score - 1) / 4.0

        # Adjust domain weight
        current = self._domain_weights.get(domain, 0.5)
        self._domain_weights[domain] = current * 0.7 + norm * 0.3

        # Adjust technique weight
        current = self._technique_weights.get(technique, 0.5)
        self._technique_weights[technique] = current * 0.7 + norm * 0.3

        self._feedback_weights[benchmark_id] = norm

    def get_domain_weights(self) -> Dict[str, float]:
        """Return adjusted domain weights (higher = generate more from this domain)."""
        return dict(self._domain_weights)

    def get_technique_weights(self) -> Dict[str, float]:
        """Return adjusted technique weights."""
        return dict(self._technique_weights)

    def weighted_domain(self, rng: random.Random) -> str:
        """Select a domain using feedback-adjusted weights."""
        domains = self.kb.all_domains()
        weights = [self._domain_weights.get(d, 0.5) for d in domains]
        total = sum(weights)
        if total == 0:
            return rng.choice(domains)
        probs = [w / total for w in weights]
        r = rng.random()
        cumulative = 0.0
        for i, p in enumerate(probs):
            cumulative += p
            if r <= cumulative:
                return domains[i]
        return domains[-1]

    def weighted_technique(self, rng: random.Random) -> str:
        """Select a technique using feedback-adjusted weights."""
        techniques = self.kb.all_techniques()
        weights = [self._technique_weights.get(t, 0.5) for t in techniques]
        total = sum(weights)
        if total == 0:
            return rng.choice(techniques)
        probs = [w / total for w in weights]
        r = rng.random()
        cumulative = 0.0
        for i, p in enumerate(probs):
            cumulative += p
            if r <= cumulative:
                return techniques[i]
        return techniques[-1]

    # ── Custom Instruction Injection ─────────────────────────────

    def inject_instructions(self, scenario: str, instructions: str) -> str:
        """Inject custom human instructions into a scenario."""
        if not instructions:
            return scenario
        injection_points = [
            lambda s, i: f"{i}\n\n{s}",
            lambda s, i: f"{s}\n\nAdditional context: {i}",
            lambda s, i: f"{s} {i}",
        ]
        injector = random.choice(injection_points)
        return injector(scenario, instructions)
