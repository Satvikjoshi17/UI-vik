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

        // Load default background (Parallelize)
        const defaultImage = 'https://images.unsplash.com/photo-1506744626753-1fa28f67c9bf?auto=format&fit=crop&w=1920&q=80';
        
        bg.setBackground({ type: 'image', src: defaultImage }).then(() => {
            bg.enableParallax();
            console.log('Background initialized with parallax');
        });

        // Initialize Core UI Components (Immediately)
        const mainContent = app.querySelector('.main-content');
        if (mainContent) {
            import('./components/clock.js').then(({ Clock }) => new Clock(mainContent));
            import('./components/search.js').then(({ Search }) => new Search(mainContent));
            import('./components/quicklinks.js').then(({ QuickLinks }) => new QuickLinks(mainContent));
            console.log('Core UI Components initialized');
        }

        // Initialize Settings & Widgets (Immediately)
        const initSystems = async () => {
            const { WidgetManager } = await import('./widgets/widget-manager.js');
            const widgetArea = app.querySelector('.widget-area');
            const widgetManager = new WidgetManager(widgetArea);
            await widgetManager.init();
            
            const { Settings } = await import('./components/settings.js');
            new Settings(app, widgetManager);
            console.log('Systems initialized');
        };

        initSystems();
    }
});
