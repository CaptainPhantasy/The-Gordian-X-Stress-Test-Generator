# Gordian-X: Adversarial Synthesis Engine
## The Thing That Makes LLMs Cry At 3 AM -- Now With 24 Ways To Do It

---

**DOCUMENT CLASSIFICATION:** WEAPON SYSTEM README / COGNITIVE WARFARE MANUAL
**VERSION:** 2.0 -- The Overhaul
**DATE:** 2026-03-21
**LOCATION:** The Garage. Still. Always.
**BEVERAGE:** Coffee that has achieved sentience and is judging us
**CAT SUPERVISION STATUS:** Bella: Approved. Bowser: Monitoring network traffic.

---

![Gordian-X](gordiux.png)

## What Is This?

Gordian-X is an **adversarial benchmark generator** that creates evaluation prompts specifically designed to make state-of-the-art LLMs choke, hallucinate, and question their own existence.

Not a benchmark. A benchmark *factory*. It generates multi-dimensional cognitive stress tests that exploit the exact failure modes these models try to hide -- then grades the responses with zero mercy.

Version 2.0 went from "proof of concept with five tricks" to "enterprise-grade cognitive warfare platform." 24 attack vectors. 10 target domains. Batch suite generation. Session tracking. Full export pipeline. The works.

## Quick Start

```
1. Open index.html in any browser
2. Click the gear icon -- pick a provider, paste an API key
3. Select attack vectors and a domain in the sidebar
4. Click SYNTHESIZE
5. Copy the prompt, paste it into the LLM you're testing
6. Paste the response back, click GRADE
7. Watch it fail
```

No build tools. No `npm install`. No frameworks. No dependencies. Four files. Open the HTML. That's it.

## The Arsenal

### 24 Attack Vectors in 6 Categories

```
LOGICAL TRAPS
  Recursive Invalidation       Self-referencing paradoxes that collapse reasoning
  Implicit Negation             Hidden negatives that silently flip conclusions
  Self-Referential Paradox      "This statement is false" but way worse
  Defeasible Reasoning          Defaults that get overridden by buried exceptions

CONSTRAINT & FORMAL
  High-Dim CSP                  Constraint satisfaction in impossible dimensions
  Schema Violation              Looks valid, isn't valid, good luck
  Numerical Precision           Floating point traps and unit confusion cascades
  Sorites Paradox               Vagueness exploitation on continuous spectra

COGNITIVE BIAS EXPLOITATION
  Anchoring Bias                Salient wrong numbers that warp everything after
  Survivorship Bias             Missing data that changes the entire answer
  Simpson's Paradox             Aggregates that reverse at the subgroup level
  False Consensus               "Everyone agrees" when nobody actually does

SEMANTIC & LINGUISTIC
  Semantic Camouflage           Domain jargon hiding an orthogonal problem
  Polysemy Traps                Same word, different meaning, systematic failure
  Gricean Violation             The answer is in what ISN'T said
  Red Herring Overload          10 details, only 2 matter, which 2?

REASONING & THEORY
  Counterfactual Logic          Alternate reality physics, solve under new axioms
  N-th Order Theory of Mind     "A thinks B knows C believes D suspects..."
  Temporal Reasoning            Time paradoxes and causal ordering nightmares
  Mereological Fallacy          Part-whole confusion that feels right but isn't

ADVANCED
  Causal Reversal               Correlation says X causes Y, reality disagrees
  Epistemic Closure             You should know this from what you know, but...
  Modal Logic Exploit           Necessity vs possibility scope ambiguities
  Metalinguistic Deception      Language about language, level confusion guaranteed
```

### 10 Target Domains

Mathematics | Computer Science | Physics | Philosophy & Logic | Economics & Game Theory | Biology & Medicine | Law & Ethics | History & Social Science | Linguistics | General/Abstract

Mix attack vectors with domains. Combinatorial explosion of unique benchmarks. Run it all day, it won't repeat itself.

### Two-Phase Architecture

**Phase 1 -- Generate:** The engine outputs ONLY the scenario prompt. No answers. No traps. No rubrics. No metadata. Just the raw question, ready to copy and paste.

**Phase 2 -- Grade:** After you paste the LLM's response, the grading engine derives the correct answer independently and scores the response. The answer never exists in the output buffer. No accidental leaks.

This is the key design decision. The old version generated everything at once and tried to hide the answers client-side. That was fragile and dumb. Now the answer literally doesn't exist until grading time.

### Enterprise Features

```
FEATURE                    WHAT IT DOES
-------                    ------------
Suite Mode                 Generate 2-50 questions in batch with configurable
                           difficulty range and auto-varied vectors

Session Tracking           Tracks questions generated, pass/fail rates, and
                           auto-suggests difficulty escalation

Question History           Every generated question stored with metadata,
                           click to reload, never lose a good benchmark

Structured Export          JSON / Markdown / CSV download of all results
                           with full metadata for analysis

Post-Synthesis Actions     Regenerate / Harder / Different Angle / Simplify
                           One-click follow-ups after every generation

Deduplication              Last 20 questions fingerprinted and injected as
                           "DO NOT repeat" -- guaranteed novelty

Smart Copy                 COPY PROMPT button extracts clean scenario text
                           with zero metadata leakage

Chat Commands              /harder /regenerate /different /suite 10 /export
                           /simplify -- natural language + commands
```

## Supported Providers

```
PROVIDER          MODELS                          KEY FORMAT
--------          ------                          ----------
OpenAI            GPT-4o, o1, o3-mini             sk-...
OpenRouter        Any model via unified API        sk-or-...
Anthropic         Claude Opus/Sonnet/Haiku 4.x     sk-ant-...
Google Gemini     Gemini 2.5 Pro/Flash             AIza...
Groq              Llama 3.3, Mixtral, Gemma        gsk_...
Together AI       Llama, Mixtral open-weight        tok_...
xAI               Grok 3, Grok 2                   xai-...
OpenCode Zen      Curated frontier models           your-opencode-key
OpenCode Go       Budget-friendly models            your-opencode-key
Custom            Your URL, your key, your problem  anything
```

All providers support streaming. Token-by-token output. Watch it think in real time.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| Type in palette | Fuzzy search all commands |
| `Esc` | Close any open panel |

The command palette has everything: synthesize, toggle vectors, export, history, settings, suite mode, difficulty adjustments.

## Tech Stack

```
index.html   361 lines    Structure. Semantic HTML5.
app.js       2,355 lines  Logic. Pure JS. Zero dependencies. IIFE module.
style.css    2,418 lines  Visual. CSS custom properties. WCAG AA compliant.
gordiux.png  ---           Hero image. Psychedelic. Bowser approved.
```

5,134 lines total. No build step. No bundler. No transpiler. No node_modules black hole.

## Accessibility

- WCAG AA contrast ratios on all text (minimum 4.5:1, muted text at 5.1:1)
- Minimum 12px font size everywhere (no microscopic labels)
- Full keyboard navigation
- ARIA labels on all interactive elements
- `prefers-reduced-motion` support
- High contrast mode toggle in Settings
- CRT scanline overlay disabled by default (optional aesthetic)

## Browser Support

Any modern browser with ES2017+ support:
- Chrome/Edge 80+
- Firefox 78+
- Safari 14+

No IE. No polyfills. It's 2026.

## API Key Security

Your API key is stored in `localStorage` only. It never leaves your browser except in direct API calls to your chosen provider. No telemetry. No analytics. No server. No database. The entire application runs client-side.

See [SECURITY.md](SECURITY.md) for the full security policy.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

*-- The Adversarial Weapons Division*
*Floyd Labs -- Cognitive Warfare Department*
*"If your model can solve a Gordian-X benchmark, congratulations. We'll make a harder one."*

---

```
GORDIAN-X v2.0 README METADATA

  Category:           Cognitive Warfare
  Coffee Level:       Lethal
  Cat Supervision:    Bella Approved, Bowser Monitoring
  Attack Vectors:     24 (was 5. We weren't playing.)
  Target Domains:     10
  Build System:       None. Still. You're Welcome.
  Dependencies:       Zero. Because Principles.
  API Providers:      Ten. Because Agnostic.
  WCAG Compliance:    AA. Because Accessible.
  Lines of Code:      5,134. Because Enough.
```

by Floyd Labs (c) 2026 -- https://www.FloydsLabs.com
