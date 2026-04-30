---
wave: 1
depends_on: []
files_modified: ["manifest.json", "index.html", "styles/base.css", "styles/background.css", "scripts/storage.js", "scripts/background.js", "scripts/main.js"]
autonomous: true
---

# Phase 2: Visual Foundation

## Goal
Implement a visually appealing background system including dynamic images/videos, gradients, a background switcher, blur overlay, and smooth transitions.

## Requirements
- VIS-01: Dynamic background with image and gradient support.
- VIS-02: Background switcher.
- VIS-03: Blur overlay layer.
- VIS-04: Responsive scaling and smooth fade transitions.

## Context Decisions
- D-01: Hybrid Approach for Background Source (Local + API + User Video/Image Upload).
- D-02: Dynamic Styling via CSS Variables.
- D-03: Basic `StorageManager` module using `chrome.storage.local` and `sync`.

## Tasks

```xml
<task>
  <read_first>
    - manifest.json
  </read_first>
  <action>
    Add the `unlimitedStorage` permission to `manifest.json`. This ensures that user-uploaded high-res images or videos stored in `chrome.storage.local` do not exceed the default 5MB quota.
  </action>
  <acceptance_criteria>
    - `manifest.json` contains `"unlimitedStorage"` in its permissions array.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - scripts/storage.js (new file)
  </read_first>
  <action>
    Create `scripts/storage.js` to implement the `StorageManager`. Export an object with async methods: `getPref(key, defaultVal)`, `setPref(key, val)` using `chrome.storage.sync` (use standard `localStorage` as a polyfill fallback if `chrome.storage` is undefined, e.g. when testing as a regular web page); and `saveMedia(id, dataUrl)`, `getMedia(id)` using `chrome.storage.local` (with similar fallback).
  </action>
  <acceptance_criteria>
    - `storage.js` exports methods for both `sync` and `local` chrome storage handling.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - index.html
    - styles/background.css (new file)
  </read_first>
  <action>
    Create `styles/background.css` and link it in the `<head>` of `index.html`. In this CSS file, set up BEM classes `.bg-container`, `.bg-media` (absolute, full width/height, object-fit cover, z-index -2), and `.bg-overlay` (absolute, full width/height, `backdrop-filter: blur(var(--blur-intensity, 0px))`, `background-color: rgba(0,0,0,var(--overlay-opacity, 0.2))`, z-index -1, with transitions). Also add `.fade-out` and `.fade-in` utility classes for smooth cross-fading of media elements.
  </action>
  <acceptance_criteria>
    - `index.html` links `styles/background.css`
    - `background.css` contains `var(--blur-intensity)` and transition properties.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - scripts/background.js (new file)
    - scripts/main.js
  </read_first>
  <action>
    Create `scripts/background.js`. Export a `Background` class/module that manages injecting the `.bg-container`, media layer (`<img>` or `<video>`), and `.bg-overlay` into `#app`. Implement a `setBackground({ type, src })` method that handles cross-fading the old media element out and the new one in. Add methods to set CSS variables for blur and overlay opacity via `document.documentElement.style`. Import and initialize this in `main.js`.
  </action>
  <acceptance_criteria>
    - `background.js` handles injecting and swapping media elements (`<img>` or `<video>`).
    - `background.js` uses CSS variables to update blur/opacity.
    - `main.js` imports and mounts the background system.
  </acceptance_criteria>
</task>
```

<threat_model>
- Impact: Medium (Handling user uploads and Object URLs).
- Mitigations: Ensure ObjectURLs are revoked to prevent memory leaks.
</threat_model>
