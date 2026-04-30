# Phase 2: Visual Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 2-visual-foundation
**Areas discussed:** Background Image Source, State Management (Storage), Dynamic Styling Approach

---

## Background Image Source

| Option | Description | Selected |
|--------|-------------|----------|
| Local Images Only | Fast, offline support. | |
| External API | Infinite variety, delayed initial load. | |
| Hybrid Approach | Local default + fetch API. | ✓ |

**User's choice:** 3 + can we input from user and videos also like short animations type to make the look best and visually impalling
**Notes:** Decided to include architecture for `<video>` backgrounds and user uploads.

---

## State Management (Storage)

| Option | Description | Selected |
|--------|-------------|----------|
| Build a basic `StorageManager` module now | Use `chrome.storage`. | ✓ |
| Use `localStorage` temporarily | Migrate later. | |
| Hardcode for now | Don't save state. | |

**User's choice:** 1 (Build StorageManager now)
**Notes:** N/A

---

## Dynamic Styling Approach

| Option | Description | Selected |
|--------|-------------|----------|
| CSS Variables (Custom Properties) | Recommended. Smoothest performance. | ✓ |
| Direct Inline Styles | Messy with complex gradients. | |
| Predefined CSS Classes | Limits smooth scaling. | |

**User's choice:** 1 (CSS Variables)
**Notes:** N/A

---

## the agent's Discretion

None explicitly noted.

## Deferred Ideas

- Storage quota limits for videos might require IndexedDB migration later.
