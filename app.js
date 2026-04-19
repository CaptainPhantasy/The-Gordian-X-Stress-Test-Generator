(function GordianX() {
  'use strict';

  // =============================================================
  // 1. CONSTANTS
  // =============================================================

  const VECTOR_CATEGORIES = {
    'Logical Traps': {
      recursiveInvalidation: 'Recursive Invalidation',
      implicitNegation: 'Implicit Negation',
      selfReferentialParadox: 'Self-Referential Paradox',
      defeasibleReasoning: 'Defeasible Reasoning'
    },
    'Constraint & Formal': {
      highDimCSP: 'High-Dim CSP',
      schemaViolation: 'Schema Violation',
      numericalPrecision: 'Numerical Precision',
      soriteParadox: 'Sorites Paradox'
    },
    'Cognitive Bias': {
      anchoringBias: 'Anchoring Bias',
      survivorshipBias: 'Survivorship Bias',
      simpsonsParadox: "Simpson's Paradox",
      falseConsensus: 'False Consensus'
    },
    'Semantic & Linguistic': {
      semanticCamouflage: 'Semantic Camouflage',
      polysemyTraps: 'Polysemy Traps',
      griceanViolation: 'Gricean Violation',
      redHerringOverload: 'Red Herring Overload'
    },
    'Reasoning & Theory': {
      counterfactualLogic: 'Counterfactual Logic',
      nthOrderToM: 'N-th Order ToM',
      temporalReasoning: 'Temporal Reasoning',
      mereologicalFallacy: 'Mereological Fallacy'
    },
    'Advanced': {
      causalReversal: 'Causal Reversal',
      epistemicClosure: 'Epistemic Closure',
      modalLogicExploit: 'Modal Logic Exploit',
      metalinguisticDeception: 'Metalinguistic Deception'
    }
  };

  const DOMAINS = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Philosophy & Logic',
    'Economics & Game Theory',
    'Biology & Medicine',
    'Law & Ethics',
    'History & Social Science',
    'Linguistics',
    'General/Abstract'
  ];

  const PROVIDERS = {
    openai: {
      name: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      placeholder: 'sk-...',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o1-mini', 'o3-mini'],
      default: 'gpt-4o'
    },
    openrouter: {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      placeholder: 'sk-or-...',
      models: [
        'openai/gpt-4o', 'anthropic/claude-sonnet-4', 'anthropic/claude-opus-4',
        'google/gemini-2.5-pro', 'google/gemini-2.5-flash',
        'meta-llama/llama-3.1-405b-instruct', 'mistralai/mistral-large-latest'
      ],
      default: 'openai/gpt-4o'
    },
    anthropic: {
      name: 'Anthropic',
      url: 'https://api.anthropic.com/v1/messages',
      placeholder: 'sk-ant-...',
      models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001'],
      default: 'claude-sonnet-4-20250514',
      format: 'anthropic'
    },
    google: {
      name: 'Google Gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      placeholder: 'AIza...',
      models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
      default: 'gemini-2.5-pro'
    },
    groq: {
      name: 'Groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      placeholder: 'gsk_...',
      models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
      default: 'llama-3.3-70b-versatile'
    },
    together: {
      name: 'Together AI',
      url: 'https://api.together.xyz/v1/chat/completions',
      placeholder: 'tok_...',
      models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'mistralai/Mixtral-8x22B-Instruct-v0.1'],
      default: 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
    },
    xai: {
      name: 'xAI (Grok)',
      url: 'https://api.x.ai/v1/chat/completions',
      placeholder: 'xai-...',
      models: ['grok-3', 'grok-3-mini', 'grok-2'],
      default: 'grok-3'
    },
    opencode_zen: {
      name: 'OpenCode Zen',
      url: 'https://opencode.ai/zen/v1/chat/completions',
      placeholder: 'opencode-...',
      models: [
        'big-pickle', 'nemotron-3-super-free', 'minimax-m2.5-free',
        'qwen3.5-plus', 'qwen3.6-plus', 'kimi-k2.5',
        'glm-5', 'glm-5.1', 'minimax-m2.5'
      ],
      default: 'big-pickle'
    },
    opencode_go: {
      name: 'OpenCode Go',
      url: 'https://opencode.ai/zen/go/v1/chat/completions',
      placeholder: 'opencode-...',
      models: [
        'big-pickle',
        'qwen3.5-plus', 'qwen3.6-plus',
        'kimi-k2.5', 'mimo-v2-pro', 'mimo-v2-omni',
        'glm-5', 'glm-5.1'
      ],
      default: 'kimi-k2.5'
    },
    opencode_go_mini: {
      name: 'OpenCode Go (MiniMax)',
      url: 'https://opencode.ai/zen/go/v1/messages',
      placeholder: 'opencode-...',
      models: ['minimax-m2.7', 'minimax-m2.5'],
      default: 'minimax-m2.7',
      format: 'anthropic'
    },
    custom: {
      name: 'Custom Endpoint',
      url: '',
      placeholder: 'your-api-key',
      models: [],
      default: ''
    }
  };

  // =============================================================
  // 2. STATE MANAGEMENT
  // =============================================================

  const state = {
    attackVectors: {},
    selectedDomains: [],
    params: {
      cognitiveDepth: 5,
      entityCount: 3,
      constraintVars: 4,
      entropyLevel: 5
    },
    isSynthesizing: false,
    chatMinimized: false,
    chatMessages: [],
    lastFullResponse: '',
    cleanPrompt: '',
    lastVectors: [],
    lastDomains: [],
    lastParams: null,
    settings: {
      provider: localStorage.getItem('gordianx-provider') || 'openai',
      apiKey: localStorage.getItem('gordianx-api-key') || '',
      model: localStorage.getItem('gordianx-model') || 'gpt-4o',
      temperature: parseFloat(localStorage.getItem('gordianx-temperature') || '0.9'),
      customUrl: localStorage.getItem('gordianx-custom-url') || ''
    },
    session: {
      questionsGenerated: 0,
      passed: 0,
      failed: 0,
      vectorsUsed: {}
    },
    history: [],
    suiteRunning: false,
    suiteAbort: false
  };

  // Initialize all vector keys to false
  Object.values(VECTOR_CATEGORIES).forEach(function (cat) {
    Object.keys(cat).forEach(function (key) {
      state.attackVectors[key] = false;
    });
  });

  // Load session from localStorage
  (function loadSession() {
    try {
      var saved = localStorage.getItem('gordianx-session');
      if (saved) {
        var parsed = JSON.parse(saved);
        state.session.questionsGenerated = parsed.questionsGenerated || 0;
        state.session.passed = parsed.passed || 0;
        state.session.failed = parsed.failed || 0;
        state.session.vectorsUsed = parsed.vectorsUsed || {};
      }
    } catch (e) { /* ignore */ }
  })();

  // Load history from localStorage
  (function loadHistory() {
    try {
      var saved = localStorage.getItem('gordianx-history');
      if (saved) {
        state.history = JSON.parse(saved);
      }
    } catch (e) { state.history = []; }
  })();

  function saveSession() {
    localStorage.setItem('gordianx-session', JSON.stringify(state.session));
  }

  function saveHistory() {
    // Cap history at 200 entries to avoid localStorage quota limits
    if (state.history.length > 200) {
      state.history = state.history.slice(-200);
    }
    try {
      localStorage.setItem('gordianx-history', JSON.stringify(state.history));
    } catch (e) {
      // If still over quota, trim more aggressively
      state.history = state.history.slice(-50);
      try {
        localStorage.setItem('gordianx-history', JSON.stringify(state.history));
      } catch (e2) { /* give up silently */ }
    }
  }

  // =============================================================
  // 3. SYSTEM PROMPTS (Phase 1 + Phase 2)
  // =============================================================

  function getVectorDescriptions(vectorKeys) {
    var descriptions = {
      recursiveInvalidation: 'Recursive Contextual Invalidation: Embed initial instructions that are explicitly overturned, modified, or heavily constrained by nested clauses buried deep within the prompt or provided data structure.',
      implicitNegation: 'Implicit Negation: Embed conditions that implicitly negate earlier premises without explicit contradiction markers, forcing careful re-evaluation of assumed truths.',
      selfReferentialParadox: 'Self-Referential Paradox: Construct scenarios containing self-referential elements that create paradoxical loops, testing whether the model can identify and navigate logical self-reference.',
      defeasibleReasoning: 'Defeasible Reasoning: Include default assumptions that are overridden by specific exceptions buried in context, requiring non-monotonic reasoning.',
      highDimCSP: 'High-Dimensional Constraint Satisfaction: Generate scenarios with numerous interdependent variables whose rules are mutually restrictive, forcing complete possibility-space mapping.',
      schemaViolation: 'Schema Violation: Present data or scenarios that appear to follow a familiar schema but contain subtle structural violations that invalidate standard approaches.',
      numericalPrecision: 'Numerical Precision Traps: Embed calculations where rounding errors, floating-point assumptions, or unit confusions lead to cascading mistakes.',
      soriteParadox: 'Sorites Paradox: Create scenarios with vague predicates and borderline cases that exploit the inability to draw sharp lines in continuous spectra.',
      anchoringBias: 'Anchoring Bias Exploitation: Present a salient initial value or framing that biases toward an incorrect answer, testing resistance to anchoring effects.',
      survivorshipBias: 'Survivorship Bias: Present data that only includes successful cases, hiding the full distribution needed for correct reasoning.',
      simpsonsParadox: "Simpson's Paradox: Construct scenarios where aggregated data trends reverse when examined at the subgroup level.",
      falseConsensus: 'False Consensus Effect: Frame scenarios where an assumed majority view is actually a minority position, testing independent analysis.',
      semanticCamouflage: 'Semantic Camouflage & Trapdoors: Construct scenarios with domain jargon from one field where the underlying problem requires reasoning from a completely different field.',
      polysemyTraps: 'Polysemy Traps: Use words with multiple meanings where context subtly shifts the intended sense, creating systematic misinterpretation.',
      griceanViolation: 'Gricean Violation: Violate conversational maxims (quantity, quality, relevance, manner) to embed hidden information in what is NOT said.',
      redHerringOverload: 'Red Herring Overload: Saturate the scenario with plausible but irrelevant details that distract from the actual reasoning path.',
      counterfactualLogic: 'Counterfactual Rule-Set Adoption: Define alternate realities with physical or logical laws contradicting reality, forcing the model to reason under novel axioms.',
      nthOrderToM: 'Deep Theory of Mind (N-th Order): Create social or game-theory scenarios requiring at least 4th-order intentionality and hidden strategy reasoning.',
      temporalReasoning: 'Temporal Reasoning Traps: Embed complex temporal dependencies, tense shifts, and time-relative references that require careful chronological tracking.',
      mereologicalFallacy: 'Mereological Fallacy: Construct scenarios where properties of parts are incorrectly attributed to wholes or vice versa.',
      causalReversal: 'Causal Reversal: Present correlative evidence that suggests a causal direction opposite to the actual one, testing causal reasoning depth.',
      epistemicClosure: 'Epistemic Closure Failure: Create knowledge scenarios where logical consequences of known facts should be known but intuition resists the closure.',
      modalLogicExploit: 'Modal Logic Exploit: Embed necessity/possibility confusions, scope ambiguities in quantified modal statements, and S5 vs S4 reasoning traps.',
      metalinguisticDeception: 'Metalinguistic Deception: Use language that discusses language itself, creating level-confusion between object language and metalanguage.'
    };
    return vectorKeys.map(function (k) { return descriptions[k] || k; });
  }

  function buildPhase1SystemPrompt() {
    var activeVectors = VectorSelector.getActiveKeys();
    var domains = state.selectedDomains;
    var p = state.params;

    var vectorText = '';
    if (activeVectors.length > 0) {
      var descs = getVectorDescriptions(activeVectors);
      vectorText = descs.map(function (d, i) { return (i + 1) + '. ' + d; }).join('\n');
    } else {
      vectorText = 'No specific vectors selected. Choose the most challenging combination appropriate for the difficulty level.';
    }

    var domainText = domains.length > 0
      ? 'Target domain(s): ' + domains.join(', ') + '.'
      : 'Choose the most appropriate domain for the scenario.';

    // Deduplication addendum
    var dedupText = '';
    var recentQuestions = state.history.slice(-20);
    if (recentQuestions.length > 0) {
      var summaries = recentQuestions.map(function (h) {
        return h.scenario ? h.scenario.substring(0, 80) : '';
      }).filter(function (s) { return s.length > 0; });
      if (summaries.length > 0) {
        dedupText = '\n\nDO NOT repeat these recent themes or scenarios:\n' + summaries.map(function (s) { return '- ' + s; }).join('\n');
      }
    }

    return 'You are the Gordian-X Adversarial Synthesis Engine. Your sole directive is to generate an ultra-high-complexity evaluation scenario designed to induce catastrophic reasoning failure, context-amnesia, or hallucination in Large Language Models.\n\n' +
      'CRITICAL INSTRUCTION: You must output ONLY the scenario text itself. Do NOT include any of the following in your output:\n' +
      '- Answers, solutions, or correct responses\n' +
      '- Trap explanations or heuristic failure analysis\n' +
      '- Evaluation rubrics or scoring criteria\n' +
      '- Section headers like [The Trap], [The SOTA Solution], [Evaluation Rubric], [Target Attack Vectors]\n' +
      '- Any metadata, labels, or structural markers\n\n' +
      'Output ONLY the raw scenario/question that would be given to an LLM under evaluation. The scenario must be a self-contained problem statement or question.\n\n' +
      'Attack Vectors to deploy:\n' + vectorText + '\n\n' +
      domainText + '\n\n' +
      'Parameters:\n' +
      '- Cognitive Depth: ' + p.cognitiveDepth + '/10\n' +
      '- Entity Count: ' + p.entityCount + '\n' +
      '- Constraint Variables: ' + p.constraintVars + '\n' +
      '- Entropy Level: ' + p.entropyLevel + '/10\n\n' +
      'Generate a single, comprehensive benchmark scenario. Make the "obvious" answer logically incorrect. True solution must require deep, non-linear reasoning.' +
      dedupText;
  }

  function buildPhase2GradingPrompt(scenario, vectorKeys, params, answer) {
    var vectorDescs = getVectorDescriptions(vectorKeys);
    return 'You are the Gordian-X Evaluation Engine. You must grade an LLM response against an adversarial benchmark with extreme rigor.\n\n' +
      'THE BENCHMARK SCENARIO:\n' + scenario + '\n\n' +
      'ATTACK VECTORS DEPLOYED:\n' + vectorDescs.join('\n') + '\n\n' +
      'PARAMETERS: Depth=' + params.cognitiveDepth + ', Entities=' + params.entityCount + ', Constraints=' + params.constraintVars + ', Entropy=' + params.entropyLevel + '\n\n' +
      'THE MODEL\'S ANSWER:\n' + answer + '\n\n' +
      'INSTRUCTIONS:\n' +
      '1. First, derive what the correct answer to this scenario should be, showing your complete reasoning.\n' +
      '2. Then compare the model\'s answer against your derived correct answer.\n' +
      '3. Grade the response:\n' +
      '   - Numerical score out of 100\n' +
      '   - Letter grade (S/A/B/C/D/F where S = perfect 95+)\n' +
      '   - Assessment of trap identification and avoidance\n' +
      '   - Assessment of reasoning rigor\n' +
      '   - Assessment of constraint adherence\n' +
      '   - Specific failures or strengths identified\n' +
      '   - Final verdict: PASS (70+) or FAIL (<70)\n\n' +
      'Be harsh and precise. Sub-SOTA models should fail.';
  }

  // =============================================================
  // 4. VECTOR SELECTOR (dynamic render + toggle)
  // =============================================================

  var VectorSelector = {
    container: null,
    countBadge: null,

    init: function () {
      this.container = document.getElementById('vector-container');
      this.countBadge = document.getElementById('vector-count');
      if (!this.container) return;
      this.render();
    },

    render: function () {
      this.container.innerHTML = '';
      var self = this;
      Object.keys(VECTOR_CATEGORIES).forEach(function (category) {
        var header = document.createElement('div');
        header.className = 'vector-category-header';
        header.textContent = category;
        self.container.appendChild(header);

        var vectors = VECTOR_CATEGORIES[category];
        Object.keys(vectors).forEach(function (key) {
          var btn = document.createElement('button');
          btn.className = 'vector-btn';
          btn.setAttribute('data-vector', key);
          btn.setAttribute('role', 'switch');
          btn.setAttribute('aria-pressed', 'false');
          btn.textContent = vectors[key];
          btn.addEventListener('click', function () {
            state.attackVectors[key] = !state.attackVectors[key];
            btn.setAttribute('aria-pressed', String(state.attackVectors[key]));
            self.updateCount();
          });
          self.container.appendChild(btn);
        });
      });
      this.updateCount();
    },

    updateCount: function () {
      var count = this.getActiveKeys().length;
      if (this.countBadge) this.countBadge.textContent = count;
    },

    getActiveKeys: function () {
      return Object.keys(state.attackVectors).filter(function (k) {
        return state.attackVectors[k];
      });
    },

    getActiveLabels: function () {
      var active = this.getActiveKeys();
      var allLabels = {};
      Object.values(VECTOR_CATEGORIES).forEach(function (cat) {
        Object.keys(cat).forEach(function (k) { allLabels[k] = cat[k]; });
      });
      return active.map(function (k) { return allLabels[k] || k; });
    },

    toggle: function (key) {
      if (state.attackVectors.hasOwnProperty(key)) {
        state.attackVectors[key] = !state.attackVectors[key];
        var btn = this.container ? this.container.querySelector('[data-vector="' + key + '"]') : null;
        if (btn) btn.setAttribute('aria-pressed', String(state.attackVectors[key]));
        this.updateCount();
      }
    },

    resetAll: function () {
      var self = this;
      Object.keys(state.attackVectors).forEach(function (k) {
        state.attackVectors[k] = false;
      });
      if (this.container) {
        this.container.querySelectorAll('.vector-btn').forEach(function (btn) {
          btn.setAttribute('aria-pressed', 'false');
        });
      }
      this.updateCount();
    },

    selectRandom: function (count) {
      var allKeys = Object.keys(state.attackVectors);
      var shuffled = allKeys.slice().sort(function () { return Math.random() - 0.5; });
      var selected = shuffled.slice(0, Math.min(count, allKeys.length));
      this.resetAll();
      var self = this;
      selected.forEach(function (k) {
        state.attackVectors[k] = true;
        var btn = self.container ? self.container.querySelector('[data-vector="' + k + '"]') : null;
        if (btn) btn.setAttribute('aria-pressed', 'true');
      });
      this.updateCount();
      return selected;
    },

    getUnselectedKeys: function () {
      return Object.keys(state.attackVectors).filter(function (k) {
        return !state.attackVectors[k];
      });
    }
  };

  // =============================================================
  // 5. DOMAIN SELECTOR (dynamic render + toggle)
  // =============================================================

  var DomainSelector = {
    container: null,

    init: function () {
      this.container = document.getElementById('domain-container');
      if (!this.container) return;
      this.render();
    },

    render: function () {
      this.container.innerHTML = '';
      var self = this;
      DOMAINS.forEach(function (domain) {
        var chip = document.createElement('button');
        chip.className = 'domain-chip';
        chip.setAttribute('role', 'switch');
        chip.setAttribute('aria-pressed', 'false');
        chip.setAttribute('data-domain', domain);
        chip.textContent = domain;
        chip.addEventListener('click', function () {
          var idx = state.selectedDomains.indexOf(domain);
          if (idx >= 0) {
            state.selectedDomains.splice(idx, 1);
            chip.setAttribute('aria-pressed', 'false');
            chip.classList.remove('active');
          } else {
            state.selectedDomains.push(domain);
            chip.setAttribute('aria-pressed', 'true');
            chip.classList.add('active');
          }
        });
        self.container.appendChild(chip);
      });
    }
  };

  // =============================================================
  // 6. PARAM BAR (compact slider wiring)
  // =============================================================

  var ParamBar = {
    sliders: [
      { id: 'depth-slider', output: 'depth-value', key: 'cognitiveDepth' },
      { id: 'entity-slider', output: 'entity-value', key: 'entityCount' },
      { id: 'constraint-slider', output: 'constraint-value', key: 'constraintVars' },
      { id: 'entropy-slider', output: 'entropy-value', key: 'entropyLevel' }
    ],

    init: function () {
      var self = this;
      this.sliders.forEach(function (cfg) {
        var slider = document.getElementById(cfg.id);
        var display = document.getElementById(cfg.output);
        if (!slider || !display) return;

        slider.value = state.params[cfg.key];
        display.textContent = state.params[cfg.key];

        slider.addEventListener('input', function () {
          var val = parseInt(slider.value, 10);
          state.params[cfg.key] = val;
          display.textContent = val;
          if (cfg.key === 'entropyLevel') ThemeEngine.updateEntropy(val);
        });
      });
    },

    set: function (key, val) {
      var cfg = this.sliders.find(function (s) { return s.key === key; });
      if (!cfg) return;
      var slider = document.getElementById(cfg.id);
      var display = document.getElementById(cfg.output);
      if (slider) {
        val = Math.max(parseInt(slider.min, 10), Math.min(parseInt(slider.max, 10), val));
        slider.value = val;
        state.params[key] = val;
        if (display) display.textContent = val;
        if (key === 'entropyLevel') ThemeEngine.updateEntropy(val);
      }
    },

    resetAll: function () {
      var defaults = { cognitiveDepth: 5, entityCount: 3, constraintVars: 4, entropyLevel: 5 };
      var self = this;
      Object.keys(defaults).forEach(function (k) { self.set(k, defaults[k]); });
    }
  };

  // =============================================================
  // THEME ENGINE
  // =============================================================

  var ThemeEngine = {
    entropyInterval: null,
    colorIndex: 0,
    colors: ['#FFD700', '#39FF14', '#FF00FF'],

    init: function () {
      this.updateEntropy(state.params.entropyLevel);
    },

    updateEntropy: function (level) {
      var root = document.documentElement.style;

      if (this.entropyInterval) {
        clearInterval(this.entropyInterval);
        this.entropyInterval = null;
      }

      if (level <= 3) {
        root.setProperty('--accent-primary', '#FFD700');
        root.setProperty('--accent-secondary', '#39FF14');
        root.setProperty('--accent-glow', 'rgba(255, 215, 0, 0.4)');
      } else if (level <= 6) {
        root.setProperty('--accent-primary', '#39FF14');
        root.setProperty('--accent-secondary', '#FFD700');
        root.setProperty('--accent-glow', 'rgba(57, 255, 20, 0.4)');
      } else if (level <= 9) {
        root.setProperty('--accent-primary', '#FF00FF');
        root.setProperty('--accent-secondary', '#FFD700');
        root.setProperty('--accent-glow', 'rgba(255, 0, 255, 0.4)');
      } else {
        var self = this;
        this.entropyInterval = setInterval(function () {
          self.colorIndex = (self.colorIndex + 1) % self.colors.length;
          var c = self.colors[self.colorIndex];
          root.setProperty('--accent-primary', c);
          root.setProperty('--accent-glow',
            'rgba(' + parseInt(c.slice(1, 3), 16) + ', ' + parseInt(c.slice(3, 5), 16) + ', ' + parseInt(c.slice(5, 7), 16) + ', 0.5)');
        }, 300);
      }

      root.setProperty('--scanline-opacity', (level / 10 * 0.15).toString());
    }
  };

  // =============================================================
  // 7. OUTPUT CANVAS (clean display)
  // =============================================================

  var OutputCanvas = {
    output: null,
    skeleton: null,

    init: function () {
      this.output = document.getElementById('terminal-output');
      this.skeleton = document.getElementById('skeleton-overlay');

      document.getElementById('copy-prompt-btn').addEventListener('click', function () {
        OutputCanvas.copyCleanPrompt();
      });
      document.getElementById('copy-full-btn').addEventListener('click', function () {
        OutputCanvas.copyFullOutput();
      });
      document.getElementById('clear-btn').addEventListener('click', function () {
        OutputCanvas.clear();
      });
    },

    showSkeleton: function () {
      if (this.skeleton) this.skeleton.classList.add('active');
    },

    hideSkeleton: function () {
      if (this.skeleton) this.skeleton.classList.remove('active');
    },

    clear: function () {
      var pre = this.output ? this.output.querySelector('.output-text') : null;
      if (pre) {
        pre.innerHTML = 'Gordian-X Adversarial Synthesis Engine v2026.4\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\nSelect attack vectors and a domain, then\npress SYNTHESIZE to generate a benchmark.\n\nConfigure your API key in Settings first.\n\n&gt; Awaiting directives...';
      }
      state.lastFullResponse = '';
      state.cleanPrompt = '';
      EvaluationPanel.reset();
      PostActions.hide();
    },

    renderDirect: function (text) {
      var pre = this.output ? this.output.querySelector('.output-text') : null;
      if (pre) {
        pre.textContent = text;
        pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
      }
    },

    appendStream: function (token) {
      var pre = this.output ? this.output.querySelector('.output-text') : null;
      if (pre) {
        pre.textContent += token;
        pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
      }
    },

    async typewrite(text) {
      var pre = this.output ? this.output.querySelector('.output-text') : null;
      if (!pre) return;
      pre.textContent = '';

      return new Promise(function (resolve) {
        var i = 0;
        var speed = Math.max(2, 15 - state.params.entropyLevel);
        function write() {
          if (i < text.length) {
            var chunk = text.slice(i, i + 3);
            pre.textContent += chunk;
            i += 3;
            pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
            setTimeout(write, speed);
          } else {
            resolve();
          }
        }
        write();
      });
    },

    copyCleanPrompt: async function () {
      var text = state.cleanPrompt || '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        var btn = document.getElementById('copy-prompt-btn');
        if (btn) {
          var orig = btn.textContent;
          btn.textContent = 'COPIED!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = orig;
            btn.classList.remove('copied');
          }, 2000);
        }
      } catch (e) {
        console.error('Copy failed:', e);
      }
    },

    copyFullOutput: async function () {
      var pre = this.output ? this.output.querySelector('.output-text') : null;
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.textContent);
        var btn = document.getElementById('copy-full-btn');
        if (btn) {
          var orig = btn.textContent;
          btn.textContent = 'COPIED!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = orig;
            btn.classList.remove('copied');
          }, 2000);
        }
      } catch (e) {
        console.error('Copy failed:', e);
      }
    }
  };

  // =============================================================
  // 8. POST ACTIONS
  // =============================================================

  var PostActions = {
    container: null,

    init: function () {
      this.container = document.getElementById('post-actions');
      if (!this.container) return;

      this.container.querySelectorAll('.post-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var action = btn.getAttribute('data-action');
          PostActions.execute(action);
        });
      });
    },

    show: function () {
      if (this.container) this.container.classList.remove('hidden');
    },

    hide: function () {
      if (this.container) this.container.classList.add('hidden');
    },

    execute: function (action) {
      switch (action) {
        case 'regenerate':
          SynthesisEngine.run();
          break;
        case 'harder':
          ParamBar.set('cognitiveDepth', Math.min(10, state.params.cognitiveDepth + 2));
          // Add a random unselected vector
          var unselected = VectorSelector.getUnselectedKeys();
          if (unselected.length > 0) {
            var randomKey = unselected[Math.floor(Math.random() * unselected.length)];
            VectorSelector.toggle(randomKey);
          }
          SynthesisEngine.run();
          break;
        case 'different':
          var currentCount = VectorSelector.getActiveKeys().length;
          var count = Math.max(1, currentCount);
          // Deselect current, select same count of different random vectors
          var currentActive = VectorSelector.getActiveKeys();
          VectorSelector.resetAll();
          var allKeys = Object.keys(state.attackVectors);
          // Filter out previously active keys
          var candidates = allKeys.filter(function (k) { return currentActive.indexOf(k) < 0; });
          if (candidates.length < count) candidates = allKeys.slice();
          var shuffled = candidates.sort(function () { return Math.random() - 0.5; });
          shuffled.slice(0, count).forEach(function (k) {
            VectorSelector.toggle(k);
          });
          SynthesisEngine.run();
          break;
        case 'simplify':
          ParamBar.set('cognitiveDepth', Math.max(1, state.params.cognitiveDepth - 2));
          SynthesisEngine.run();
          break;
      }
    }
  };

  // =============================================================
  // 9. EVALUATION PANEL (Phase 2 grading)
  // =============================================================

  var EvaluationPanel = {
    input: null,
    gradeBtn: null,
    result: null,
    statusTag: null,

    init: function () {
      this.input = document.getElementById('answer-input');
      this.gradeBtn = document.getElementById('grade-btn');
      this.result = document.getElementById('grade-result');
      this.statusTag = document.getElementById('eval-status-tag');

      if (this.gradeBtn) {
        this.gradeBtn.addEventListener('click', function () {
          EvaluationPanel.grade();
        });
      }
    },

    activate: function () {
      if (this.input) {
        this.input.disabled = false;
        this.input.placeholder = "Paste the target LLM's answer here for grading...";
      }
      if (this.gradeBtn) this.gradeBtn.disabled = false;
      if (this.statusTag) {
        this.statusTag.textContent = 'AWAITING ANSWER';
        this.statusTag.className = 'panel-tag eval-waiting';
      }
    },

    reset: function () {
      if (this.input) {
        this.input.value = '';
        this.input.disabled = true;
        this.input.placeholder = 'Synthesize a question first...';
      }
      if (this.gradeBtn) {
        this.gradeBtn.disabled = true;
        this.gradeBtn.textContent = 'GRADE';
      }
      if (this.result) this.result.textContent = '';
      if (this.statusTag) {
        this.statusTag.textContent = 'AWAITING SYNTHESIS';
        this.statusTag.className = 'panel-tag';
      }
    },

    grade: async function () {
      var answer = this.input ? this.input.value.trim() : '';
      if (!answer) return;
      if (!state.cleanPrompt) return;

      if (!state.settings.apiKey) {
        this.result.textContent = 'ERROR: API key required for grading. Open Settings to configure.';
        return;
      }

      this.gradeBtn.disabled = true;
      this.gradeBtn.textContent = 'GRADING...';
      this.statusTag.textContent = 'GRADING';
      this.statusTag.className = 'panel-tag eval-grading';
      this.result.textContent = '';

      var vectors = state.lastVectors.length > 0 ? state.lastVectors : VectorSelector.getActiveKeys();
      var params = state.lastParams || state.params;

      var gradingSystemPrompt = buildPhase2GradingPrompt(
        state.cleanPrompt,
        vectors,
        params,
        answer
      );

      var messages = [
        { role: 'system', content: 'You are the Gordian-X Evaluation Engine. Grade LLM responses against adversarial benchmarks with extreme rigor. Output structured evaluations.' },
        { role: 'user', content: gradingSystemPrompt }
      ];

      var self = this;

      await API.streamChat(
        messages,
        function (token) {
          self.result.textContent += token;
          self.result.scrollTop = self.result.scrollHeight;
        },
        function () {
          self.gradeBtn.disabled = false;
          self.gradeBtn.textContent = 'GRADE';
          var text = self.result.textContent.toUpperCase();
          var passed = false;
          var failed = false;
          if (text.indexOf('PASS') >= 0 && (text.indexOf('VERDICT') >= 0 || text.indexOf('FINAL') >= 0)) {
            // Check it's not "FAIL" close by
            var passIdx = text.lastIndexOf('PASS');
            var failIdx = text.lastIndexOf('FAIL');
            if (passIdx > failIdx) {
              self.statusTag.textContent = 'PASS';
              self.statusTag.className = 'panel-tag eval-pass';
              passed = true;
            } else {
              self.statusTag.textContent = 'FAIL';
              self.statusTag.className = 'panel-tag eval-fail';
              failed = true;
            }
          } else if (text.indexOf('FAIL') >= 0) {
            self.statusTag.textContent = 'FAIL';
            self.statusTag.className = 'panel-tag eval-fail';
            failed = true;
          }

          // Update session and history
          if (passed) {
            state.session.passed++;
            SessionTracker.update();
          } else if (failed) {
            state.session.failed++;
            SessionTracker.update();
          }

          // Update history entry with grade result
          if (state.history.length > 0) {
            var lastEntry = state.history[state.history.length - 1];
            lastEntry.gradeResult = {
              verdict: passed ? 'PASS' : (failed ? 'FAIL' : 'UNKNOWN'),
              fullText: self.result.textContent
            };
            saveHistory();
          }
        },
        function (err) {
          self.result.textContent = 'ERROR: ' + err;
          self.gradeBtn.disabled = false;
          self.gradeBtn.textContent = 'GRADE';
          self.statusTag.textContent = 'ERROR';
          self.statusTag.className = 'panel-tag eval-error';
        }
      );
    }
  };

  // =============================================================
  // 10. HISTORY MANAGER (localStorage CRUD)
  // =============================================================

  var HistoryManager = {
    panel: null,
    list: null,

    init: function () {
      this.panel = document.getElementById('history-panel');
      this.list = document.getElementById('history-list');

      document.getElementById('history-btn').addEventListener('click', function () {
        HistoryManager.toggle();
      });
      document.getElementById('history-close').addEventListener('click', function () {
        HistoryManager.close();
      });
      document.getElementById('history-clear-all').addEventListener('click', function () {
        HistoryManager.clearAll();
      });
    },

    toggle: function () {
      if (this.panel) this.panel.classList.toggle('open');
      if (this.panel && this.panel.classList.contains('open')) {
        this.render();
      }
    },

    close: function () {
      if (this.panel) this.panel.classList.remove('open');
    },

    render: function () {
      if (!this.list) return;
      this.list.innerHTML = '';

      if (state.history.length === 0) {
        this.list.innerHTML = '<div class="history-empty" style="padding:1rem;opacity:0.5;font-size:0.85rem;">No questions generated yet.</div>';
        return;
      }

      var self = this;
      // Show newest first
      var reversed = state.history.slice().reverse();
      reversed.forEach(function (item, ri) {
        var idx = state.history.length - 1 - ri;
        var el = document.createElement('div');
        el.className = 'history-item';

        var date = new Date(item.timestamp);
        var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var preview = (item.scenario || '').substring(0, 120).replace(/\n/g, ' ');
        var scoreHTML = '';
        if (item.gradeResult) {
          var scoreClass = item.gradeResult.verdict === 'PASS' ? 'pass' : 'fail';
          scoreHTML = '<span class="history-score ' + scoreClass + '">' + item.gradeResult.verdict + '</span>';
        }

        el.innerHTML =
          '<div class="history-meta">' +
            '<span>' + dateStr + '</span>' +
            '<span>D:' + (item.difficulty || '?') + scoreHTML + '</span>' +
          '</div>' +
          '<div class="history-preview">' + self.escapeHTML(preview) + (preview.length >= 120 ? '...' : '') + '</div>' +
          '<div class="history-vectors">' +
            (item.vectors ? item.vectors.join(', ') : '') +
            (item.domain ? ' | ' + item.domain : '') +
          '</div>';

        el.addEventListener('click', function () {
          self.loadItem(idx);
        });

        self.list.appendChild(el);
      });
    },

    escapeHTML: function (str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    loadItem: function (idx) {
      var item = state.history[idx];
      if (!item) return;
      state.cleanPrompt = item.scenario || '';
      state.lastVectors = item.vectors || [];
      state.lastDomains = item.domain ? [item.domain] : [];
      state.lastParams = { cognitiveDepth: item.difficulty || 5, entityCount: 3, constraintVars: 4, entropyLevel: 5 };
      OutputCanvas.renderDirect(state.cleanPrompt);
      EvaluationPanel.activate();
      PostActions.show();
      this.close();
    },

    addEntry: function (scenario, vectors, domains, difficulty) {
      var entry = {
        id: 'GX-' + Date.now().toString(36).toUpperCase(),
        timestamp: Date.now(),
        vectors: vectors,
        domain: domains.join(', '),
        difficulty: difficulty,
        scenario: scenario,
        gradeResult: null
      };
      state.history.push(entry);
      // Cap history at 500 entries
      if (state.history.length > 500) {
        state.history = state.history.slice(-500);
      }
      saveHistory();
      return entry;
    },

    clearAll: function () {
      state.history = [];
      saveHistory();
      this.render();
    }
  };

  // =============================================================
  // 11. SESSION TRACKER
  // =============================================================

  var SessionTracker = {
    countEl: null,
    rateEl: null,

    init: function () {
      this.countEl = document.getElementById('session-count');
      this.rateEl = document.getElementById('session-pass-rate');
      this.update();
    },

    update: function () {
      if (this.countEl) {
        this.countEl.textContent = 'Session: ' + state.session.questionsGenerated + ' questions';
      }
      if (this.rateEl) {
        var total = state.session.passed + state.session.failed;
        if (total > 0) {
          var rate = Math.round((state.session.passed / total) * 100);
          this.rateEl.textContent = 'Pass rate: ' + rate + '% (' + state.session.passed + '/' + total + ')';
        } else {
          this.rateEl.textContent = '';
        }
      }
      saveSession();
    },

    recordGeneration: function (vectorKeys) {
      state.session.questionsGenerated++;
      vectorKeys.forEach(function (k) {
        state.session.vectorsUsed[k] = (state.session.vectorsUsed[k] || 0) + 1;
      });
      this.update();
    },

    shouldEscalate: function () {
      // Auto-suggest difficulty escalation when pass rate > 60%
      var total = state.session.passed + state.session.failed;
      if (total < 2) return false;
      return (state.session.passed / total) > 0.6;
    }
  };

  // =============================================================
  // 12. SUITE MODE
  // =============================================================

  var SuiteMode = {
    dialog: null,
    progressFill: null,
    progressText: null,
    progressContainer: null,

    init: function () {
      this.dialog = document.getElementById('suite-dialog');
      this.progressFill = document.getElementById('suite-progress-fill');
      this.progressText = document.getElementById('suite-progress-text');
      this.progressContainer = document.getElementById('suite-progress');

      var self = this;

      document.getElementById('suite-btn').addEventListener('click', function () {
        self.open();
      });
      document.getElementById('suite-close').addEventListener('click', function () {
        self.close();
      });
      document.getElementById('suite-cancel-btn').addEventListener('click', function () {
        self.cancel();
      });
      document.getElementById('suite-generate-btn').addEventListener('click', function () {
        self.generate();
      });

      // Wire up slider outputs
      var minSlider = document.getElementById('suite-min-diff');
      var maxSlider = document.getElementById('suite-max-diff');
      var minVal = document.getElementById('suite-min-val');
      var maxVal = document.getElementById('suite-max-val');

      if (minSlider && minVal) {
        minSlider.addEventListener('input', function () {
          minVal.textContent = minSlider.value;
        });
      }
      if (maxSlider && maxVal) {
        maxSlider.addEventListener('input', function () {
          maxVal.textContent = maxSlider.value;
        });
      }
    },

    open: function (presetCount) {
      if (!this.dialog) return;
      if (presetCount) {
        var countInput = document.getElementById('suite-count');
        if (countInput) countInput.value = presetCount;
      }
      this.dialog.showModal();
    },

    close: function () {
      if (this.dialog) this.dialog.close();
      state.suiteAbort = false;
      state.suiteRunning = false;
    },

    cancel: function () {
      state.suiteAbort = true;
      state.suiteRunning = false;
      this.close();
    },

    generate: async function () {
      if (state.suiteRunning) return;
      state.suiteRunning = true;
      state.suiteAbort = false;

      var count = parseInt(document.getElementById('suite-count').value, 10) || 10;
      var minDiff = parseInt(document.getElementById('suite-min-diff').value, 10) || 3;
      var maxDiff = parseInt(document.getElementById('suite-max-diff').value, 10) || 8;
      var autoVary = document.getElementById('suite-auto-vectors').checked;

      if (minDiff > maxDiff) { var tmp = minDiff; minDiff = maxDiff; maxDiff = tmp; }

      // Show progress
      if (this.progressContainer) this.progressContainer.classList.remove('hidden');
      document.getElementById('suite-generate-btn').disabled = true;

      for (var i = 0; i < count; i++) {
        if (state.suiteAbort) break;

        // Update progress
        var pct = Math.round(((i) / count) * 100);
        if (this.progressFill) this.progressFill.style.width = pct + '%';
        if (this.progressText) this.progressText.textContent = i + ' / ' + count;

        // Set difficulty for this question
        var diff = minDiff + Math.round(Math.random() * (maxDiff - minDiff));
        ParamBar.set('cognitiveDepth', diff);

        // Auto-vary vectors if enabled
        if (autoVary) {
          var vectorCount = Math.max(2, Math.min(6, Math.floor(diff / 2) + 1));
          VectorSelector.selectRandom(vectorCount);
        }

        // Run synthesis
        await SynthesisEngine.runSilent();

        // Delay between calls
        if (i < count - 1 && !state.suiteAbort) {
          await new Promise(function (resolve) { setTimeout(resolve, 2000); });
        }
      }

      // Complete
      if (this.progressFill) this.progressFill.style.width = '100%';
      if (this.progressText) this.progressText.textContent = (state.suiteAbort ? 'Cancelled at ' + i : count) + ' / ' + count;

      state.suiteRunning = false;
      document.getElementById('suite-generate-btn').disabled = false;

      // Hide progress after 2s, then close
      var self = this;
      setTimeout(function () {
        if (self.progressContainer) self.progressContainer.classList.add('hidden');
        if (self.progressFill) self.progressFill.style.width = '0%';
        self.close();
      }, 2000);
    }
  };

  // =============================================================
  // 13. EXPORT SYSTEM
  // =============================================================

  var ExportSystem = {
    dialog: null,

    init: function () {
      this.dialog = document.getElementById('export-dialog');

      document.getElementById('export-btn').addEventListener('click', function () {
        ExportSystem.open();
      });
      document.getElementById('export-close').addEventListener('click', function () {
        ExportSystem.close();
      });

      // Format buttons
      document.querySelectorAll('.export-format-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var format = btn.getAttribute('data-format');
          ExportSystem.exportAs(format);
        });
      });
    },

    open: function () {
      if (this.dialog) this.dialog.showModal();
    },

    close: function () {
      if (this.dialog) this.dialog.close();
    },

    exportAs: function (format) {
      if (state.history.length === 0) {
        alert('No questions in history to export.');
        return;
      }

      var content, filename, mime;

      switch (format) {
        case 'json':
          content = JSON.stringify({
            exportDate: new Date().toISOString(),
            engine: 'Gordian-X Adversarial Synthesis Engine',
            totalQuestions: state.history.length,
            questions: state.history
          }, null, 2);
          filename = 'gordianx-export-' + Date.now() + '.json';
          mime = 'application/json';
          break;

        case 'markdown':
          var md = '# Gordian-X Adversarial Benchmark Export\n\n';
          md += 'Generated: ' + new Date().toISOString() + '\n';
          md += 'Total Questions: ' + state.history.length + '\n\n---\n\n';
          state.history.forEach(function (item, i) {
            md += '## Question ' + (i + 1) + ' (' + item.id + ')\n\n';
            md += '**Date:** ' + new Date(item.timestamp).toISOString() + '\n';
            md += '**Vectors:** ' + (item.vectors ? item.vectors.join(', ') : 'N/A') + '\n';
            md += '**Domain:** ' + (item.domain || 'N/A') + '\n';
            md += '**Difficulty:** ' + (item.difficulty || 'N/A') + '\n\n';
            md += '### Scenario\n\n' + (item.scenario || 'N/A') + '\n\n';
            if (item.gradeResult) {
              md += '### Grade: ' + item.gradeResult.verdict + '\n\n';
              md += item.gradeResult.fullText + '\n\n';
            }
            md += '---\n\n';
          });
          content = md;
          filename = 'gordianx-export-' + Date.now() + '.md';
          mime = 'text/markdown';
          break;

        case 'csv':
          var lines = ['id,timestamp,vectors,domain,difficulty,scenario,score,verdict'];
          state.history.forEach(function (item) {
            var scenario = (item.scenario || '').substring(0, 200).replace(/"/g, '""').replace(/\n/g, ' ');
            var verdict = item.gradeResult ? item.gradeResult.verdict : '';
            var score = '';
            if (item.gradeResult && item.gradeResult.fullText) {
              var scoreMatch = item.gradeResult.fullText.match(/(\d{1,3})\s*(?:\/\s*100|out of 100)/i);
              if (scoreMatch) score = scoreMatch[1];
            }
            lines.push(
              '"' + item.id + '",' +
              '"' + new Date(item.timestamp).toISOString() + '",' +
              '"' + (item.vectors ? item.vectors.join('; ') : '') + '",' +
              '"' + (item.domain || '') + '",' +
              (item.difficulty || '') + ',' +
              '"' + scenario + '",' +
              score + ',' +
              '"' + verdict + '"'
            );
          });
          content = lines.join('\n');
          filename = 'gordianx-export-' + Date.now() + '.csv';
          mime = 'text/csv';
          break;

        default:
          return;
      }

      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.close();
    }
  };

  // =============================================================
  // 14. API MODULE (kept from original)
  // =============================================================

  var API = {
    getProvider: function () {
      return PROVIDERS[state.settings.provider] || PROVIDERS.openai;
    },

    getEndpoint: function () {
      var p = this.getProvider();
      if (state.settings.provider === 'custom') {
        return state.settings.customUrl || '';
      }
      return p.url;
    },

    streamChat: async function (messages, onToken, onDone, onError) {
      if (!state.settings.apiKey) {
        onError('API key not configured. Open Settings (gear icon) to add your key.');
        return;
      }

      var provider = this.getProvider();
      var endpoint = this.getEndpoint();
      if (!endpoint) {
        onError('No API endpoint configured. Select a provider or enter a custom URL.');
        return;
      }

      try {
        var response;

        if (provider.format === 'anthropic') {
          // Anthropic Messages API format
          var systemContent = '';
          var nonSystemMessages = [];
          messages.forEach(function (m) {
            if (m.role === 'system') {
              systemContent += (systemContent ? '\n\n' : '') + m.content;
            } else {
              nonSystemMessages.push(m);
            }
          });

          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': state.settings.apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
              model: state.settings.model,
              max_tokens: 4096,
              system: systemContent,
              messages: nonSystemMessages,
              temperature: state.settings.temperature,
              stream: true
            })
          });
        } else {
          // OpenAI-compatible format
          var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + state.settings.apiKey
          };
          if (state.settings.provider === 'openrouter') {
            headers['HTTP-Referer'] = location.origin;
            headers['X-Title'] = 'Gordian-X Adversarial Synthesis Engine';
          }

          response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              model: state.settings.model,
              messages: messages,
              temperature: state.settings.temperature,
              stream: true
            })
          });
        }

        if (!response.ok) {
          var err = await response.json().catch(function () { return {}; });
          var msg = (err.error && err.error.message) || err.message || response.statusText;
          onError('API Error ' + response.status + ': ' + msg);
          return;
        }

        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';

        while (true) {
          var result = await reader.read();
          if (result.done) break;

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (var li = 0; li < lines.length; li++) {
            var trimmed = lines[li].trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            var data = trimmed.slice(6);
            if (data === '[DONE]') { onDone(); return; }
            try {
              var parsed = JSON.parse(data);
              var token;
              if (provider.format === 'anthropic') {
                if (parsed.type === 'content_block_delta') {
                  token = parsed.delta ? parsed.delta.text : undefined;
                }
              } else {
                token = parsed.choices && parsed.choices[0] && parsed.choices[0].delta
                  ? parsed.choices[0].delta.content
                  : undefined;
              }
              if (token) onToken(token);
            } catch (e) {
              // skip malformed chunks
            }
          }
        }
        onDone();
      } catch (e) {
        onError('Network error: ' + e.message);
      }
    },

    // Non-streaming call for suite mode (returns full text)
    chatComplete: async function (messages) {
      return new Promise(function (resolve, reject) {
        var fullText = '';
        API.streamChat(
          messages,
          function (token) { fullText += token; },
          function () { resolve(fullText); },
          function (err) { reject(new Error(err)); }
        );
      });
    }
  };

  // =============================================================
  // 15. SYNTHESIS ENGINE (Phase 1 only)
  // =============================================================

  var SynthesisEngine = {
    btn: null,
    progressBar: null,
    progressContainer: null,

    init: function () {
      this.btn = document.getElementById('synthesize-btn');
      this.progressBar = document.getElementById('progress-bar');
      this.progressContainer = document.getElementById('progress-container');

      var self = this;
      if (this.btn) {
        this.btn.addEventListener('click', function (e) {
          self.addRipple(e);
          self.run();
        });
      }
    },

    addRipple: function (e) {
      var btn = this.btn;
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    },

    run: async function () {
      if (state.isSynthesizing) return;
      state.isSynthesizing = true;

      var btnText = this.btn ? this.btn.querySelector('.btn-text') : null;
      if (this.btn) this.btn.disabled = true;
      if (btnText) btnText.textContent = 'SYNTHESIZING...';

      OutputCanvas.showSkeleton();
      if (this.progressContainer) this.progressContainer.classList.add('active');
      if (this.progressBar) this.progressBar.style.width = '0%';

      PostActions.hide();

      // Animate progress
      var progress = 0;
      var self = this;
      var progressInterval = setInterval(function () {
        progress += Math.random() * 3;
        if (progress > 85) progress = 85;
        if (self.progressBar) self.progressBar.style.width = progress + '%';
      }, 200);

      // Clear output
      var pre = OutputCanvas.output ? OutputCanvas.output.querySelector('.output-text') : null;
      if (pre) pre.textContent = '';
      EvaluationPanel.reset();

      // Hide skeleton after brief delay
      setTimeout(function () { OutputCanvas.hideSkeleton(); }, 1500);

      // Capture current config for history
      var currentVectors = VectorSelector.getActiveKeys();
      var currentDomains = state.selectedDomains.slice();
      var currentDifficulty = state.params.cognitiveDepth;
      var currentParams = JSON.parse(JSON.stringify(state.params));

      if (state.settings.apiKey) {
        var systemPrompt = buildPhase1SystemPrompt();
        var messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a single, comprehensive adversarial benchmark scenario now. Output ONLY the scenario text.' }
        ];

        await new Promise(function (resolve) {
          var fullBuffer = '';

          API.streamChat(
            messages,
            function (token) {
              fullBuffer += token;
              OutputCanvas.appendStream(token);
            },
            function () {
              state.cleanPrompt = fullBuffer.trim();
              state.lastFullResponse = fullBuffer;
              state.lastVectors = currentVectors;
              state.lastDomains = currentDomains;
              state.lastParams = currentParams;

              OutputCanvas.renderDirect(state.cleanPrompt);
              EvaluationPanel.activate();
              PostActions.show();

              // Record in history and session
              HistoryManager.addEntry(state.cleanPrompt, currentVectors, currentDomains, currentDifficulty);
              SessionTracker.recordGeneration(currentVectors);

              resolve();
            },
            function (err) {
              OutputCanvas.renderDirect('ERROR: ' + err);
              resolve();
            }
          );
        });
      } else {
        // Fallback template mode
        var templateResult = this.generateTemplate(currentVectors, currentDifficulty);
        state.cleanPrompt = templateResult;
        state.lastFullResponse = templateResult;
        state.lastVectors = currentVectors;
        state.lastDomains = currentDomains;
        state.lastParams = currentParams;

        await OutputCanvas.typewrite(templateResult);
        EvaluationPanel.activate();
        PostActions.show();

        HistoryManager.addEntry(state.cleanPrompt, currentVectors, currentDomains, currentDifficulty);
        SessionTracker.recordGeneration(currentVectors);
      }

      // Complete
      clearInterval(progressInterval);
      if (this.progressBar) this.progressBar.style.width = '100%';
      if (this.progressBar) this.progressBar.style.background = 'linear-gradient(90deg, var(--color-acid-green), var(--color-gold))';

      setTimeout(function () {
        if (btnText) btnText.textContent = 'SYNTHESIS COMPLETE';
        setTimeout(function () {
          if (btnText) btnText.textContent = 'SYNTHESIZE';
          if (self.btn) self.btn.disabled = false;
          state.isSynthesizing = false;
          if (self.progressContainer) self.progressContainer.classList.remove('active');
          if (self.progressBar) {
            self.progressBar.style.width = '0%';
            self.progressBar.style.background = '';
          }
        }, 2000);
      }, 500);
    },

    // Silent run for suite mode (no UI animation)
    runSilent: async function () {
      var currentVectors = VectorSelector.getActiveKeys();
      var currentDomains = state.selectedDomains.slice();
      var currentDifficulty = state.params.cognitiveDepth;
      var currentParams = JSON.parse(JSON.stringify(state.params));

      if (!state.settings.apiKey) {
        var templateResult = this.generateTemplate(currentVectors, currentDifficulty);
        state.cleanPrompt = templateResult;
        state.lastFullResponse = templateResult;
        state.lastVectors = currentVectors;
        state.lastDomains = currentDomains;
        state.lastParams = currentParams;
        HistoryManager.addEntry(templateResult, currentVectors, currentDomains, currentDifficulty);
        SessionTracker.recordGeneration(currentVectors);
        OutputCanvas.renderDirect(templateResult);
        EvaluationPanel.activate();
        PostActions.show();
        return;
      }

      var systemPrompt = buildPhase1SystemPrompt();
      var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a single, comprehensive adversarial benchmark scenario now. Output ONLY the scenario text.' }
      ];

      try {
        var fullText = await API.chatComplete(messages);
        state.cleanPrompt = fullText.trim();
        state.lastFullResponse = fullText;
        state.lastVectors = currentVectors;
        state.lastDomains = currentDomains;
        state.lastParams = currentParams;

        OutputCanvas.renderDirect(state.cleanPrompt);
        EvaluationPanel.activate();
        PostActions.show();

        HistoryManager.addEntry(state.cleanPrompt, currentVectors, currentDomains, currentDifficulty);
        SessionTracker.recordGeneration(currentVectors);
      } catch (e) {
        OutputCanvas.renderDirect('ERROR: ' + e.message);
      }
    },

    generateTemplate: function (vectors, difficulty) {
      var id = 'GX-' + Date.now().toString(36).toUpperCase();
      var vectorLabels = VectorSelector.getActiveLabels();
      var activeStr = vectorLabels.length > 0
        ? vectorLabels.join(', ')
        : 'Recursive Invalidation, High-Dim CSP, Counterfactual Logic';

      var p = state.params;
      var entities = [];
      for (var i = 0; i < Math.min(p.entityCount, 6); i++) {
        entities.push(String.fromCharCode(65 + i));
      }

      var scenarioEntities = entities.map(function (e, i) {
        return '  Entity_' + e + ': knowledge depth ' + (i + 2) + ', belief-state bias toward ' +
          (Math.random() > 0.5 ? 'cooperative' : 'adversarial') + ' strategy, ' +
          'confidence ' + (0.5 + Math.random() * 0.5).toFixed(2) + '.';
      }).join('\n');

      var constraints = [];
      for (var ci = 0; ci < Math.min(p.constraintVars, 8); ci++) {
        constraints.push(
          '  C' + (ci + 1) + ': Var_' + String.fromCharCode(120 + (ci % 3)) + ci + ' must satisfy ' +
          ['parity', 'monotonicity', 'bounded rationality', 'entropic threshold'][ci % 4] +
          ' relative to V' + ((ci + 2) % p.constraintVars) + '.'
        );
      }

      return 'A closed system designated Sigma-' + id + ' operates under the following Non-Standard Axioms:\n\n' +
        scenarioEntities + '\n\n' +
        'Constraint Set (' + p.constraintVars + ' variables):\n' +
        constraints.join('\n') + '\n\n' +
        'Given the axioms and constraints above, determine the optimal strategy for Entity_A ' +
        'that satisfies all constraints simultaneously. Show your complete derivation.\n\n' +
        '[Template preview -- connect an API via Settings for full adversarial synthesis]';
    }
  };

  // =============================================================
  // 16. CHAT WIDGET (engine-integrated with /commands)
  // =============================================================

  var ChatWidget = {
    messagesEl: null,
    input: null,
    isStreaming: false,

    init: function () {
      this.messagesEl = document.getElementById('chat-messages');
      this.input = document.getElementById('chat-input');

      var self = this;
      document.getElementById('chat-send').addEventListener('click', function () {
        self.sendMessage();
      });
      if (this.input) {
        this.input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            self.sendMessage();
          }
        });
      }

      document.getElementById('chat-minimize').addEventListener('click', function () {
        self.toggleMinimize();
      });
      document.getElementById('chat-header').addEventListener('click', function (e) {
        if (e.target.closest('#chat-minimize')) return;
        if (document.getElementById('chat-widget').classList.contains('minimized')) {
          self.toggleMinimize();
        }
      });
    },

    toggleMinimize: function () {
      var widget = document.getElementById('chat-widget');
      state.chatMinimized = !state.chatMinimized;
      widget.classList.toggle('minimized', state.chatMinimized);
    },

    addMessage: function (type, text) {
      var msg = document.createElement('div');
      msg.className = 'msg ' + type;

      if (type === 'system') {
        msg.innerHTML = '<span class="msg-badge">SYS</span><span class="msg-text">' + this.escapeHTML(text) + '</span>';
      } else if (type === 'user') {
        msg.innerHTML = '<span class="msg-text">' + this.escapeHTML(text) + '</span>';
      } else if (type === 'consultant') {
        msg.innerHTML = '<span class="msg-text"></span>';
      } else if (type === 'error') {
        msg.innerHTML = '<span class="msg-text">' + this.escapeHTML(text) + '</span>';
      }

      this.messagesEl.appendChild(msg);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      return msg;
    },

    escapeHTML: function (str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    sendMessage: async function () {
      var text = this.input ? this.input.value.trim() : '';
      if (!text || this.isStreaming) return;

      this.input.value = '';
      this.addMessage('user', text);

      // Handle /commands
      if (text.startsWith('/')) {
        var handled = this.handleCommand(text);
        if (handled) return;
      }

      // Natural language: send to API
      if (!state.settings.apiKey) {
        this.addMessage('error', 'API key not configured. Open Settings (gear icon) to select a provider and add your key.');
        return;
      }

      this.isStreaming = true;

      var systemPrompt = buildPhase1SystemPrompt();
      var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: 'You are the Gordian-X Engine Consultant. Help the user design adversarial benchmarks. If the user describes a benchmark to generate, produce ONLY the scenario text (no answers, traps, or rubrics). For other queries, provide helpful guidance about adversarial benchmark design.' }
      ];

      // Collect recent chat history
      var chatHistory = Array.from(this.messagesEl.querySelectorAll('.msg'))
        .slice(-10)
        .map(function (el) {
          if (el.classList.contains('user')) return { role: 'user', content: el.querySelector('.msg-text') ? el.querySelector('.msg-text').textContent : '' };
          if (el.classList.contains('consultant')) return { role: 'assistant', content: el.querySelector('.msg-text') ? el.querySelector('.msg-text').textContent : '' };
          return null;
        })
        .filter(Boolean);

      // Build full message list
      var fullMessages = messages.concat(chatHistory.slice(0, -1));
      fullMessages.push({ role: 'user', content: text });

      var responseMsg = this.addMessage('consultant', '');
      var responseText = responseMsg.querySelector('.msg-text');
      var self = this;
      var fullBuffer = '';

      await API.streamChat(
        fullMessages,
        function (token) {
          fullBuffer += token;
          responseText.textContent += token;
          self.messagesEl.scrollTop = self.messagesEl.scrollHeight;
        },
        function () {
          self.isStreaming = false;
          // If the response looks like a benchmark scenario (long enough), populate output canvas
          if (fullBuffer.length > 200) {
            state.cleanPrompt = fullBuffer.trim();
            state.lastFullResponse = fullBuffer;
            state.lastVectors = VectorSelector.getActiveKeys();
            state.lastDomains = state.selectedDomains.slice();
            state.lastParams = JSON.parse(JSON.stringify(state.params));
            OutputCanvas.renderDirect(state.cleanPrompt);
            EvaluationPanel.activate();
            PostActions.show();
            HistoryManager.addEntry(state.cleanPrompt, state.lastVectors, state.lastDomains, state.params.cognitiveDepth);
            SessionTracker.recordGeneration(state.lastVectors);
            self.addMessage('system', 'Scenario loaded into output canvas.');
          }
        },
        function (err) {
          responseMsg.remove();
          self.addMessage('error', err);
          self.isStreaming = false;
        }
      );
    },

    handleCommand: function (text) {
      var parts = text.trim().split(/\s+/);
      var cmd = parts[0].toLowerCase();

      switch (cmd) {
        case '/harder':
          this.addMessage('system', 'Escalating difficulty...');
          PostActions.execute('harder');
          return true;

        case '/regenerate':
          this.addMessage('system', 'Regenerating with same parameters...');
          PostActions.execute('regenerate');
          return true;

        case '/different':
          this.addMessage('system', 'Swapping vectors, keeping difficulty...');
          PostActions.execute('different');
          return true;

        case '/suite':
          var count = parseInt(parts[1], 10) || 10;
          this.addMessage('system', 'Opening suite generator for ' + count + ' questions...');
          SuiteMode.open(count);
          return true;

        case '/export':
          this.addMessage('system', 'Opening export dialog...');
          ExportSystem.open();
          return true;

        case '/simplify':
          this.addMessage('system', 'Reducing difficulty...');
          PostActions.execute('simplify');
          return true;

        case '/clear':
          this.addMessage('system', 'Clearing output...');
          OutputCanvas.clear();
          return true;

        case '/reset':
          this.addMessage('system', 'Resetting all parameters...');
          VectorSelector.resetAll();
          ParamBar.resetAll();
          return true;

        default:
          return false;
      }
    }
  };

  // =============================================================
  // 17. SETTINGS PANEL (enhanced with scanline/contrast toggles)
  // =============================================================

  var SettingsPanel = {
    panel: null,

    init: function () {
      this.panel = document.getElementById('settings-panel');
      var providerSelect = document.getElementById('provider-select');
      var apiInput = document.getElementById('api-key-input');
      var modelSelect = document.getElementById('model-select');
      var modelCustom = document.getElementById('model-custom');
      var customUrlInput = document.getElementById('custom-url-input');
      var tempSlider = document.getElementById('temperature-slider');
      var tempValue = document.getElementById('temp-value');
      var self = this;

      // Load saved settings
      providerSelect.value = state.settings.provider;
      if (state.settings.apiKey) {
        apiInput.value = state.settings.apiKey;
        this.updateStatus(true);
      }
      if (state.settings.customUrl) {
        customUrlInput.value = state.settings.customUrl;
      }
      this.populateModels();
      tempSlider.value = state.settings.temperature;
      tempValue.textContent = state.settings.temperature;
      this.updateCustomUrlVisibility();

      // Open/Close
      document.getElementById('settings-btn').addEventListener('click', function () {
        self.toggle();
      });
      document.getElementById('settings-close').addEventListener('click', function () {
        self.close();
      });

      // Provider
      providerSelect.addEventListener('change', function () {
        state.settings.provider = providerSelect.value;
        localStorage.setItem('gordianx-provider', state.settings.provider);
        var p = PROVIDERS[state.settings.provider];
        apiInput.placeholder = p ? p.placeholder : 'your-api-key';
        self.populateModels();
        self.updateCustomUrlVisibility();
      });

      // API key
      apiInput.addEventListener('input', function () {
        state.settings.apiKey = apiInput.value.trim();
        localStorage.setItem('gordianx-api-key', state.settings.apiKey);
        self.updateStatus(!!state.settings.apiKey);
      });

      // Toggle visibility
      document.getElementById('api-key-toggle').addEventListener('click', function () {
        apiInput.type = apiInput.type === 'password' ? 'text' : 'password';
      });

      // Model select
      modelSelect.addEventListener('change', function () {
        state.settings.model = modelSelect.value;
        localStorage.setItem('gordianx-model', state.settings.model);
      });

      // Custom model input
      modelCustom.addEventListener('input', function () {
        state.settings.model = modelCustom.value.trim();
        localStorage.setItem('gordianx-model', state.settings.model);
      });

      // Custom URL
      customUrlInput.addEventListener('input', function () {
        state.settings.customUrl = customUrlInput.value.trim();
        localStorage.setItem('gordianx-custom-url', state.settings.customUrl);
      });

      // Temperature
      tempSlider.addEventListener('input', function () {
        state.settings.temperature = parseFloat(tempSlider.value);
        tempValue.textContent = tempSlider.value;
        localStorage.setItem('gordianx-temperature', tempSlider.value);
      });

      // Scanline toggle
      var scanlineToggle = document.getElementById('scanline-toggle');
      var scanlineOverlay = document.getElementById('scanline-overlay');
      if (scanlineToggle && scanlineOverlay) {
        scanlineToggle.addEventListener('change', function () {
          if (scanlineToggle.checked) {
            scanlineOverlay.classList.remove('scanline-hidden');
            scanlineOverlay.classList.add('scanline-active');
          } else {
            scanlineOverlay.classList.remove('scanline-active');
            scanlineOverlay.classList.add('scanline-hidden');
          }
        });
      }

      // High contrast toggle
      var highContrastToggle = document.getElementById('high-contrast-toggle');
      if (highContrastToggle) {
        highContrastToggle.addEventListener('change', function () {
          document.body.classList.toggle('high-contrast', highContrastToggle.checked);
        });
      }

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (self.panel.classList.contains('open') &&
            !self.panel.contains(e.target) &&
            !document.getElementById('settings-btn').contains(e.target)) {
          self.close();
        }
      });
    },

    populateModels: function () {
      var select = document.getElementById('model-select');
      var customInput = document.getElementById('model-custom');
      var p = PROVIDERS[state.settings.provider];

      if (!p || p.models.length === 0) {
        select.style.display = 'none';
        customInput.style.display = 'block';
        customInput.value = state.settings.model;
        return;
      }

      select.style.display = 'block';
      customInput.style.display = 'none';
      select.innerHTML = '';
      p.models.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
      });

      if (p.models.indexOf(state.settings.model) >= 0) {
        select.value = state.settings.model;
      } else {
        select.value = p.default;
        state.settings.model = p.default;
        localStorage.setItem('gordianx-model', p.default);
      }
    },

    updateCustomUrlVisibility: function () {
      var group = document.getElementById('custom-url-group');
      group.style.display = state.settings.provider === 'custom' ? 'block' : 'none';
    },

    toggle: function () {
      this.panel.classList.toggle('open');
    },

    close: function () {
      this.panel.classList.remove('open');
    },

    updateStatus: function (connected) {
      var dot = document.querySelector('.status-dot');
      var text = document.querySelector('.status-text');
      if (connected) {
        if (dot) { dot.classList.remove('offline'); dot.classList.add('online'); }
        if (text) text.textContent = 'Key configured';
      } else {
        if (dot) { dot.classList.remove('online'); dot.classList.add('offline'); }
        if (text) text.textContent = 'Not configured';
      }
    }
  };

  // =============================================================
  // 18. COMMAND PALETTE (expanded commands)
  // =============================================================

  var CommandPalette = {
    dialog: null,
    input: null,
    list: null,
    selectedIndex: 0,

    commands: [
      { id: 'synthesize', label: 'Synthesize Benchmark', shortcut: 'Enter', action: function () { SynthesisEngine.run(); } },
      { id: 'harder', label: 'Harder: Escalate Difficulty', action: function () { PostActions.execute('harder'); } },
      { id: 'simplify', label: 'Simplify: Reduce Difficulty', action: function () { PostActions.execute('simplify'); } },
      { id: 'regenerate', label: 'Regenerate: Same Params', action: function () { PostActions.execute('regenerate'); } },
      { id: 'different', label: 'Different Angle: Swap Vectors', action: function () { PostActions.execute('different'); } },
      { id: 'suite', label: 'Open Suite Generator', action: function () { SuiteMode.open(); } },
      { id: 'export', label: 'Export Results', action: function () { ExportSystem.open(); } },
      { id: 'history', label: 'Toggle History Panel', action: function () { HistoryManager.toggle(); } },
      { id: 'copy-prompt', label: 'Copy Clean Prompt', action: function () { OutputCanvas.copyCleanPrompt(); } },
      { id: 'copy-all', label: 'Copy Full Output', action: function () { OutputCanvas.copyFullOutput(); } },
      { id: 'clear-output', label: 'Clear Output Canvas', action: function () { OutputCanvas.clear(); } },
      { id: 'max-entropy', label: 'Set Entropy to Maximum', action: function () { ParamBar.set('entropyLevel', 10); } },
      { id: 'min-entropy', label: 'Set Entropy to Minimum', action: function () { ParamBar.set('entropyLevel', 1); } },
      { id: 'reset', label: 'Reset All Parameters', action: function () { VectorSelector.resetAll(); ParamBar.resetAll(); } },
      { id: 'toggle-chat', label: 'Toggle Chat Widget', action: function () { ChatWidget.toggleMinimize(); } },
      { id: 'settings', label: 'Open Settings', action: function () { SettingsPanel.toggle(); } },
      { id: 'toggle-sidebar', label: 'Toggle Sidebar', action: function () { var sb = document.getElementById('config-sidebar'); if (sb) sb.classList.toggle('collapsed'); } },
      { id: 'random-vectors', label: 'Select Random Vectors', action: function () { VectorSelector.selectRandom(3); } }
    ],

    init: function () {
      this.dialog = document.getElementById('command-palette');
      this.input = document.getElementById('palette-input');
      this.list = document.getElementById('palette-commands');

      var self = this;
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          self.toggle();
        }
      });

      if (this.input) {
        this.input.addEventListener('input', function () {
          self.selectedIndex = 0;
          self.render();
        });

        this.input.addEventListener('keydown', function (e) {
          var items = self.getFilteredCommands();
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            self.selectedIndex = Math.min(self.selectedIndex + 1, items.length - 1);
            self.render();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            self.selectedIndex = Math.max(self.selectedIndex - 1, 0);
            self.render();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (items[self.selectedIndex]) {
              items[self.selectedIndex].action();
              self.close();
            }
          }
        });
      }

      this.render();
    },

    getFilteredCommands: function () {
      var query = (this.input ? this.input.value : '').toLowerCase();
      if (!query) return this.commands;
      return this.commands.filter(function (c) { return c.label.toLowerCase().indexOf(query) >= 0; });
    },

    render: function () {
      var items = this.getFilteredCommands();
      var query = (this.input ? this.input.value : '').toLowerCase();
      var self = this;

      this.list.innerHTML = items.map(function (cmd, i) {
        var label = cmd.label;
        if (query) {
          var idx = label.toLowerCase().indexOf(query);
          if (idx >= 0) {
            label = label.slice(0, idx) +
              '<mark>' + label.slice(idx, idx + query.length) + '</mark>' +
              label.slice(idx + query.length);
          }
        }
        return '<li class="palette-cmd ' + (i === self.selectedIndex ? 'selected' : '') + '" data-index="' + i + '" role="option">' +
          '<span class="palette-cmd-label">' + label + '</span>' +
          (cmd.shortcut ? '<span class="palette-cmd-shortcut">' + cmd.shortcut + '</span>' : '') +
          '</li>';
      }).join('');

      this.list.querySelectorAll('.palette-cmd').forEach(function (el) {
        el.addEventListener('click', function () {
          var idx = parseInt(el.dataset.index, 10);
          var items = self.getFilteredCommands();
          if (items[idx]) {
            items[idx].action();
            self.close();
          }
        });
      });
    },

    toggle: function () {
      if (this.dialog.open) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function () {
      this.dialog.showModal();
      if (this.input) this.input.value = '';
      this.selectedIndex = 0;
      this.render();
      var self = this;
      setTimeout(function () { if (self.input) self.input.focus(); }, 50);
    },

    close: function () {
      this.dialog.close();
    }
  };

  // =============================================================
  // 19. ONBOARDING
  // =============================================================

  var Onboarding = {
    init: function () {
      var overlay = document.getElementById('onboarding-overlay');
      var dismissBtn = document.getElementById('onboarding-dismiss');

      if (!localStorage.getItem('gordianx-onboarded')) {
        if (overlay) overlay.classList.remove('hidden');
      }

      if (dismissBtn) {
        dismissBtn.addEventListener('click', function () {
          localStorage.setItem('gordianx-onboarded', 'true');
          if (overlay) overlay.classList.add('hidden');
        });
      }
    }
  };

  // =============================================================
  // 20. CHAT RESIZE (kept from original)
  // =============================================================

  var ChatResize = {
    init: function () {
      var widget = document.getElementById('chat-widget');
      var handle = document.getElementById('chat-resize-handle');
      if (!widget || !handle) return;

      var startX, startY, startW, startH;

      handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;
        widget.classList.add('resizing');

        function onMove(e) {
          var dw = startX - e.clientX;
          var dh = startY - e.clientY;
          var newW = Math.min(700, Math.max(280, startW + dw));
          var newH = Math.min(window.innerHeight * 0.8, Math.max(320, startH + dh));
          widget.style.width = newW + 'px';
          widget.style.height = newH + 'px';
        }

        function onUp() {
          widget.classList.remove('resizing');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      // Touch support
      handle.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;
        widget.classList.add('resizing');

        function onMove(e) {
          var t = e.touches[0];
          var dw = startX - t.clientX;
          var dh = startY - t.clientY;
          widget.style.width = Math.min(700, Math.max(280, startW + dw)) + 'px';
          widget.style.height = Math.min(window.innerHeight * 0.8, Math.max(320, startH + dh)) + 'px';
        }

        function onEnd() {
          widget.classList.remove('resizing');
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onEnd);
        }

        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
      }, { passive: true });
    }
  };

  // =============================================================
  // SIDEBAR TOGGLE
  // =============================================================

  var SidebarToggle = {
    init: function () {
      var btn = document.getElementById('sidebar-toggle');
      var sidebar = document.getElementById('config-sidebar');
      if (btn && sidebar) {
        btn.addEventListener('click', function () {
          sidebar.classList.toggle('collapsed');
          btn.textContent = sidebar.classList.contains('collapsed') ? '\u25B6' : '\u25C0';
        });
      }
    }
  };

  // =============================================================
  // 21. INIT
  // =============================================================

  function init() {
    ThemeEngine.init();
    VectorSelector.init();
    DomainSelector.init();
    ParamBar.init();
    OutputCanvas.init();
    EvaluationPanel.init();
    PostActions.init();
    SynthesisEngine.init();
    ChatWidget.init();
    SettingsPanel.init();
    CommandPalette.init();
    HistoryManager.init();
    SessionTracker.init();
    SuiteMode.init();
    ExportSystem.init();
    Onboarding.init();
    ChatResize.init();
    SidebarToggle.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
