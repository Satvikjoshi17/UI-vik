import { StorageManager } from '../storage.js';

export class TopSites {
    constructor(container) {
        this.container = container;
        this.init();
    }

    async init() {
        this.element = document.createElement('div');
        this.element.className = 'top-sites-widget';
        this.container.appendChild(this.element);

        this.render();
        
        // Listen for search history updates to refresh the list
        window.addEventListener('searchHistoryUpdated', () => this.render());
    }

    async render() {
        this.element.innerHTML = '';
        
        if (typeof chrome !== 'undefined' && chrome.topSites) {
            chrome.topSites.get((sites) => {
                // Show only real top sites, limit to 4
                const topItems = sites.slice(0, 4).map(s => ({ ...s, type: 'site' }));
                topItems.forEach(item => {
                    this.element.appendChild(this.createItem(item));
                });
            });
        } else {
            this.renderMock();
        }
    }

    createItem(item) {
        const link = document.createElement('a');
        link.className = `top-site-item ${item.type}`;
        link.href = item.url;
        link.title = item.title;

        let iconContent = '';
        if (item.type === 'site') {
            const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(item.url)}`;
            iconContent = `<img src="${iconUrl}" alt="${item.title}">`;
        } else {
            iconContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
        }
        
        link.innerHTML = `
            <div class="top-site-icon">
                ${iconContent}
            </div>
            <span class="top-site-label">${this.truncate(item.title, 12)}</span>
        `;

        return link;
    }

    truncate(str, n) {
        if (!str) return '';
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    }

    async renderMock() {
        const mockSites = [
            { title: 'Google', url: 'https://google.com', type: 'site' },
            { title: 'YouTube', url: 'https://youtube.com', type: 'site' },
            { title: 'GitHub', url: 'https://github.com', type: 'site' },
            { title: 'Gmail', url: 'https://gmail.com', type: 'site' }
        ];
        
        mockSites.forEach(item => {
            this.element.appendChild(this.createItem(item));
        });
    }
}
