# Phase 4: Customization Engine - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a Settings sidebar that allows users to toggle components on/off, switch between dark/light glassmorphism themes, choose from predefined layout templates, and save all preferences to `chrome.storage.sync` with instant UI updates.
</domain>

<decisions>
## Implementation Decisions

### Settings UI
- **D-01:** Settings Menu UI: Sliding sidebar from the right side. This allows users to see live changes to the dashboard as they tweak settings.

### Layout
- **D-02:** Layout Positioning System: Predefined Grid Templates. Users choose from 3-4 layout presets (e.g., "Centered Focus", "Top Heavy", "Side-by-Side") applied via CSS classes.

### Theme
- **D-03:** Theme System Scope: Glassmorphism UI Toggles. The background stays as the user set it; UI elements (Search Bar, Settings Panel, Quick Links cards) toggle between dark-translucent glass and light-translucent glass.

### the agent's Discretion
- How to trigger the settings sidebar (gear icon placement, keyboard shortcut).
- Exact number and names of layout presets.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StorageManager` (`scripts/storage.js`): Already supports `getPref`/`setPref` for saving theme, layout, and component visibility preferences.
- `Background` class (`scripts/background.js`): Has `setVisualSettings()` for updating CSS variables — can be extended if theme changes affect overlay opacity.
- Component classes (`clock.js`, `search.js`, `quicklinks.js`): Need to support show/hide toggling.

### Established Patterns
- Native ES Modules (Phase 1).
- BEM CSS (Phase 1).
- CSS Variables for dynamic styling (Phase 2).
- Components mounted into `.main-content` wrapper (Phase 3).
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.
</specifics>

<deferred>
## Deferred Ideas

- Full drag-and-drop widget positioning (deferred to Phase 6).
- Background upload UI within settings (deferred — the architecture exists from Phase 2, but the file picker UI can be added later).
</deferred>

---

*Phase: 04-customization-engine*
*Context gathered: 2026-04-30*
