---
wave: 1
depends_on: []
files_modified: ["manifest.json", "index.html", "styles/base.css", "scripts/main.js"]
autonomous: true
---

# Phase 1: Base Extension Setup

## Goal
Create a working Chrome extension that overrides the new tab page.

## Requirements
- FND-01: Override new tab page using manifest.json (MV3).
- FND-02: Setup basic CSS reset and layout container.

## Context Decisions
- D-01: Use Native ES Modules (`<script type="module">`).
- D-02: JavaScript-rendered components (mount inside `<div id="app"></div>`).
- D-03: Use BEM (Block Element Modifier) for CSS architecture.

## Tasks

```xml
<task>
  <read_first>
    - manifest.json (if exists)
  </read_first>
  <action>
    Create `manifest.json` in the root directory for a Manifest V3 extension. Include `name: "UI-vik(visual-increment-kit)"`, `version: "1.0.0"`, `manifest_version: 3`, and `chrome_url_overrides: { "newtab": "index.html" }`. Also include `permissions: ["storage"]`.
  </action>
  <acceptance_criteria>
    - `manifest.json` contains `"manifest_version": 3`
    - `manifest.json` contains `"chrome_url_overrides"` mapping to `"index.html"`
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - index.html (if exists)
  </read_first>
  <action>
    Create `index.html` in the root directory. Include a basic HTML5 boilerplate. Add a `<div id="app"></div>` container. Link `styles/base.css` in the head and include `<script type="module" src="scripts/main.js"></script>` at the end of the body.
  </action>
  <acceptance_criteria>
    - `index.html` contains `<div id="app"></div>`
    - `index.html` contains `<script type="module" src="scripts/main.js"></script>`
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - styles/base.css (if exists)
  </read_first>
  <action>
    Create `styles/base.css`. Add a standard CSS reset (`* { margin: 0; padding: 0; box-sizing: border-box; }`). Setup `html, body, #app { height: 100%; width: 100%; }`.
  </action>
  <acceptance_criteria>
    - `styles/base.css` contains `box-sizing: border-box`
    - `styles/base.css` contains styling for `#app` with height/width coverage
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - scripts/main.js (if exists)
  </read_first>
  <action>
    Create `scripts/main.js`. Add a simple console.log to confirm the script is loaded: `console.log('UI-vik New Tab initialized');`
  </action>
  <acceptance_criteria>
    - `scripts/main.js` contains `console.log('UI-vik New Tab initialized');`
  </acceptance_criteria>
</task>
```

<threat_model>
- Impact: Low (Basic setup, no network calls or user data stored yet).
- Mitigations: Strict CSP enforced by Manifest V3. No inline scripts allowed.
</threat_model>
