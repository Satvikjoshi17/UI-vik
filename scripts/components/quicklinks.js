import { StorageManager } from '../storage.js';

export class QuickLinks {
    constructor(container) {
        this.container = container;
        this.links = [];
        this.defaultLinks = [
            { title: 'YouTube', url: 'https://youtube.com' },
            { title: 'Gmail', url: 'https://mail.google.com' },
            { title: 'GitHub', url: 'https://github.com' },
            { title: 'Reddit', url: 'https://reddit.com' }
        ];
        this.init();
    }

    async init() {
        // Load preferences
        const savedLinks = await StorageManager.getPref('quicklinks');
        this.links = savedLinks || this.defaultLinks;

        // Create DOM
        this.element = document.createElement('div');
        this.element.className = 'quicklinks-widget';
        this.container.appendChild(this.element);

        this.render();
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (e) {
            return '';
        }
    }

    render() {
        this.element.innerHTML = '';
        
        this.links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'quicklink-item';
            a.href = link.url;
            
            const img = document.createElement('img');
            img.className = 'quicklink-icon';
            img.src = this.getFaviconUrl(link.url);
            img.alt = link.title;
            // Handle image load error
            img.onerror = () => {
                img.style.display = 'none';
                // Fallback could be handled here in CSS via parent div background
            };

            const span = document.createElement('span');
            span.className = 'quicklink-title';
            span.textContent = link.title;

            a.appendChild(img);
            a.appendChild(span);
            this.element.appendChild(a);
        });
    }

    // In a future phase, we will add methods to add/remove links and save via StorageManager
}
