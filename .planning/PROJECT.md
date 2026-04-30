# Project: UI-vik(visual-increment-kit)

## What This Is

**Core Value:** A visually rich, highly customizable new tab page with smooth performance, modular widgets, and cross-browser compatibility.
**Type:** Chrome Extension (Manifest V3)

## Constraints & Assumptions

- Initial load under 200ms
- Lazy load all non-critical components
- Avoid blocking scripts
- Use requestAnimationFrame for animations
- No external libraries for MVP
- Animations must be GPU-accelerated without FPS drops
- Clean, modular, production-ready code

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vanilla JS MVP | Avoid unnecessary dependencies and keep it lightweight | — Pending |
| Component-based structure | Ensure maintainability and modularity | — Pending |
| chrome.storage.sync | Allows users to save preferences | — Pending |

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Support dynamic background (image + gradient)
- [ ] Render a Clock component with 12/24 hour toggle
- [ ] Implement Search Bar with Google/DuckDuckGo switch
- [ ] Display Quick Links with Grid layout and editable items
- [ ] Customization Engine to toggle components and switch themes
- [ ] Glassmorphism UI with parallax and subtle hover effects
- [ ] Self-contained Widget architecture for Notes, To-do list, Weather

### Out of Scope

- External libraries/frameworks (for MVP) — To keep initial load fast and avoid bloat.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
