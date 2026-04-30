# Phase 8: Performance Optimization - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize the extension for 60fps performance and faster initial load times. Focus on the parallax effect smoothing, parallelizing component initialization, and promoting heavy elements to GPU layers.
</domain>

<decisions>
## Implementation Decisions

### Parallax Smoothing
- **D-01:** Implement **Lerp (Linear Interpolation)** for the parallax effect. Instead of snapping to mouse coordinates, the background will smoothly drift toward the target position using `requestAnimationFrame`.
- **D-02:** Use a smoothing factor (e.g., `0.05` or `0.1`) to control the "floatiness" of the effect.

### Initialization & Loading
- **D-03:** **Parallelize Initialization**. In `main.js`, do not `await` the background load before starting UI component initialization. Load both in parallel to reduce Time-to-Interactive.
- **D-04:** Add a "loading" state or ensure the CSS background color covers the app until the first image/video is ready.

### Rendering Optimization
- **D-05:** **GPU Promotion**. Add `will-change: transform` to `.bg-media` and potentially `will-change: opacity` to fade-in elements.
- **D-06:** Ensure all transitions use `transform` and `opacity` only (avoid animating `top`, `left`, `width`, `height`).
</decisions>

<code_context>
## Existing Code Insights

- `scripts/background.js`: `enableParallax` needs a complete rewrite to support the rAF loop and Lerp variables.
- `scripts/main.js`: The `DOMContentLoaded` listener needs to be refactored to remove sequential `await`s.
- `styles/background.css`: Add `will-change` properties.
</code_context>

---

*Phase: 08-performance-optimization*
*Context gathered: 2026-04-30*
