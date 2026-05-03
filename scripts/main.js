// main.js - Entry point for UI-vik
import { Background } from './background.js';
import { StorageManager } from './storage.js';

console.log('UI-vik New Tab initialized');

document.addEventListener('DOMContentLoaded', async () => {
    setBrowserFavicon();
    const app = document.getElementById('app');
    const searchMode = await StorageManager.getPref('search_mode', 'always');
    
    // Add booting class to everything BUT the search bar if it's hidden
    document.documentElement.classList.add('booting');
    
    if (searchMode !== 'always') {
        const searchWidget = document.querySelector('.search-widget');
        if (searchWidget) searchWidget.style.animation = 'none'; 
    }
    function setBrowserFavicon() {
    const favicon = document.getElementById('dynamic-favicon');
    const userAgent = navigator.userAgent;
    let iconPath = 'images/default-icon.png';

    if (userAgent.includes("Edg")) {
        iconPath = 'images/edge-icon.png';
    } else if (userAgent.includes("Chrome")) {
        // Check for Brave (Brave often hides in the navigator.brave object)
        if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
            iconPath = 'images/brave-icon.png';
        } else {
            iconPath = 'images/chrome-icon.png';
        }
    }

    if (favicon) {
        favicon.href = iconPath;
    }
}
    
    if (app) {
        console.log('App container found, ready for component mounting.');
        
        
        // Initialize Background Component
        const bg = new Background(app);
        
        // Load initial preferences
        const blur = await StorageManager.getPref('bg_blur', '5px');
        const opacity = await StorageManager.getPref('bg_opacity', '0.3');
        bg.setVisualSettings({ blur, opacity });

        // Load default background (Parallelize)
        const initBg = async () => {
            let customMedia = await StorageManager.getPref('background_data');
            let mediaSrc = customMedia?.src || customMedia; // Handle object or direct string

            const oldBrokenUrl = 'https://images.unsplash.com/photo-1506744626753-1fa28f67c9bf?auto=format&fit=crop&w=1920&q=80';
            const defaultImage = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80';
            
            if (mediaSrc === oldBrokenUrl) {
                await StorageManager.setPref('background_data', null);
                mediaSrc = null;
            }

            await bg.setBackground({ 
                type: customMedia?.type || 'image', 
                src: mediaSrc || defaultImage 
            });
            bg.enableParallax();
            console.log('Background initialized');
        };

        initBg();

        // Initialize Core UI Components (Immediately)
        const mainContent = app.querySelector('.main-content');
        if (mainContent) {
            import('./components/clock.js').then(({ Clock }) => new Clock(mainContent));
            import('./components/search.js').then(({ Search }) => new Search(mainContent));
            import('./components/topsites.js').then(({ TopSites }) => new TopSites(mainContent));
            import('./components/media-controller.js').then(({ MediaController }) => new MediaController(mainContent));
            console.log('Core UI Components initialized');
        }

        // Initialize Settings & Widgets (Immediately)
        const initSystems = async () => {
            const { WidgetManager } = await import('./widgets/widget-manager.js');
            const widgetArea = app.querySelector('.widget-area');
            const widgetManager = new WidgetManager(widgetArea);
            await widgetManager.init();
            
            const { Settings } = await import('./components/settings.js');
            const settings = new Settings(app, widgetManager);
            
            // Initial position application
            const savedPos = await StorageManager.getPref('widget_position', 'right');
            settings.applyWidgetPosition(savedPos);
            
            console.log('Systems initialized');

        };

        initSystems();

        // Double-Click to Search logic
        app.addEventListener('dblclick', async (e) => {
            // Only trigger on empty space (not on widgets/search/etc)
            if (e.target !== app && e.target !== mainContent) return;

            const searchMode = await StorageManager.getPref('search_mode', 'always');
            if (searchMode === 'gesture') {
                window.dispatchEvent(new CustomEvent('requestSearchFocus'));
            }
        });
      
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            
            document.documentElement.style.setProperty('--mouse-x', x.toFixed(3));
            document.documentElement.style.setProperty('--mouse-y', y.toFixed(3));
        });
    }
    setTimeout(() => {
        document.documentElement.classList.remove('booting');
    }, 1500);
});
