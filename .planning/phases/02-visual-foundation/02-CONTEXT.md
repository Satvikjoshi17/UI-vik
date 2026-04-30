# Phase 2: Visual Foundation - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement a visually appealing background system including dynamic images/videos, gradients, a background switcher, blur overlay, and smooth transitions.
</domain>

<decisions>
## Implementation Decisions

### Visuals
- **D-01:** Background Image Source: Hybrid Approach. Load a local default for speed, allow fetching from API, AND architect the foundation to support user-uploaded images and short animated videos (`mp4`/`webm`) to achieve a premium look.
- **D-02:** Dynamic Styling Approach: CSS Variables (Custom Properties). Use JS to update variables (e.g. `--blur-intensity`) and let CSS handle the smooth hardware-accelerated transitions.

### Storage
- **D-03:** State Management: Build a basic `StorageManager` module now using `chrome.storage.local` (for media) and `chrome.storage.sync` (for preferences) instead of deferring it.

### the agent's Discretion
None explicitly noted.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html`: Contains the `#app` container to mount the background layer.
- `styles/base.css`: Contains CSS resets where global CSS variables should be appended.
- `scripts/main.js`: Entry point for initializing the `StorageManager` and Background components.

### Established Patterns
- Native ES Modules (Phase 1 decision).
- BEM CSS Methodology (Phase 1 decision).
</code_context>

<specifics>
## Specific Ideas

- The user emphasized making the look "best and visually impalling [appealing]" by including support for user-input videos and short animations. The background container MUST support both `<video autoplay loop muted>` and `<img>`/`background-image`.
</specifics>

<deferred>
## Deferred Ideas

- Using IndexedDB for extremely large video file uploads (if `chrome.storage.local` quota is exceeded, we can optimize this in Phase 4 / Phase 8, but we will aim to build the UI to accept them now).
</deferred>

---

*Phase: 02-visual-foundation*
*Context gathered: 2026-04-30*
