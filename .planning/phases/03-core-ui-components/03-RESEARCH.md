# Phase 3: Core UI Components - Research

## Executive Summary
This phase introduces three independent, visual components: `Clock`, `SearchBar`, and `QuickLinks`. They will be mounted onto the `#app` container. To ensure modularity, each component will be a separate ES module class.

## Technical Approach & Architecture

### Clock Component
To get a smooth, real-time clock without jank, we should use `requestAnimationFrame` instead of `setInterval(..., 1000)` to ensure it updates exactly when the browser paints, keeping the seconds perfectly synced. For formatting, `Intl.DateTimeFormat` is reliable, but since we need a 12/24 toggle that updates instantly, manual formatting of `Date.getHours()` / `getMinutes()` might be slightly faster to implement with custom AM/PM spans.

### Search Bar Component
For live autocomplete, we need an endpoint that doesn't trigger CORS issues in a Chrome Extension.
- **DuckDuckGo Autocomplete API:** `https://duckduckgo.com/ac/?q=QUERY` (Returns a simple JSON array of objects).
- When a user selects an autocomplete suggestion or hits Enter, we navigate the current tab: `window.location.href = 'https://google.com/search?q=' + query;`.

To prevent API spam, the `input` event on the search bar must be debounced (e.g., 250ms).

### Quick Links Component
We will store an array of objects in `StorageManager`: `[{ title: "YouTube", url: "https://youtube.com" }, ...]`.
To get the favicon, we use the Google S2 API:
`https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`
This returns a 64x64 PNG which looks great on high-DPI displays.

### Layout
We'll create a `styles/components.css` to handle the grid layout. A standard centered Flexbox column layout works best for a New Tab page:
```css
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  z-index: 1; /* Above background */
}
```

## Validation Architecture
- **Verification:** Ensure the clock ticks every second and clicking it toggles the 12/24 state (persisted across reloads).
- **Verification:** Type in the search bar and verify network requests to the autocomplete API are fired and debounced.
- **Verification:** Verify Quick Links grid renders and favicons load correctly.

## Pitfalls & Edge Cases
- **Content Security Policy (CSP):** The manifest might need `connect-src` permissions if we fetch from external APIs (DuckDuckGo autocomplete), though MV3 generally allows `fetch()` to any domain if it's initiated from the extension's own pages (like `index.html`).
- **Debouncing:** Rapid typing could cause out-of-order fetch returns. We need to track the latest query or use an AbortController.
