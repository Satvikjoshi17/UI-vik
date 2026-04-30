# Phase 5: Advanced Visual Enhancements - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade UI to premium level with glassmorphism cards, parallax background effects, hover animations, dynamic blur intensity control via a settings slider, and reduced-motion accessibility support.
</domain>

<decisions>
## Implementation Decisions

### Glassmorphism
- **D-01:** Glassmorphism Card Depth: Apple-style subtle frosted glass. Clean, minimal frosted panels with soft borders (`1px solid rgba(255,255,255,0.18)`), subtle inner glow, and gentle shadows. No dramatic gradients or colorful reflections.

### Parallax
- **D-02:** Parallax Effect: Mouse-tracking parallax on the background image/video. The background layer shifts subtly based on cursor position, creating depth. No scroll-based parallax (single-screen layout).

### Blur Control
- **D-03:** Blur Intensity Control: Add a range slider in the Settings sidebar that updates `--blur-intensity` in real-time and persists the value via StorageManager.

### Accessibility
- **D-04:** Reduced Motion: Respect `prefers-reduced-motion` media query. When active, disable parallax, cross-fade transitions, and hover scale animations.

### the agent's Discretion
- Exact animation timing curves and durations.
- Specific hover animation styles beyond the existing scale effects.
</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `styles/background.css`: Already has `--blur-intensity` and `--overlay-opacity` CSS variables with transitions.
- `scripts/background.js`: Has `setVisualSettings()` method — can be extended for parallax.
- `scripts/components/settings.js`: Sidebar panel already built — add a slider control here.
- `styles/components.css`: Existing glass-like styles on `.search-input`, `.quicklink-item` — upgrade these.
- `styles/settings.css`: Has `[data-theme]` selectors for dark/light glass variants.

### Established Patterns
- CSS Variables for dynamic styling (Phase 2).
- BEM CSS (Phase 1).
- StorageManager for persistence (Phase 2).
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 05-advanced-visual-enhancements*
*Context gathered: 2026-04-30*
