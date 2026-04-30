# Phase 1: Base Extension Setup - Research

## Executive Summary
This phase involves creating the foundational structure for a Chrome Extension using Manifest V3. The extension overrides the New Tab page. No bundler is required, and native ES Modules will be used. 

## Technical Approach & Architecture

### Manifest V3 Requirements for New Tab Override
To override the new tab page, the `manifest.json` needs the `chrome_url_overrides` key:
```json
{
  "manifest_version": 3,
  "name": "UI-vik(visual-increment-kit)",
  "version": "1.0.0",
  "description": "A visually rich, highly customizable new tab page.",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage"
  ]
}
```

### Folder Structure
Since the project relies on native ES Modules, a standard modular structure is necessary:
```
/
├── manifest.json
├── index.html
├── styles/
│   ├── base.css
│   └── components/
└── scripts/
    ├── main.js
    └── components/
```

### Script Execution (Native ES Modules)
To use native ES Modules in the browser without a bundler, the script must be included in `index.html` as a module:
```html
<script type="module" src="scripts/main.js"></script>
```

### CSS Reset & BEM
A standard modern CSS reset should be applied. The BEM methodology requires structured classes like `.new-tab`, `.new-tab__container`, etc.

## Validation Architecture
- **Verification:** Ensure the extension can be loaded unpacked in Chrome without errors.
- **Verification:** Ensure opening a new tab correctly renders `index.html`.
- **Verification:** Check console for any module loading errors or strict MIME-type issues.

## Pitfalls & Edge Cases
- **CORS / Module Issues:** Fetching local ES modules requires the `type="module"` tag, otherwise Chrome will throw syntax errors when encountering `import` statements.
- **Content Security Policy (CSP):** MV3 has strict CSP rules. Inline scripts (`<script>console.log('hi')</script>`) are not allowed. All scripts must be loaded from external files.
