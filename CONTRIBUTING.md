# Contributing to Gordian-X

Thanks for wanting to make LLMs suffer more effectively. Here's how.

## Ground Rules

1. **No build tools.** Gordian-X is three files: `index.html`, `app.js`, `style.css`. No bundlers, no transpilers, no frameworks. This is intentional. PRs that introduce build dependencies will be closed.

2. **No external JS dependencies.** Zero `node_modules`. Zero CDN imports. Pure browser APIs only. If the browser doesn't have it natively, we don't need it.

3. **WCAG AA minimum.** All text must have 4.5:1 contrast ratio. Minimum font size is 12px (0.75rem). All interactive elements need keyboard access and ARIA labels. No exceptions.

4. **Keep it working offline.** The app must function by opening `index.html` directly in a browser. No server required (API calls are the only network dependency and they're user-configured).

## How to Contribute

### Reporting Bugs

Open an issue with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshot if it's a visual bug

### Suggesting Attack Vectors

We're always looking for new cognitive attack vectors. Open an issue with:
- **Name** -- Short, descriptive
- **Category** -- Which of the 6 categories it fits (or propose a new one)
- **Description** -- What cognitive failure mode it exploits
- **Example** -- A sample scenario demonstrating the vector
- **Why LLMs fail at it** -- The specific heuristic or bias it exploits

### Suggesting Domains

New target domains should:
- Be broad enough to generate many diverse questions
- Have well-defined reasoning patterns that can be exploited
- Not overlap significantly with existing domains

### Code Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Test in Chrome, Firefox, and Safari
5. Verify WCAG compliance (use browser devtools accessibility audit)
6. Submit a pull request with a clear description

### Pull Request Guidelines

- **One feature per PR.** Don't bundle unrelated changes.
- **Describe the "why."** What problem does this solve? What attack vector does it add? What usability issue does it fix?
- **No generated code without review.** If you used an AI tool to write code, you still own the quality. Review it thoroughly.
- **Test with and without an API key.** The app must be functional in both states.
- **Keep the IIFE pattern.** All JS stays inside `(function GordianX() { ... })()`. No global scope pollution.

## Code Style

### HTML
- Semantic elements (`<main>`, `<section>`, `<aside>`, `<dialog>`)
- ARIA labels on all interactive elements
- No inline styles (use CSS classes)

### CSS
- CSS custom properties for all colors, spacing, and typography
- Mobile-first responsive design with breakpoints at 380px, 600px, 820px, 1100px
- No `!important` unless overriding third-party styles (there shouldn't be any)
- Class names: lowercase, hyphen-separated (`panel-header`, `vector-btn`)

### JavaScript
- ES2017+ (async/await, template literals, destructuring)
- IIFE module pattern -- all code inside the `GordianX` closure
- Module objects with `init()` methods (e.g., `VectorSelector.init()`)
- No `var` in new code (use `const` and `let`)
- Descriptive function names over comments

## What We Won't Accept

- Framework introductions (React, Vue, Svelte, etc.)
- Build tool requirements (webpack, vite, rollup, etc.)
- Package manager dependencies (npm, yarn, pnpm, etc.)
- Minification or obfuscation (readability is a feature)
- Telemetry, analytics, or tracking of any kind
- Changes that break offline functionality
- WCAG regressions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

*Floyd Labs -- Cognitive Warfare Department*
*"The best contributions make models fail in ways we hadn't imagined."*
