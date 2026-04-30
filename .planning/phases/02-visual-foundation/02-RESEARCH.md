# Phase 2: Visual Foundation - Research

## Executive Summary
This phase establishes the `StorageManager` and the core `Background` component. The background must handle static colors, image URLs (local/API), user-uploaded files, and animated videos (`mp4`/`webm`). We will use CSS Variables for performance-driven transitions.

## Technical Approach & Architecture

### StorageManager Architecture
`chrome.storage.sync` will be used for preferences (e.g., active background type, blur amount). However, user-uploaded files (Data URIs or Blobs) are often too large for `sync` storage (quota is 100KB). We must use `chrome.storage.local` (quota is 5MB, or unlimited with `unlimitedStorage` permission) for actual media files, while keeping the preference metadata in `sync`.

```javascript
// Example StorageManager concept
export const StorageManager = {
    async getPref(key) { /* chrome.storage.sync */ },
    async setPref(key, value) { /* chrome.storage.sync */ },
    async saveMedia(id, dataUrl) { /* chrome.storage.local */ },
    async getMedia(id) { /* chrome.storage.local */ }
};
```

### Background Component Architecture
The DOM structure for the background needs multiple layers to allow cross-fading and overlaying blurs without affecting the main UI.

```html
<div id="background-container">
    <!-- Active Media Layer -->
    <video autoplay loop muted class="bg-media bg-video" src="..."></video>
    <!-- OR -->
    <img class="bg-media bg-image" src="..." />

    <!-- Blur / Overlay Layer -->
    <div class="bg-overlay"></div>
</div>
```

### CSS Variables & Transitions
Using CSS Custom Properties allows us to update the DOM efficiently via JS:
```javascript
document.documentElement.style.setProperty('--blur-intensity', '10px');
document.documentElement.style.setProperty('--overlay-opacity', '0.4');
```

```css
.bg-overlay {
    backdrop-filter: blur(var(--blur-intensity, 0px));
    background-color: rgba(0, 0, 0, var(--overlay-opacity, 0.2));
    transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
}
```

### Handling Videos
HTML5 `<video autoplay loop muted>` works natively in Chrome extensions. We just need to handle the `src` attribute. For user uploads, we can use `URL.createObjectURL(blob)` to create a temporary URL for the video file retrieved from storage.

## Validation Architecture
- **Verification:** Ensure changing the background type correctly swaps between `<img>` and `<video>` elements.
- **Verification:** Check `chrome.storage.local` to ensure media isn't exceeding initial quotas without proper handling.
- **Verification:** Ensure transitions between backgrounds cross-fade smoothly without screen flickering.

## Pitfalls & Edge Cases
- **Quota Exceeded:** If users upload a 10MB video, `chrome.storage.local` might fail unless the `unlimitedStorage` permission is added to `manifest.json`. We should add this permission.
- **Memory Leaks:** If using `URL.createObjectURL()`, we must call `URL.revokeObjectURL()` when swapping backgrounds to prevent memory leaks.
