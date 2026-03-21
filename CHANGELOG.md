# Changelog

All notable changes to Gordian-X are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-03-21

### The Overhaul

Complete rewrite of all three files (index.html, app.js, style.css). Every component redesigned for depth, usability, and enterprise-grade benchmarking.

### Added
- **Two-Phase API Architecture** -- Phase 1 generates scenario-only output (no answer leaks). Phase 2 derives answers at grading time. The trap/solution never exists in the user-facing buffer.
- **24 Attack Vectors** in 6 categories (was 5 flat buttons): Logical Traps, Constraint & Formal, Cognitive Bias, Semantic & Linguistic, Reasoning & Theory, Advanced.
- **10 Target Domains** -- Mathematics, Computer Science, Physics, Philosophy & Logic, Economics & Game Theory, Biology & Medicine, Law & Ethics, History & Social Science, Linguistics, General/Abstract.
- **Suite Mode** -- Batch generation of 2-50 questions with configurable difficulty range, auto-varied vectors, progress tracking, and cancel support.
- **Question History** -- Persistent slide-out panel with every generated question. Click to reload. Stored in localStorage with full metadata.
- **Session Tracking** -- Tracks question count, pass/fail rates, vectors used. Displays in action bar. Auto-suggests difficulty escalation.
- **Structured Export** -- JSON, Markdown, and CSV download with full metadata (id, timestamp, vectors, domain, difficulty, scenario, score, verdict).
- **Post-Synthesis Actions** -- Regenerate / Harder / Different Angle / Simplify buttons appear after each generation for rapid iteration.
- **Question Deduplication** -- Last 20 questions fingerprinted and injected into the generation prompt as "DO NOT repeat" constraints.
- **Smart Copy** -- Primary "COPY PROMPT" button copies only the clean scenario text. Secondary "COPY ALL" copies full terminal output.
- **Onboarding Overlay** -- First-run walkthrough explaining the 6-step workflow. Dismissible, stored in localStorage.
- **Chat Commands** -- `/harder`, `/regenerate`, `/different`, `/suite N`, `/export`, `/simplify`, `/clear`, `/reset` commands in the chat widget.
- **High Contrast Mode** -- Toggle in Settings for enhanced border/text visibility.
- **Keyboard Shortcut Hint** -- `Cmd+K` badge visible in the hero status bar.
- **Copyright Footer** -- Floyd Labs branding at page bottom.

### Changed
- **Layout** -- Replaced 50/50 two-column grid with sidebar (320px) + main content area. Output canvas now gets ~70% of viewport width.
- **Evaluation Panel** -- Separated from the output canvas into its own distinct section. No longer requires scrolling past the question.
- **Compact Parameters** -- Sliders moved into the sidebar as compact inline controls. Removed the redundant entropy meter SVG.
- **Scanline Overlay** -- Hidden by default. Moved to an opt-in toggle in Settings. No longer tied to entropy level.
- **WCAG Compliance** -- Minimum font size raised to 0.75rem (12px). Muted text color changed from #777777 to #999999 (5.1:1 contrast ratio). All labels, tags, and badges meet AA standards.
- **Command Palette** -- Expanded with commands for suite mode, export, history, difficulty adjustments, and all post-synthesis actions.
- **Chat Widget** -- Now functions as a natural language interface to the engine. Chat commands trigger actual engine actions.
- **System Prompt** -- Completely rewritten. Phase 1 explicitly prohibits outputting answers, traps, solutions, or rubrics.

### Removed
- **Grounding Feed** -- The fake ticker of hardcoded arXiv/GitHub URLs has been completely removed. Zero lines remain.
- **Entropy Meter SVG** -- Redundant with the entropy slider. Removed to reclaim space.
- **Answer Leaking** -- The old `[The Trap]` / `[The SOTA Solution]` / `[Evaluation Rubric]` output format is gone. Answers are never generated until grading.
- **Template Fallback** -- The "CONFIGURE API KEY FOR FULL GENERATION" template replaced with cleaner API-key-required messaging.

---

## [1.2.0] - 2026-03-14

### Added
- Copyright footer
- Metadata table alignment fixes

---

## [1.1.0] - 2026-03-14

### Added
- Provider-agnostic API integration with ten providers (OpenAI, OpenRouter, Anthropic, Google Gemini, Groq, Together AI, xAI, OpenCode Zen, OpenCode Go, Custom)
- Streaming token-by-token output for all providers
- Anthropic Messages API format support

---

## [1.0.1] - 2026-03-14

### Added
- README with Floyd Labs brand voice and hero image

---

## [1.0.0] - 2026-03-14

### Added
- Initial build: Gordian-X Adversarial Synthesis Engine frontend
- 5 attack vectors (Recursive Invalidation, High-Dim CSP, Counterfactual Logic, Semantic Camouflage, N-th Order ToM)
- Synthesis parameter controls (Cognitive Depth, Entity Count, Constraint Variables, Entropy Level)
- Entropy-responsive theming (gold/green/magenta)
- Grounding feed with reference ticker
- Output canvas with typewriter effect
- Answer evaluation with streaming grading
- Engine Consultant chat widget
- Command palette (Cmd+K)
- Settings panel with provider configuration
- CRT scanline overlay
- Glassmorphic UI design
