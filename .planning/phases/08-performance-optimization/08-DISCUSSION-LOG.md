# Phase 8: Performance Optimization - Discussion Log

**Date:** 2026-04-30
**Phase:** 8-performance-optimization

---

## Parallax Smoothing

| Option | Description | Selected |
|--------|-------------|----------|
| rAF Throttling | Simple 60fps update. | |
| Lerp (Smoothing) | Background floats toward mouse with slight lag. | ✓ |

**User's choice:** Lerp
**Notes:** Preferred for "premium" high-end feel.

---

## Parallel Initialization

**Decision:** Do not `await` background media before loading components. Parallelize `bg.setBackground` and component imports.

---

## Rendering Optimization

**Decision:** Use `will-change` for GPU promotion on background and glass panels. Ensure only transform/opacity animations.
