import { BaseWidget } from './base-widget.js';

/**
 * QuickLaunch Widget - Gaming Arsenal Edition
 * Pre-loaded with real gamer utilities and local app protocols.
 */

export class QuickLaunchWidget extends BaseWidget {
    static get metadata() {
        return {
            id: 'quicklaunch',
            name: 'Quick Launch',
            icon: '🚀',
            description: 'Pin your favorite apps, games & sites for instant access.'
        };
    }

    constructor(container) {
        super(container);
        this.items = [];
        this.maxItems = 8;
        this.isEditing = false;
            // THE ULTIMATE GAMER DEFAULTS
        // Uses web links for dashboards, and native app protocols (steam://) for clients.
        this.defaultArsenal = [
            { title: 'Steam', url: 'steam://open/main', customIcon: 'S' },
            { title: 'Discord', url: 'https://discord.com/app', customIcon: null },
            { title: 'Twitch', url: 'https://www.twitch.tv/', customIcon: null },
            { title: 'Epic Games', url: 'https://store.epicgames.com/', customIcon: null },
            { title: 'Tracker.gg', url: 'https://tracker.gg/', customIcon: null }, // Game stats (Val, Apex, CS2)
            { title: 'SteamDB', url: 'https://steamdb.info/', customIcon: null },   // Live player counts & sales
            { title: 'HLTB', url: 'https://howlongtobeat.com/', customIcon: null }  // How Long To Beat database
        ];
    }

    async render() {
        this.createCard('Quick Launch');

        // Grid container
        this.gridEl = document.createElement('div');
        this.gridEl.className = 'ql-grid';

        // Add button (always last in grid)
        this.addBtnEl = document.createElement('button');
        this.addBtnEl.className = 'ql-add-btn';
        this.addBtnEl.innerHTML = `<span class="ql-add-icon">+</span><span class="ql-add-label">Add</span>`;
        this.addBtnEl.addEventListener('click', () => this.showAddDialog());

        this.bodyElement.appendChild(this.gridEl);

        // Load saved state or inject default Arsenal
        const saved = await this.loadState();
        if (saved && saved.items && saved.items.length > 0) {
            this.items = saved.items;
        } else {
            this.items = [...this.defaultArsenal];
            this.saveState(); // Save defaults so they persist
        }

        this.renderGrid();
    }

    renderGrid() {
        this.gridEl.innerHTML = '';

        this.items.forEach((item, index) => {
            const el = document.createElement('a');
            el.className = 'ql-item';
            el.href = item.url;
            el.target = item.url.startsWith('http') ? '_blank' : '_self';
            el.setAttribute('data-index', index);

            // Icon Wrapper
            const iconWrap = document.createElement('div');
            iconWrap.className = 'ql-item-icon';

            // Smart Icon Routing (Handles both Web Favicons and Local App Protocols)
            if (item.url.startsWith('http')) {
                const img = document.createElement('img');
                const domain = new URL(item.url).hostname;
                // Google's high-res favicon fetcher
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                img.alt = item.title;
                img.onerror = () => { 
                    img.style.display = 'none'; 
                    iconWrap.innerHTML = `<span style="font-weight: 800; font-size: 1.2rem; color: #fff;">${item.title.charAt(0).toUpperCase()}</span>`; 
                };
                iconWrap.appendChild(img);
            } else if (item.url.startsWith('steam://')) {
                // Custom SVG for local Steam App Launcher
                iconWrap.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M11.979 0C5.353 0 0 5.373 0 12c0 6.628 5.353 12 11.979 12 6.627 0 11.979-5.372 11.979-12C23.958 5.373 18.606 0 11.979 0zM17.4 12.3c-.6-.2-1.3-.2-1.8.1l-2.6-1.1c.1-.2.1-.4.1-.6 0-1.6-1.3-2.9-2.9-2.9-1.6 0-2.9 1.3-2.9 2.9 0 1.3.8 2.3 1.9 2.7l-1.6 4.6c-.2 0-.4-.1-.5-.1-1.3 0-2.4 1.1-2.4 2.4 0 1.3 1.1 2.4 2.4 2.4s2.4-1.1 2.4-2.4c0-.3 0-.5-.1-.7l4.3-1.8c.3.2.7.3 1.1.3 1.6 0 2.9-1.3 2.9-2.9.1-1.7-1.2-3-2.9-3zm-7.2 6.9c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm2.1-8.5c0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4zm4.8 4.2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`;
            } else {
                // Fallback for custom apps (e.g. epic://)
                iconWrap.innerHTML = `<span style="font-weight: 800; font-size: 1.2rem; color: #fff;">${item.title.charAt(0).toUpperCase()}</span>`;
            }

            const label = document.createElement('span');
            label.className = 'ql-item-label';
            label.textContent = item.title;

            // Remove button (visible on hover)
            const removeBtn = document.createElement('button');
            removeBtn.className = 'ql-item-remove';
            removeBtn.innerHTML = '✖';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeItem(index);
            });

            el.appendChild(removeBtn);
            el.appendChild(iconWrap);
            el.appendChild(label);
            this.gridEl.appendChild(el);
        });

        // Show add button if under max
        if (this.items.length < this.maxItems) {
            this.gridEl.appendChild(this.addBtnEl);
        }
    }

    showAddDialog() {
        if (this.dialogEl) return;

        this.dialogEl = document.createElement('div');
        this.dialogEl.className = 'ql-dialog';
        this.dialogEl.innerHTML = `
            <input type="text" class="ql-dialog-input" placeholder="Title (e.g., Reddit)" id="ql-title">
            <input type="text" class="ql-dialog-input" placeholder="URL (or steam:// link)" id="ql-url">
            <div class="ql-dialog-actions">
                <button class="ql-dialog-btn ql-dialog-cancel">Cancel</button>
                <button class="ql-dialog-btn ql-dialog-save">Add</button>
            </div>
        `;
        
        this.bodyElement.appendChild(this.dialogEl);

        const titleInput = this.dialogEl.querySelector('#ql-title');
        const urlInput = this.dialogEl.querySelector('#ql-url');

        this.dialogEl.querySelector('.ql-dialog-cancel').addEventListener('click', () => this.closeDialog());
        
        this.dialogEl.querySelector('.ql-dialog-save').addEventListener('click', () => {
            const title = titleInput.value.trim();
            const url = urlInput.value.trim();
            if (title && url) {
                this.items.push({ title, url });
                this.renderGrid();
                this.saveState();
                this.closeDialog();
            }
        });

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.dialogEl.querySelector('.ql-dialog-save').click();
        });

        requestAnimationFrame(() => titleInput.focus());
    }

    closeDialog() {
        if (this.dialogEl) {
            this.dialogEl.remove();
            this.dialogEl = null;
        }
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.renderGrid();
        this.saveState();
    }

    serialize() {
        return { items: this.items };
    }

    deserialize(data) {
        if (data && data.items) {
            this.items = data.items;
            this.renderGrid();
        }
    }
}