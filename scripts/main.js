// main.js - Entry point for UI-vik
import { Background } from './background.js';
import { StorageManager } from './storage.js';

console.log('UI-vik New Tab initialized');

document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('app');
    if (app) {
        console.log('App container found, ready for component mounting.');
        
        // Initialize Background Component
        const bg = new Background(app);
        
        // Load initial preferences
        const blur = await StorageManager.getPref('bg_blur', '5px');
        const opacity = await StorageManager.getPref('bg_opacity', '0.3');
        bg.setVisualSettings({ blur, opacity });

        // Load default background (we can update this later with APIs or user uploads)
        // For MVP, we'll fetch an image from an API or use a data URL color.
        // Let's use a nice Unsplash placeholder as the default API fetch.
        const defaultImage = 'https://images.unsplash.com/photo-1506744626753-1fa28f67c9bf?auto=format&fit=crop&w=1920&q=80';
        
        await bg.setBackground({ type: 'image', src: defaultImage });
        console.log('Background initialized');
    }
});
