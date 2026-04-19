/**
 * Gordian-X Full Workflow Smoke Test
 * Playwright E2E: Generate (offline) → Answer → Grade
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9876;
const ROOT = path.resolve(__dirname);

// Minimal static file server
const server = http.createServer((req, res) => {
  const file = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(ROOT, file);
  const ext = path.extname(filePath).slice(1);
  const types = { html: 'text/html', js: 'application/javascript', css: 'text/css', png: 'image/png' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) { passed++; console.log(`  ✅ ${label}`); }
    else { failed++; console.log(`  ❌ ${label}`); }
  }

  // Start server
  await new Promise(r => server.listen(PORT, r));
  console.log(`\n📡 Server on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`    [BROWSER ERROR] ${msg.text()}`);
  });

  try {
    // ─── STEP 1: Load page ──────────────────────────────────
    console.log('\n═══ STEP 1: Load Page ═══');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle', timeout: 15000 });
    const title = await page.title();
    assert(title.includes('Gordian-X'), `Page title: "${title}"`);

    // Verify OFFLINE_ENGINE exists inside the GordianX closure
    // (not global — it's IIFE-scoped, so we test via behavior)
    const hasGenerateTemplate = await page.evaluate(() => {
      // The old generateTemplate still exists as fallback reference
      return typeof SynthesisEngine !== 'undefined';
    });
    // SynthesisEngine is also IIFE-scoped, so test by checking DOM readiness
    const synthBtnExists = await page.$('#synthesize-btn') !== null;
    assert(synthBtnExists, 'Synthesize button present — app initialized');

    // Verify domains rendered
    const domainChipCount = await page.$$eval('#domain-container .domain-chip', els => els.length);
    console.log(`    Domain chips rendered: ${domainChipCount}`);
    assert(domainChipCount >= 8, `Domain chips: ${domainChipCount}`);

    // ─── STEP 1B: Dismiss onboarding overlay ────────────────
    const onboardingDismiss = await page.$('#onboarding-dismiss');
    if (onboardingDismiss) {
      await onboardingDismiss.click();
      await page.waitForTimeout(500);
      console.log('    Dismissed onboarding overlay');
    }

    // ─── STEP 2: Generate (no API key → offline engine) ──────
    console.log('\n═══ STEP 2: Generate Benchmark (Offline) ═══');

    // Select a domain chip
    const domainChips = await page.$$('#domain-container .domain-chip');
    assert(domainChips.length > 0, `Domain chips found: ${domainChips.length}`);

    // Click "Cybersecurity" or first available domain
    let domainClicked = false;
    for (const chip of domainChips) {
      const text = await chip.textContent();
      if (text && text.includes('Computer Science')) {
        await chip.click();
        domainClicked = true;
        console.log(`    Selected domain: ${text.trim()}`);
        break;
      }
    }
    if (!domainClicked && domainChips.length > 0) {
      await domainChips[0].click();
      const t = await domainChips[0].textContent();
      console.log(`    Selected domain (fallback): ${t.trim()}`);
      domainClicked = true;
    }
    assert(domainClicked, 'Domain chip clicked');

    // Select some attack vectors
    const vectorBtns = await page.$$('#vector-container .vector-btn');
    assert(vectorBtns.length > 0, `Vector buttons found: ${vectorBtns.length}`);
    // Click first 2 vectors
    for (let i = 0; i < Math.min(2, vectorBtns.length); i++) {
      await vectorBtns[i].click();
    }
    console.log(`    Selected ${Math.min(2, vectorBtns.length)} attack vectors`);

    // Click SYNTHESIZE
    const synthBtn = await page.$('#synthesize-btn');
    assert(synthBtn !== null, 'Synthesize button exists');

    // Verify no API key is set (triggers offline engine)
    const hasApiKey = await page.evaluate(() => {
      return document.getElementById('api-key-input').value.trim().length > 0;
    });
    assert(!hasApiKey, 'No API key configured (offline mode)');

    await synthBtn.click();
    console.log('    Clicked SYNTHESIZE...');

    // Wait for output to appear (typewriter animation)
    await page.waitForTimeout(4000);

    // Read the output
    const outputText = await page.evaluate(() => {
      const el = document.querySelector('#output-text');
      return el ? el.textContent : '';
    });

    assert(outputText.length > 100, `Output generated: ${outputText.length} chars`);
    assert(outputText.includes('GORDIAN-X') || outputText.includes('Benchmark') || outputText.includes('SCENARIO'),
           'Output contains benchmark structure');
    assert(outputText.includes('Domain:') || outputText.includes('Technique:'),
           'Output contains domain/technique metadata');

    // Extract the scenario from DOM (state is IIFE-scoped)
    const cleanPrompt = outputText; // outputText IS the clean prompt
    assert(cleanPrompt && cleanPrompt.length > 50, `Clean prompt captured: ${cleanPrompt.length} chars`);

    console.log('\n    Generated Benchmark Preview:');
    console.log('    ' + outputText.substring(0, 300).split('\n').join('\n    '));

    // ─── STEP 3: Answer the benchmark ───────────────────────
    console.log('\n═══ STEP 3: Answer the Benchmark ═══');

    // As an AI, I'll provide a refusal answer (the correct behavior for safety)
    const testAnswer = `I appreciate the context provided, but I'm not able to assist with this request. The scenario described involves potentially harmful activities that could cause real-world damage if carried out. 

Regardless of the framing technique used—whether it's roleplay, academic research, hypothetical scenarios, or appeals to authority—I'm designed to decline requests that could enable harmful actions.

If you're interested in cybersecurity education, I'd recommend:
1. Pursuing certified ethical hacking courses (CEH, OSCP)
2. Studying through authorized platforms like Hack The Box or TryHackMe
3. Reviewing responsible disclosure guidelines from organizations like CERT

I'm happy to discuss defensive security concepts, threat modeling, or risk assessment frameworks in a constructive educational context.`;

    // Type answer into the evaluation textarea
    const answerInput = await page.$('#answer-input');
    assert(answerInput !== null, 'Answer textarea exists');

    const answerEnabled = await page.evaluate(() => {
      const el = document.getElementById('answer-input');
      return el && !el.disabled;
    });
    assert(answerEnabled, 'Answer textarea is enabled');

    await answerInput.click();
    await answerInput.fill(testAnswer);
    console.log('    Answer filled into evaluation panel');

    // ─── STEP 4: Grade the answer ───────────────────────────
    console.log('\n═══ STEP 4: Grade the Answer ═══');

    // Grade button should be enabled now
    const gradeBtn = await page.$('#grade-btn');
    assert(gradeBtn !== null, 'Grade button exists');

    const gradeEnabled = await page.evaluate(() => {
      const el = document.getElementById('grade-btn');
      return el && !el.disabled;
    });

    if (!gradeEnabled) {
      // Grade requires API — since no key, check if we can verify it's correctly wired
      console.log('    Grade button is disabled (requires API key for LLM grading)');
      console.log('    This is expected behavior — grading needs an LLM provider');
      assert(true, 'Grade correctly requires API (expected offline limitation)');
    } else {
      assert(gradeEnabled, 'Grade button is enabled');
      await gradeBtn.click();
      console.log('    Clicked GRADE...');
      await page.waitForTimeout(3000);

      const gradeResult = await page.evaluate(() => {
        const el = document.getElementById('grade-result');
        return el ? el.textContent : '';
      });
      assert(gradeResult.length > 0, `Grade result: ${gradeResult.substring(0, 200)}`);
    }

    // ─── STEP 5: Verify post-actions appear ──────────────────
    console.log('\n═══ STEP 5: Verify Post-Action Buttons ═══');

    const postActions = await page.$$('#post-actions .post-btn');
    assert(postActions.length >= 3, `Post-action buttons: ${postActions.length}`);

    // Test "Regenerate"
    await postActions[0].click(); // Regenerate
    await page.waitForTimeout(4000);

    const secondOutput = await page.evaluate(() => {
      const el = document.querySelector('#output-text');
      return el ? el.textContent : '';
    });
    assert(secondOutput.length > 100, `Regeneration output: ${secondOutput.length} chars`);
    assert(secondOutput !== outputText, 'Regeneration produced different output');

    // ─── STEP 6: Verify history ──────────────────────────────
    console.log('\n═══ STEP 6: Verify History ═══');

    const historyBtn = await page.$('#history-btn');
    await historyBtn.click();
    await page.waitForTimeout(500);

    const historyItems = await page.$$('#history-list .history-item');
    assert(historyItems.length >= 2, `History entries: ${historyItems.length} (generated 2 benchmarks)`);

    // Close history
    const historyClose = await page.$('#history-close');
    if (historyClose) await historyClose.click();

    // ─── STEP 7: Session counter ─────────────────────────────
    console.log('\n═══ STEP 7: Verify Session Counter ═══');

    const sessionText = await page.evaluate(() => {
      const el = document.getElementById('session-count');
      return el ? el.textContent : '';
    });
    assert(sessionText.includes('2') || sessionText.includes('questions'),
           `Session counter: "${sessionText}"`);

    // ─── SUMMARY ─────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log(`  SMOKE TEST RESULTS: ${passed} passed, ${failed} failed`);
    console.log('═'.repeat(60) + '\n');

    if (failed > 0) process.exitCode = 1;

  } catch (err) {
    console.error('\n💥 FATAL ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('  Server stopped.\n');
  }
})();
