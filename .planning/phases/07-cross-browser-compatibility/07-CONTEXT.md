# Phase 7: Cross-Browser Compatibility - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<decisions>
## Implementation Decisions

- **D-01:** Abstraction Strategy: Lightweight polyfill (`scripts/browser-polyfill.js`) that detects the environment and maps `browser.*` to `chrome.*`. Imported once in `storage.js`. Existing code keeps using `chrome.*`.
- **D-02:** Firefox Manifest: One unified `manifest.json` with `browser_specific_settings` block for Firefox's add-on ID. No separate manifest files.
</decisions>

<code_context>
## Existing Code Insights

- Only `scripts/storage.js` directly references `chrome.storage.*`. The polyfill needs to ensure `chrome` global exists there.
- Edge already supports Chrome's MV3 extensions natively — no extra work needed for Edge.
</code_context>

---

*Phase: 07-cross-browser-compatibility*
*Context gathered: 2026-04-30*
