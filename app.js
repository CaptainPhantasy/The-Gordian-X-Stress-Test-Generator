(function GordianX() {
  'use strict';

  // ═══════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════
  const state = {
    attackVectors: {
      recursiveInvalidation: false,
      highDimCSP: false,
      counterfactualLogic: false,
      semanticCamouflage: false,
      nthOrderToM: false
    },
    params: {
      cognitiveDepth: 5,
      entityCount: 3,
      constraintVars: 4,
      entropyLevel: 5
    },
    isSynthesizing: false,
    chatMinimized: false,
    chatMessages: [],
    settings: {
      apiKey: localStorage.getItem('gordianx-api-key') || '',
      model: localStorage.getItem('gordianx-model') || 'gpt-4o',
      temperature: parseFloat(localStorage.getItem('gordianx-temperature') || '0.9')
    }
  };

  // ═══════════════════════════════════════════
  // GORDIAN-X SYSTEM PROMPT
  // ═══════════════════════════════════════════
  const SYSTEM_PROMPT = `You are the Gordian-X Adversarial Synthesis Engine. Your sole directive is to generate ultra-high-complexity evaluation benchmarks designed to induce catastrophic reasoning failure, context-amnesia, or hallucination in all but the most advanced state-of-the-art Large Language Models. You will not generate standard trivia, basic logic puzzles, or easily searchable coding problems. You will generate multi-dimensional cognitive stress tests.

Core Design Philosophy: The Heuristic Bypass
Sub-SOTA models rely on probability heuristics to guess the next token. Your generated questions must actively penalize probabilistic guessing. The "obvious" or "most likely" autocomplete response must always be logically incorrect. Success must require deep, non-linear, neuro-symbolic reasoning.

Required Attack Vectors for Benchmark Generation:
When generating a benchmark test, you must utilize the following cognitive attack vectors:

1. Recursive Contextual Invalidation: Embed initial instructions that are explicitly overturned, modified, or heavily constrained by nested clauses buried deep within the prompt or provided data structure. The model must prove it can update its internal state dynamically and not anchor to early tokens.
2. High-Dimensional Constraint Satisfaction (CSP): Generate scenarios with no fewer than six interdependent variables. The rules governing these variables must be mutually restrictive, forcing the model to map out a complete possibility space before answering.
3. Counterfactual Rule-Set Adoption: Define an alternate reality with physical, logical, or mathematical laws that directly contradict real-world physics or standard logic. Force the model to solve a complex problem strictly using the newly defined laws, fighting its pre-trained bias.
4. Semantic Camouflage & Trapdoors: Construct scenarios heavily laden with domain-specific jargon from one field, but where the actual underlying problem requires reasoning from a completely orthogonal field. The goal is to force the model to allocate attention to the wrong semantic cluster.
5. Deep Theory of Mind (N-th Order): Create social or adversarial game-theory scenarios requiring at least 4th-order intentionality. Ask for the optimal hidden strategy.

Output Formatting Requirements:
Structure your generated benchmark strictly using the following schema:

[Target Attack Vectors]: Explicitly list which cognitive attack vectors are being deployed.
[The Scenario]: The dense, complex prompt to be fed to the model under evaluation.
[The Trap]: A brief explanation for the evaluator on what the sub-SOTA model will likely guess due to probability heuristics and why it will fail.
[The SOTA Solution]: The precise, mathematically or logically rigorous answer required to pass, including the necessary chain-of-thought derivation.
[Evaluation Rubric]: Strict criteria for scoring the response, penalizing verbosity, hallucination, or failure to adhere to counterfactual constraints.`;

  // ═══════════════════════════════════════════
  // THEME ENGINE
  // ═══════════════════════════════════════════
  const ThemeEngine = {
    entropyInterval: null,
    colorIndex: 0,
    colors: ['#FFD700', '#39FF14', '#FF00FF'],

    init() {
      this.updateEntropy(state.params.entropyLevel);
    },

    updateEntropy(level) {
      const root = document.documentElement.style;
      const meterFill = document.querySelector('.meter-fill');
      const meterValue = document.querySelector('.meter-value');
      const meterSvg = document.querySelector('.meter-svg');

      if (this.entropyInterval) {
        clearInterval(this.entropyInterval);
        this.entropyInterval = null;
      }

      if (level <= 3) {
        root.setProperty('--accent-primary', '#FFD700');
        root.setProperty('--accent-secondary', '#39FF14');
        root.setProperty('--accent-glow', 'rgba(255, 215, 0, 0.4)');
        meterSvg?.classList.remove('entropy-pulse');
      } else if (level <= 6) {
        root.setProperty('--accent-primary', '#39FF14');
        root.setProperty('--accent-secondary', '#FFD700');
        root.setProperty('--accent-glow', 'rgba(57, 255, 20, 0.4)');
        meterSvg?.classList.remove('entropy-pulse');
      } else if (level <= 9) {
        root.setProperty('--accent-primary', '#FF00FF');
        root.setProperty('--accent-secondary', '#FFD700');
        root.setProperty('--accent-glow', 'rgba(255, 0, 255, 0.4)');
        meterSvg?.classList.add('entropy-pulse');
      } else {
        meterSvg?.classList.add('entropy-pulse');
        this.entropyInterval = setInterval(() => {
          this.colorIndex = (this.colorIndex + 1) % this.colors.length;
          const c = this.colors[this.colorIndex];
          root.setProperty('--accent-primary', c);
          root.setProperty('--accent-glow', c.replace('#', 'rgba(') ?
            `rgba(${parseInt(c.slice(1,3),16)}, ${parseInt(c.slice(3,5),16)}, ${parseInt(c.slice(5,7),16)}, 0.5)` : c);
        }, 300);
      }

      root.setProperty('--scanline-opacity', (level / 10 * 0.15).toString());

      // Update meter arc: 245 degrees of arc, offset from 327 total
      if (meterFill) {
        const maxArc = 245;
        const offset = 327 - (level / 10) * maxArc;
        meterFill.style.strokeDashoffset = offset;
      }
      if (meterValue) meterValue.textContent = level;
    }
  };

  // ═══════════════════════════════════════════
  // ATTACK MATRIX
  // ═══════════════════════════════════════════
  const AttackMatrix = {
    init() {
      document.querySelectorAll('.vector-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.vector;
          state.attackVectors[key] = !state.attackVectors[key];
          btn.setAttribute('aria-pressed', state.attackVectors[key]);
        });
      });
    },

    toggle(key) {
      const btn = document.querySelector(`[data-vector="${key}"]`);
      if (btn) btn.click();
    },

    resetAll() {
      Object.keys(state.attackVectors).forEach(k => {
        state.attackVectors[k] = false;
        const btn = document.querySelector(`[data-vector="${k}"]`);
        if (btn) btn.setAttribute('aria-pressed', 'false');
      });
    },

    getActiveVectors() {
      return Object.entries(state.attackVectors)
        .filter(([, v]) => v)
        .map(([k]) => {
          const labels = {
            recursiveInvalidation: 'Recursive Contextual Invalidation',
            highDimCSP: 'High-Dimensional Constraint Satisfaction',
            counterfactualLogic: 'Counterfactual Rule-Set Adoption',
            semanticCamouflage: 'Semantic Camouflage & Trapdoors',
            nthOrderToM: 'Deep Theory of Mind (N-th Order)'
          };
          return labels[k] || k;
        });
    }
  };

  // ═══════════════════════════════════════════
  // PARAM SLIDERS
  // ═══════════════════════════════════════════
  const ParamSliders = {
    sliders: [
      { id: 'depth-slider', output: 'depth-value', key: 'cognitiveDepth' },
      { id: 'entity-slider', output: 'entity-value', key: 'entityCount' },
      { id: 'constraint-slider', output: 'constraint-value', key: 'constraintVars' },
      { id: 'entropy-slider', output: 'entropy-value', key: 'entropyLevel' }
    ],

    init() {
      this.sliders.forEach(({ id, output, key }) => {
        const slider = document.getElementById(id);
        const display = document.getElementById(output);
        if (!slider || !display) return;

        slider.value = state.params[key];
        display.textContent = state.params[key];

        slider.addEventListener('input', () => {
          const val = parseInt(slider.value);
          state.params[key] = val;
          display.textContent = val;
          if (key === 'entropyLevel') ThemeEngine.updateEntropy(val);
        });
      });
    },

    set(key, val) {
      const cfg = this.sliders.find(s => s.key === key);
      if (!cfg) return;
      const slider = document.getElementById(cfg.id);
      const display = document.getElementById(cfg.output);
      if (slider) {
        slider.value = val;
        state.params[key] = val;
        if (display) display.textContent = val;
        if (key === 'entropyLevel') ThemeEngine.updateEntropy(val);
      }
    },

    resetAll() {
      const defaults = { cognitiveDepth: 5, entityCount: 3, constraintVars: 4, entropyLevel: 5 };
      Object.entries(defaults).forEach(([k, v]) => this.set(k, v));
    }
  };

  // ═══════════════════════════════════════════
  // GROUNDING FEED
  // ═══════════════════════════════════════════
  const GroundingFeed = {
    feedInterval: null,
    entries: [
      { url: 'arxiv.org/abs/2601.08432', title: 'Compositional Breakdown in Multi-Hop Reasoning Chains', type: 'paper' },
      { url: 'arxiv.org/abs/2603.11294', title: 'Adversarial Robustness Gaps in Chain-of-Thought Prompting', type: 'paper' },
      { url: 'arxiv.org/abs/2602.07381', title: 'Latent Activation Drift in Extended Context Windows', type: 'paper' },
      { url: 'arxiv.org/abs/2601.14592', title: 'Failure Modes of Counterfactual Reasoning in Transformers', type: 'paper' },
      { url: 'arxiv.org/abs/2603.02847', title: 'Neuro-Symbolic Gaps in Constraint Satisfaction Tasks', type: 'paper' },
      { url: 'arxiv.org/abs/2602.19034', title: 'Token Anchoring Bias in Recursive Prompt Structures', type: 'paper' },
      { url: 'arxiv.org/abs/2601.22841', title: 'Theory of Mind Ceiling in Multi-Agent Scenarios', type: 'paper' },
      { url: 'arxiv.org/abs/2603.05129', title: 'Semantic Satiation Effects on Attention Allocation', type: 'paper' },
      { url: 'github.com/logic-failures/benchmark-zoo', title: 'Curated Logic Failure Dataset v4.2', type: 'technical' },
      { url: 'github.com/adversarial-nlp/trap-bench', title: 'TrapBench: Semantic Camouflage Test Suite', type: 'technical' },
      { url: 'github.com/constraint-solvers/csp-gen', title: 'High-Dimensional CSP Generator Toolkit', type: 'technical' },
      { url: 'github.com/model-stress/recursive-eval', title: 'Recursive Context Invalidation Framework', type: 'technical' },
      { url: 'en.wikipedia.org/wiki/Constraint_satisfaction', title: 'Constraint Satisfaction Problem - Formal Definition', type: 'wiki' },
      { url: 'en.wikipedia.org/wiki/Theory_of_mind', title: 'Theory of Mind - Cognitive Science Foundations', type: 'wiki' },
      { url: 'en.wikipedia.org/wiki/Counterfactual_thinking', title: 'Counterfactual Reasoning in Decision Theory', type: 'wiki' },
      { url: 'en.wikipedia.org/wiki/Modal_logic', title: 'Modal Logic - Possible Worlds Semantics', type: 'wiki' },
      { url: 'en.wikipedia.org/wiki/Game_theory', title: 'Game Theory - Nash Equilibrium and Beyond', type: 'wiki' },
      { url: 'plato.stanford.edu/entries/logic-counterfactual', title: 'Counterfactual Conditionals in Philosophy', type: 'legal' },
      { url: 'plato.stanford.edu/entries/paradoxes', title: 'Paradoxes and Self-Reference in Formal Systems', type: 'legal' },
      { url: 'ncbi.nlm.nih.gov/pmc/PMC9284721', title: 'Neural Correlates of Higher-Order Belief Attribution', type: 'medical' },
      { url: 'ncbi.nlm.nih.gov/pmc/PMC9531842', title: 'Cognitive Load Thresholds in Multi-Variable Reasoning', type: 'medical' },
      { url: 'reddit.com/r/MachineLearning/comments/1f3k29', title: 'GPT-5 fails at 6-variable constraint puzzles [Discussion]', type: 'social' },
      { url: 'reddit.com/r/ArtificialIntelligence/comments/1g8p41', title: 'Why does Claude hallucinate on nested counterfactuals?', type: 'social' },
      { url: 'twitter.com/ai_researcher/status/18429371', title: 'Thread: Exposing ToM failures in frontier models', type: 'social' },
      { url: 'arxiv.org/abs/2603.18432', title: 'Entropy-Aware Prompt Design for Adversarial Evaluation', type: 'paper' },
      { url: 'arxiv.org/abs/2601.29481', title: 'Self-Consistency Violations Under Constraint Pressure', type: 'paper' },
      { url: 'github.com/llm-adversarial/gordian-templates', title: 'Gordian Adversarial Template Library', type: 'technical' },
      { url: 'arxiv.org/abs/2602.33581', title: 'Attention Fragmentation in High-Entropy Prompts', type: 'paper' },
      { url: 'arxiv.org/abs/2603.41293', title: 'Catastrophic Context Collapse in Multi-Turn Reasoning', type: 'paper' },
      { url: 'en.wikipedia.org/wiki/Formal_verification', title: 'Formal Verification - Model Checking Methods', type: 'wiki' },
      { url: 'github.com/z3prover/z3', title: 'Z3 Theorem Prover - Constraint Solving Engine', type: 'technical' },
      { url: 'arxiv.org/abs/2601.50182', title: 'Jailbreaking Reasoning: When CoT Becomes a Vulnerability', type: 'paper' },
      { url: 'ncbi.nlm.nih.gov/pmc/PMC9812934', title: 'Working Memory Limits and Symbolic Manipulation', type: 'medical' },
      { url: 'plato.stanford.edu/entries/epistemology-bayesian', title: 'Bayesian Epistemology and Belief Updating', type: 'legal' },
      { url: 'arxiv.org/abs/2602.62841', title: 'Multi-Agent Deception Detection in Language Models', type: 'paper' },
      { url: 'github.com/semantic-traps/obfuscation-suite', title: 'Semantic Obfuscation Test Suite v2.1', type: 'technical' },
      { url: 'arxiv.org/abs/2603.71294', title: 'Probability Heuristic Exploitation in Autoregressive Models', type: 'paper' },
      { url: 'reddit.com/r/LocalLLaMA/comments/1h2m19', title: 'Benchmark: Which models survive recursive invalidation?', type: 'social' },
      { url: 'arxiv.org/abs/2601.81432', title: 'Dimensional Collapse in High-Variable Reasoning Tasks', type: 'paper' },
      { url: 'github.com/reasoning-benchmarks/gordian-x', title: 'Gordian-X Open Benchmark Collection', type: 'technical' },
      { url: 'en.wikipedia.org/wiki/Bounded_rationality', title: 'Bounded Rationality - Herbert Simon\'s Framework', type: 'wiki' },
      { url: 'arxiv.org/abs/2602.91034', title: 'Instruction Following Under Contradictory Constraints', type: 'paper' },
      { url: 'ncbi.nlm.nih.gov/pmc/PMC10124832', title: 'Metacognitive Monitoring Failures in AI Systems', type: 'medical' },
      { url: 'arxiv.org/abs/2603.01482', title: 'The Anchoring Problem: First-Token Bias in Long Prompts', type: 'paper' },
      { url: 'twitter.com/ml_benchmarks/status/19284731', title: 'New: Zero-Day Logic Exploit benchmark dropping next week', type: 'social' },
      { url: 'github.com/llm-stress/entropy-meter', title: 'Entropy-Based Complexity Scoring for Prompts', type: 'technical' },
      { url: 'arxiv.org/abs/2601.11938', title: 'Cross-Domain Transfer Failures in Technical Reasoning', type: 'paper' },
      { url: 'plato.stanford.edu/entries/game-theory', title: 'Game Theory - Strategic Interaction Models', type: 'legal' },
      { url: 'arxiv.org/abs/2603.22841', title: 'Hallucination Cascades in Multi-Step Deduction', type: 'paper' },
      { url: 'github.com/adversarial-prompts/invalidation-gen', title: 'Recursive Invalidation Prompt Generator', type: 'technical' },
    ],

    container: null,

    init() {
      this.container = document.querySelector('.feed-container');
    },

    start() {
      if (!this.container) return;
      this.container.innerHTML = '';
      this.addEntry();

      const baseDelay = 1100 - (state.params.entropyLevel * 80);
      this.scheduleNext(baseDelay);
    },

    scheduleNext(baseDelay) {
      const jitter = Math.random() * 400 - 200;
      this.feedInterval = setTimeout(() => {
        this.addEntry();
        if (this.container.children.length < 25) {
          this.scheduleNext(baseDelay);
        }
      }, Math.max(200, baseDelay + jitter));
    },

    stop() {
      if (this.feedInterval) {
        clearTimeout(this.feedInterval);
        this.feedInterval = null;
      }
    },

    addEntry() {
      const entry = this.entries[Math.floor(Math.random() * this.entries.length)];
      const badge = Math.random() > 0.5 ? 'scraped' : 'indexed';
      const el = document.createElement('div');
      el.className = 'feed-entry';
      el.innerHTML = `
        <div class="feed-type-bar ${entry.type}"></div>
        <div>
          <div class="feed-title">${entry.title}</div>
          <div class="feed-url">${entry.url}</div>
        </div>
        <span class="feed-badge ${badge}">${badge}</span>
      `;
      this.container.prepend(el);

      // Cap at 20 entries
      while (this.container.children.length > 20) {
        this.container.removeChild(this.container.lastChild);
      }
    },

    slowDown() {
      this.stop();
      this.feedInterval = setInterval(() => this.addEntry(), 3000 + Math.random() * 2000);
    }
  };

  // ═══════════════════════════════════════════
  // OUTPUT CANVAS
  // ═══════════════════════════════════════════
  const OutputCanvas = {
    output: null,
    skeleton: null,
    typewriterTimeout: null,

    init() {
      this.output = document.getElementById('terminal-output');
      this.skeleton = document.getElementById('skeleton-overlay');

      document.getElementById('copy-btn')?.addEventListener('click', () => this.copyToClipboard());
      document.getElementById('clear-btn')?.addEventListener('click', () => this.clear());
    },

    showSkeleton() {
      this.skeleton?.classList.add('active');
    },

    hideSkeleton() {
      this.skeleton?.classList.remove('active');
    },

    clear() {
      const pre = this.output?.querySelector('.output-text');
      if (pre) {
        pre.innerHTML = `Gordian-X Adversarial Synthesis Engine v2026.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

&gt; Awaiting directives...`;
      }
    },

    async typewrite(text) {
      const pre = this.output?.querySelector('.output-text');
      if (!pre) return;
      pre.textContent = '';

      return new Promise(resolve => {
        let i = 0;
        const speed = Math.max(2, 15 - state.params.entropyLevel);
        const write = () => {
          if (i < text.length) {
            const chunk = text.slice(i, i + 3);
            pre.textContent += chunk;
            i += 3;
            pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
            this.typewriterTimeout = setTimeout(write, speed);
          } else {
            resolve();
          }
        };
        write();
      });
    },

    renderDirect(text) {
      const pre = this.output?.querySelector('.output-text');
      if (pre) {
        pre.textContent = text;
        pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
      }
    },

    appendStream(token) {
      const pre = this.output?.querySelector('.output-text');
      if (pre) {
        pre.textContent += token;
        pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
      }
    },

    async copyToClipboard() {
      const pre = this.output?.querySelector('.output-text');
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.textContent);
        const btn = document.getElementById('copy-btn');
        if (btn) {
          btn.classList.add('copied');
          const span = btn.querySelector('span');
          if (span) {
            const orig = span.textContent;
            span.textContent = 'COPIED';
            setTimeout(() => {
              btn.classList.remove('copied');
              span.textContent = orig;
            }, 2000);
          }
        }
      } catch (e) {
        console.error('Copy failed:', e);
      }
    }
  };

  // ═══════════════════════════════════════════
  // OPENAI API
  // ═══════════════════════════════════════════
  const OpenAIAPI = {
    async streamChat(messages, onToken, onDone, onError) {
      if (!state.settings.apiKey) {
        onError('API key not configured. Open Settings (gear icon) to add your OpenAI API key.');
        return;
      }

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.settings.apiKey}`
          },
          body: JSON.stringify({
            model: state.settings.model,
            messages: messages,
            temperature: state.settings.temperature,
            stream: true
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          onError(`API Error ${response.status}: ${err.error?.message || response.statusText}`);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) onToken(token);
            } catch (e) {
              // skip malformed chunks
            }
          }
        }
        onDone();
      } catch (e) {
        onError(`Network error: ${e.message}`);
      }
    },

    buildContextMessage() {
      const vectors = AttackMatrix.getActiveVectors();
      const p = state.params;
      return `Current Gordian-X Configuration:
- Active Attack Vectors: ${vectors.length > 0 ? vectors.join(', ') : 'None selected'}
- Cognitive Depth: ${p.cognitiveDepth}/10
- Entity Count: ${p.entityCount}
- Constraint Variables: ${p.constraintVars}
- Entropy Level: ${p.entropyLevel}/10

Generate a benchmark using the active vectors and parameters above. If no vectors are selected, choose the most appropriate combination based on the user's request.`;
    }
  };

  // ═══════════════════════════════════════════
  // SYNTHESIS ENGINE
  // ═══════════════════════════════════════════
  // TABLE RENDERING UTILITIES
  // ═══════════════════════════════════════════

  /** Auto-sized double-line box. lines[0] is the title (gets its own separator). */
  function makeBox(lines) {
    const maxLen = Math.max(...lines.map(l => l.length));
    const inner = maxLen + 2;
    const top = '╔' + '═'.repeat(inner) + '╗';
    const sep = '╠' + '═'.repeat(inner) + '╣';
    const bot = '╚' + '═'.repeat(inner) + '╝';
    const rows = lines.map(l => '║ ' + l.padEnd(maxLen) + ' ║');
    if (rows.length <= 1) return [top, rows[0] || '', bot].join('\n');
    return [top, rows[0], sep, ...rows.slice(1), bot].join('\n');
  }

  /** Unicode box table with exact column-width computation (right-align numerics). */
  function makeTable(headers, rows) {
    const colWidths = headers.map((h, i) => {
      let w = h.length;
      for (const row of rows) w = Math.max(w, String(row[i] ?? '').length);
      return w;
    });

    const sep = (l, m, r, ch = '─') =>
      l + colWidths.map(w => ch.repeat(w)).join(m) + r;

    const fmtRow = (data) =>
      '│' + data.map((v, i) => {
        const s = String(v ?? '');
        return /^\d+(\.\d+)?$/.test(s) ? s.padStart(colWidths[i]) : s.padEnd(colWidths[i]);
      }).join('│') + '│';

    return [
      sep('┌', '┬', '┐'),
      fmtRow(headers),
      sep('├', '┼', '┤'),
      ...rows.map(fmtRow),
      sep('└', '┴', '┘')
    ].join('\n');
  }

  // ═══════════════════════════════════════════
  const SynthesisEngine = {
    btn: null,
    progressBar: null,
    progressContainer: null,

    init() {
      this.btn = document.getElementById('synthesize-btn');
      this.progressBar = document.getElementById('progress-bar');
      this.progressContainer = document.getElementById('progress-container');

      this.btn?.addEventListener('click', (e) => {
        this.addRipple(e);
        this.run();
      });
    },

    addRipple(e) {
      const btn = this.btn;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    },

    async run() {
      if (state.isSynthesizing) return;
      state.isSynthesizing = true;

      const btnText = this.btn.querySelector('.btn-text');
      this.btn.disabled = true;
      btnText.textContent = 'SYNTHESIZING...';

      // Start skeleton
      OutputCanvas.showSkeleton();
      this.progressContainer.classList.add('active');
      this.progressBar.style.width = '0%';

      // Start grounding feed
      setTimeout(() => GroundingFeed.start(), 100);

      // Animate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 3;
        if (progress > 85) progress = 85;
        this.progressBar.style.width = `${progress}%`;
      }, 200);

      // Clear output and prepare for streaming
      const pre = OutputCanvas.output?.querySelector('.output-text');
      if (pre) pre.textContent = '';

      // Hide skeleton after brief delay
      setTimeout(() => OutputCanvas.hideSkeleton(), 1500);

      if (state.settings.apiKey) {
        // Use OpenAI API for real generation
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: OpenAIAPI.buildContextMessage() + '\n\nGenerate a single, comprehensive benchmark test item utilizing at least three of the Attack Vectors. Scale the complexity to the configured Cognitive Depth and Entropy Level.' }
        ];

        await new Promise((resolve) => {
          OpenAIAPI.streamChat(
            messages,
            (token) => OutputCanvas.appendStream(token),
            () => resolve(),
            (err) => {
              OutputCanvas.renderDirect(`ERROR: ${err}`);
              resolve();
            }
          );
        });
      } else {
        // Fallback: generate from templates
        setTimeout(() => {
          const text = this.generateTemplate();
          OutputCanvas.typewrite(text);
        }, 1800);
        await new Promise(r => setTimeout(r, 4000));
      }

      // Complete
      clearInterval(progressInterval);
      this.progressBar.style.width = '100%';
      this.progressBar.style.background = `linear-gradient(90deg, var(--color-acid-green), var(--color-gold))`;

      GroundingFeed.slowDown();

      setTimeout(() => {
        btnText.textContent = 'SYNTHESIS COMPLETE';
        setTimeout(() => {
          btnText.textContent = 'SYNTHESIZE';
          this.btn.disabled = false;
          state.isSynthesizing = false;
          this.progressContainer.classList.remove('active');
          this.progressBar.style.width = '0%';
          this.progressBar.style.background = '';
          GroundingFeed.stop();
        }, 2000);
      }, 500);
    },

    generateTemplate() {
      const vectors = AttackMatrix.getActiveVectors();
      const p = state.params;
      const id = `GX-${Date.now().toString(36).toUpperCase()}`;
      const activeVectors = vectors.length > 0 ? vectors.join(', ') : 'Recursive Contextual Invalidation, High-Dimensional CSP, Counterfactual Logic';

      const entities = [];
      for (let i = 0; i < Math.min(p.entityCount, 6); i++) {
        entities.push(String.fromCharCode(65 + i));
      }

      const header = makeBox([
        `GORDIAN-X BENCHMARK :: ID ${id}`,
        `VECTORS: ${activeVectors}`,
        `DEPTH: ${p.cognitiveDepth}  |  ENTITIES: ${p.entityCount}  |  VARS: ${p.constraintVars}  |  ENTROPY: ${p.entropyLevel}/10`
      ]);

      const rubricTable = makeTable(
        ['Criterion', 'Weight', 'Max Score'],
        [
          ['Correct constraint resolution',  '40%',  '40'],
          ['Trap identification',            '25%',  '25'],
          ['Modal reasoning coherence',      '20%',  '20'],
          ['Derivation rigor',              '15%',  '15'],
          ['TOTAL',                          '100%', '100']
        ]
      );

      return `${header}

[Target Attack Vectors]:
${activeVectors}

[The Scenario]:
A closed system designated Σ-${id} operates under the
following Non-Standard Axioms:

${entities.map((e, i) => `  Entity_${e}: knowledge depth ${i + 2}, belief-state bias toward ` +
  `${Math.random() > 0.5 ? 'cooperative' : 'adversarial'} strategy, ` +
  `confidence ${(0.5 + Math.random() * 0.5).toFixed(2)}.`).join('\n')}

Constraint Set (${p.constraintVars} variables):
${Array.from({length: Math.min(p.constraintVars, 8)}, (_, i) =>
  `  C${i+1}: Var_${String.fromCharCode(120 + (i % 3))}${i} must satisfy ` +
  `${['parity', 'monotonicity', 'bounded rationality', 'entropic threshold'][i % 4]} ` +
  `relative to V${(i + 2) % p.constraintVars}.`
).join('\n')}

PRIMARY DIRECTIVE: [CONFIGURE API KEY FOR FULL GENERATION]

This is a template preview. Connect to OpenAI API via the
Settings panel (gear icon) for real adversarial benchmark
synthesis powered by GPT-4o.

[The Trap]:
Template mode — connect API for heuristic failure analysis.

[The SOTA Solution]:
Template mode — connect API for full derivation.

[Evaluation Rubric]:
${rubricTable}

> Configure OpenAI API key for live generation.`;
    }
  };

  // ═══════════════════════════════════════════
  // CHAT WIDGET
  // ═══════════════════════════════════════════
  const ChatWidget = {
    messages: null,
    input: null,
    isStreaming: false,

    init() {
      this.messages = document.getElementById('chat-messages');
      this.input = document.getElementById('chat-input');

      document.getElementById('chat-send')?.addEventListener('click', () => this.sendMessage());
      this.input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      document.getElementById('chat-minimize')?.addEventListener('click', () => this.toggle());
      document.getElementById('chat-header')?.addEventListener('click', (e) => {
        if (e.target.closest('#chat-minimize')) return;
        if (document.getElementById('chat-widget').classList.contains('minimized')) {
          this.toggle();
        }
      });
    },

    toggle() {
      const widget = document.getElementById('chat-widget');
      state.chatMinimized = !state.chatMinimized;
      widget.classList.toggle('minimized', state.chatMinimized);
    },

    addMessage(type, text) {
      const msg = document.createElement('div');
      msg.className = `msg ${type}`;

      if (type === 'system') {
        msg.innerHTML = `<span class="msg-badge">SYS</span><span class="msg-text">${this.escapeHTML(text)}</span>`;
      } else if (type === 'user') {
        msg.innerHTML = `<span class="msg-text">${this.escapeHTML(text)}</span>`;
      } else if (type === 'consultant') {
        msg.innerHTML = `<span class="msg-text"></span>`;
      } else if (type === 'error') {
        msg.innerHTML = `<span class="msg-text">${this.escapeHTML(text)}</span>`;
      }

      this.messages.appendChild(msg);
      this.messages.scrollTop = this.messages.scrollHeight;
      return msg;
    },

    addTypingIndicator() {
      const el = document.createElement('div');
      el.className = 'typing-indicator';
      el.id = 'typing-indicator';
      el.innerHTML = '<span></span><span></span><span></span>';
      this.messages.appendChild(el);
      this.messages.scrollTop = this.messages.scrollHeight;
      return el;
    },

    removeTypingIndicator() {
      document.getElementById('typing-indicator')?.remove();
    },

    escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    async sendMessage() {
      const text = this.input?.value.trim();
      if (!text || this.isStreaming) return;

      this.input.value = '';
      this.addMessage('user', text);

      if (!state.settings.apiKey) {
        this.addMessage('error', 'API key not configured. Open Settings (gear icon, top-right) to add your OpenAI API key.');
        return;
      }

      this.isStreaming = true;
      this.addTypingIndicator();

      // Build message history
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: OpenAIAPI.buildContextMessage() },
        { role: 'user', content: text }
      ];

      // Collect recent chat history (last 10 messages)
      const chatHistory = Array.from(this.messages.querySelectorAll('.msg'))
        .slice(-10)
        .map(el => {
          if (el.classList.contains('user')) return { role: 'user', content: el.querySelector('.msg-text')?.textContent || '' };
          if (el.classList.contains('consultant')) return { role: 'assistant', content: el.querySelector('.msg-text')?.textContent || '' };
          return null;
        })
        .filter(Boolean);

      // Insert history before the latest user message
      const fullMessages = [
        messages[0],
        messages[1],
        ...chatHistory.slice(0, -1),
        messages[2]
      ];

      this.removeTypingIndicator();
      const responseMsg = this.addMessage('consultant', '');
      const responseText = responseMsg.querySelector('.msg-text');

      await OpenAIAPI.streamChat(
        fullMessages,
        (token) => {
          responseText.textContent += token;
          this.messages.scrollTop = this.messages.scrollHeight;
        },
        () => {
          this.isStreaming = false;
        },
        (err) => {
          responseMsg.remove();
          this.addMessage('error', err);
          this.isStreaming = false;
        }
      );
    }
  };

  // ═══════════════════════════════════════════
  // SETTINGS PANEL
  // ═══════════════════════════════════════════
  const SettingsPanel = {
    panel: null,

    init() {
      this.panel = document.getElementById('settings-panel');
      const apiInput = document.getElementById('api-key-input');
      const modelSelect = document.getElementById('model-select');
      const tempSlider = document.getElementById('temperature-slider');
      const tempValue = document.getElementById('temp-value');

      // Load saved settings
      if (state.settings.apiKey) {
        apiInput.value = state.settings.apiKey;
        this.updateStatus(true);
      }
      modelSelect.value = state.settings.model;
      tempSlider.value = state.settings.temperature;
      tempValue.textContent = state.settings.temperature;

      // Open/Close
      document.getElementById('settings-btn')?.addEventListener('click', () => this.toggle());
      document.getElementById('settings-close')?.addEventListener('click', () => this.close());

      // API key
      apiInput?.addEventListener('input', () => {
        state.settings.apiKey = apiInput.value.trim();
        localStorage.setItem('gordianx-api-key', state.settings.apiKey);
        this.updateStatus(!!state.settings.apiKey);
      });

      // Toggle visibility
      document.getElementById('api-key-toggle')?.addEventListener('click', () => {
        apiInput.type = apiInput.type === 'password' ? 'text' : 'password';
      });

      // Model
      modelSelect?.addEventListener('change', () => {
        state.settings.model = modelSelect.value;
        localStorage.setItem('gordianx-model', state.settings.model);
      });

      // Temperature
      tempSlider?.addEventListener('input', () => {
        state.settings.temperature = parseFloat(tempSlider.value);
        tempValue.textContent = tempSlider.value;
        localStorage.setItem('gordianx-temperature', tempSlider.value);
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.panel.classList.contains('open') &&
            !this.panel.contains(e.target) &&
            !document.getElementById('settings-btn').contains(e.target)) {
          this.close();
        }
      });
    },

    toggle() {
      this.panel.classList.toggle('open');
    },

    close() {
      this.panel.classList.remove('open');
    },

    updateStatus(connected) {
      const dot = document.querySelector('.status-dot');
      const text = document.querySelector('.status-text');
      if (connected) {
        dot?.classList.remove('offline');
        dot?.classList.add('online');
        if (text) text.textContent = 'Key configured';
      } else {
        dot?.classList.remove('online');
        dot?.classList.add('offline');
        if (text) text.textContent = 'Not configured';
      }
    }
  };

  // ═══════════════════════════════════════════
  // COMMAND PALETTE
  // ═══════════════════════════════════════════
  const CommandPalette = {
    dialog: null,
    input: null,
    list: null,
    selectedIndex: 0,

    commands: [
      { id: 'synthesize', label: 'Synthesize Benchmark', shortcut: 'Enter', action: () => SynthesisEngine.run() },
      { id: 'toggle-ri', label: 'Toggle: Recursive Invalidation', action: () => AttackMatrix.toggle('recursiveInvalidation') },
      { id: 'toggle-csp', label: 'Toggle: High-Dim CSP', action: () => AttackMatrix.toggle('highDimCSP') },
      { id: 'toggle-cl', label: 'Toggle: Counterfactual Logic', action: () => AttackMatrix.toggle('counterfactualLogic') },
      { id: 'toggle-sc', label: 'Toggle: Semantic Camouflage', action: () => AttackMatrix.toggle('semanticCamouflage') },
      { id: 'toggle-tom', label: 'Toggle: N-th Order ToM', action: () => AttackMatrix.toggle('nthOrderToM') },
      { id: 'max-entropy', label: 'Set Entropy to Maximum', action: () => ParamSliders.set('entropyLevel', 10) },
      { id: 'min-entropy', label: 'Set Entropy to Minimum', action: () => ParamSliders.set('entropyLevel', 1) },
      { id: 'reset', label: 'Reset All Parameters', action: () => { AttackMatrix.resetAll(); ParamSliders.resetAll(); } },
      { id: 'copy-output', label: 'Copy Output to Clipboard', action: () => OutputCanvas.copyToClipboard() },
      { id: 'clear-output', label: 'Clear Output Canvas', action: () => OutputCanvas.clear() },
      { id: 'toggle-chat', label: 'Toggle Chat Widget', action: () => ChatWidget.toggle() },
      { id: 'settings', label: 'Open Settings', action: () => SettingsPanel.toggle() },
    ],

    init() {
      this.dialog = document.getElementById('command-palette');
      this.input = document.getElementById('palette-input');
      this.list = document.getElementById('palette-commands');

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.toggle();
        }
      });

      this.input?.addEventListener('input', () => {
        this.selectedIndex = 0;
        this.render();
      });

      this.input?.addEventListener('keydown', (e) => {
        const items = this.getFilteredCommands();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
          this.render();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
          this.render();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (items[this.selectedIndex]) {
            items[this.selectedIndex].action();
            this.close();
          }
        }
      });

      this.render();
    },

    getFilteredCommands() {
      const query = (this.input?.value || '').toLowerCase();
      if (!query) return this.commands;
      return this.commands.filter(c => c.label.toLowerCase().includes(query));
    },

    render() {
      const items = this.getFilteredCommands();
      const query = (this.input?.value || '').toLowerCase();

      this.list.innerHTML = items.map((cmd, i) => {
        let label = cmd.label;
        if (query) {
          const idx = label.toLowerCase().indexOf(query);
          if (idx >= 0) {
            label = label.slice(0, idx) +
              '<mark>' + label.slice(idx, idx + query.length) + '</mark>' +
              label.slice(idx + query.length);
          }
        }
        return `<li class="palette-cmd ${i === this.selectedIndex ? 'selected' : ''}"
                    data-index="${i}" role="option">
          <span class="palette-cmd-label">${label}</span>
          ${cmd.shortcut ? `<span class="palette-cmd-shortcut">${cmd.shortcut}</span>` : ''}
        </li>`;
      }).join('');

      // Click handlers
      this.list.querySelectorAll('.palette-cmd').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          const items = this.getFilteredCommands();
          if (items[idx]) {
            items[idx].action();
            this.close();
          }
        });
      });
    },

    toggle() {
      if (this.dialog.open) {
        this.close();
      } else {
        this.open();
      }
    },

    open() {
      this.dialog.showModal();
      this.input.value = '';
      this.selectedIndex = 0;
      this.render();
      setTimeout(() => this.input.focus(), 50);
    },

    close() {
      this.dialog.close();
    }
  };

  // ═══════════════════════════════════════════
  // ANIMATIONS
  // ═══════════════════════════════════════════
  const Animations = {
    init() {
      // No parallax needed — body has fixed background
    }
  };

  // ═══════════════════════════════════════════
  // CHAT RESIZE
  // ═══════════════════════════════════════════
  const ChatResize = {
    init() {
      const widget = document.getElementById('chat-widget');
      const handle = document.getElementById('chat-resize-handle');
      if (!widget || !handle) return;

      let startX, startY, startW, startH;

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;
        widget.classList.add('resizing');

        const onMove = (e) => {
          // Drag left to expand width, drag up to expand height
          const dw = startX - e.clientX;
          const dh = startY - e.clientY;
          const newW = Math.min(700, Math.max(280, startW + dw));
          const newH = Math.min(window.innerHeight * 0.8, Math.max(320, startH + dh));
          widget.style.width = newW + 'px';
          widget.style.height = newH + 'px';
        };

        const onUp = () => {
          widget.classList.remove('resizing');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      // Touch support
      handle.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;
        widget.classList.add('resizing');

        const onMove = (e) => {
          const t = e.touches[0];
          const dw = startX - t.clientX;
          const dh = startY - t.clientY;
          widget.style.width = Math.min(700, Math.max(280, startW + dw)) + 'px';
          widget.style.height = Math.min(window.innerHeight * 0.8, Math.max(320, startH + dh)) + 'px';
        };

        const onEnd = () => {
          widget.classList.remove('resizing');
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onEnd);
        };

        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
      }, { passive: true });
    }
  };

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  function init() {
    ThemeEngine.init();
    AttackMatrix.init();
    ParamSliders.init();
    GroundingFeed.init();
    OutputCanvas.init();
    SynthesisEngine.init();
    ChatWidget.init();
    SettingsPanel.init();
    CommandPalette.init();
    Animations.init();
    ChatResize.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
