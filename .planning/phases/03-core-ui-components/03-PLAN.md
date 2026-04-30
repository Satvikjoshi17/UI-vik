---
wave: 1
depends_on: []
files_modified: ["index.html", "scripts/main.js", "styles/components.css", "scripts/components/clock.js", "scripts/components/search.js", "scripts/components/quicklinks.js"]
autonomous: true
---

# Phase 3: Core UI Components

## Goal
Add essential visible elements: Clock, Search Bar, and Quick Links.

## Requirements
- CMP-01: Clock widget (real-time, 12/24 toggle).
- CMP-02: Search Bar (centered, live autocomplete, current tab nav).
- CMP-03: Quick Links (grid layout, favicons).

## Context Decisions
- D-01: Click clock to toggle 12/24 format.
- D-02: Search opens in current tab with live autocomplete.
- D-03: Use Google S2 API for favicons.

## Tasks

```xml
<task>
  <read_first>
    - index.html
    - scripts/main.js
  </read_first>
  <action>
    Create `styles/components.css` and link it in `index.html`. Add base layout styles to center the components vertically and horizontally using flexbox on an inner container (e.g. `.main-content`). Ensure it sits above the background overlay (`z-index: 1`).
  </action>
  <acceptance_criteria>
    - `components.css` contains layout styles for centering elements.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - scripts/storage.js
  </read_first>
  <action>
    Create `scripts/components/clock.js`. Implement a `Clock` class that creates a DOM element, uses `setInterval` or `requestAnimationFrame` to update the time every second. Bind a click event that toggles a 12/24 state, saves it via `StorageManager.setPref('clock_format')`, and instantly updates the display.
  </action>
  <acceptance_criteria>
    - `clock.js` handles time rendering and 12/24 toggle on click.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create `scripts/components/search.js`. Implement a `Search` class that creates an `<input type="text">` and an autocomplete dropdown list container. Listen to `input` events, debounce them, and fetch suggestions from `https://duckduckgo.com/ac/?q=...`. On Enter press or click, navigate `window.location.href` to Google search results.
  </action>
  <acceptance_criteria>
    - `search.js` fetches autocomplete data and navigates the current tab.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create `scripts/components/quicklinks.js`. Implement a `QuickLinks` class that takes an array of default links (if none found in StorageManager). Render a grid of anchor tags with icons and titles. Use `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64` for the image source.
  </action>
  <acceptance_criteria>
    - `quicklinks.js` renders a grid of anchor tags with images sourced from the S2 API.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - scripts/main.js
  </read_first>
  <action>
    Update `scripts/main.js` to import and initialize `Clock`, `Search`, and `QuickLinks`, appending their elements to a `.main-content` wrapper inside `#app`.
  </action>
  <acceptance_criteria>
    - `main.js` mounts all three core UI components.
  </acceptance_criteria>
</task>
```
