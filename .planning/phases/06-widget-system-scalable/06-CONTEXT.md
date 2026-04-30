# Phase 6: Widget System (Scalable) - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a reusable widget architecture where widgets act as self-contained units. Implement a BaseWidget class, a WidgetManager, and two example widgets (Notes, To-do list). Widgets can be dynamically added or removed via the Settings sidebar.
</domain>

<decisions>
## Implementation Decisions

### Architecture
- **D-01:** Widget Base Class API: Full Lifecycle. Every widget extends `BaseWidget` with `render()`, `destroy()`, `serialize()`, `deserialize(data)`, and a static `metadata` object (name, icon, description).
- **D-02:** Widget Placement: Floating glass panels in a dedicated widget area below the main content.
- **D-03:** Widget Add/Remove UX: A "Widgets" section in the existing Settings sidebar with toggle switches for each available widget (consistent with the component toggles from Phase 4).

### the agent's Discretion
- Exact layout of the widget area (flexbox wrap or CSS grid).
- Whether widgets are resizable in this phase (likely deferred).
</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StorageManager` (`scripts/storage.js`): Use for widget state persistence (`serialize`/`deserialize`).
- `Settings` class (`scripts/components/settings.js`): Add a "Widgets" section with toggles.
- `styles/components.css`: Apple-style glassmorphism pattern to reuse for widget cards.

### Established Patterns
- Native ES Modules (Phase 1).
- BEM CSS (Phase 1).
- Toggle switches in Settings (Phase 4).
- Apple-style frosted glass (Phase 5).
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.
</specifics>

<deferred>
## Deferred Ideas

- Drag-and-drop widget repositioning (future enhancement).
- Widget resizing (future enhancement).
- Weather widget with real API data (listed in requirements as "mock" for now).
</deferred>

---

*Phase: 06-widget-system-scalable*
*Context gathered: 2026-04-30*
