/**
 * browser-polyfill.js
 * Lightweight cross-browser compatibility layer.
 * Maps Firefox's `browser.*` namespace to `chrome.*` so all
 * extension code can consistently use `chrome.*` APIs.
 *
 * Import this ONCE before any chrome.* usage.
 */

(function () {
    'use strict';

    // Edge and Chrome both expose `chrome`. Firefox exposes `browser`.
    // If `chrome` is undefined but `browser` exists, alias it.
    if (typeof globalThis.chrome === 'undefined' && typeof globalThis.browser !== 'undefined') {
        globalThis.chrome = globalThis.browser;
    }

    // If neither exists (e.g., opened as a regular web page for testing),
    // create a stub so code doesn't throw.
    if (typeof globalThis.chrome === 'undefined') {
        globalThis.chrome = {};
    }
})();
