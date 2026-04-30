// main.js - Entry point for UI-vik
console.log('UI-vik New Tab initialized');

// Basic initialization to verify DOM mounting works
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app) {
        console.log('App container found, ready for component mounting.');
    }
});
