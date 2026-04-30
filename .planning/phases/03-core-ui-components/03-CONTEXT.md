# Phase 3: Core UI Components - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the essential visible elements of the new tab page: a real-time Clock, a functional Search Bar with live autocomplete, and an editable Quick Links grid with favicons.
</domain>

<decisions>
## Implementation Decisions

### Clock
- **D-01:** Clock Toggle Interaction: Clicking the clock directly toggles between 12-hour and 24-hour formats. The preference should be saved via `StorageManager`.

### Search Bar
- **D-02:** Search Bar Experience: Searches happen in the Current Tab. The search bar MUST support live autocomplete suggestions as the user types, fetching from an external API (like Google/DuckDuckGo autocomplete API).

### Quick Links
- **D-03:** Quick Links Favicons: Use Google's Public S2 API (`https://s2.googleusercontent.com/s2/favicons?domain=...`) to fetch favicons for the quick links, avoiding the need for extra Chrome manifest permissions.

### the agent's Discretion
- The layout structure (Grid/Flexbox) for how these 3 components are positioned relative to each other on the screen is left to the agent, provided they are centered/visually appealing.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StorageManager` (`scripts/storage.js`): Use this to save the 12/24 hour clock preference and the user's customized Quick Links list.
- `#app` container (`index.html`): The components should be mounted here, above the background overlay layer.
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.
</specifics>

<deferred>
## Deferred Ideas

- A global Settings menu to control the 12/24 hour toggle centrally (deferred to Phase 4).
</deferred>

---

*Phase: 03-core-ui-components*
*Context gathered: 2026-04-30*
