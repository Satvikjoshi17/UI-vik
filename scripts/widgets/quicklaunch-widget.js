import { BaseWidget } from './base-widget.js';

/**
 * QuickLaunch Widget — User-defined shortcut launcher grid.
 * Supports URLs, steam://, epic://, and custom protocols.
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

        // Load saved state
        const saved = await this.loadState();
        if (saved && saved.items) {
            this.items = saved.items;
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

            // Favicon
            const iconWrap = document.createElement('div');
            iconWrap.className = 'ql-item-icon';
            if (item.url.startsWith('http')) {
                const img = document.createElement('img');
                const domain = new URL(item.url).hostname;
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                img.alt = item.title;
                img.onerror = () => { img.style.display = 'none'; iconWrap.textContent = item.title.charAt(0).toUpperCase(); };
                iconWrap.appendChild(img);
            } else {
                iconWrap.textContent = item.icon || item.title.charAt(0).toUpperCase();
            }

            const label = document.createElement('span');
            label.className = 'ql-item-label';
            label.textContent = item.title;

            // Remove button (visible on hover)
            const removeBtn = document.createElement('button');
            removeBtn.className = 'ql-item-remove';
            removeBtn.textContent = '×';
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
        // Create inline dialog
        if (this.dialogEl) return;

        this.dialogEl = document.createElement('div');
        this.dialogEl.className = 'ql-dialog';
        this.dialogEl.innerHTML = `
            <input type="text" class="ql-dialog-input" placeholder="Title (e.g., Steam)" id="ql-title">
            <input type="text" class="ql-dialog-input" placeholder="URL (e.g., https://store.steampowered.com)" id="ql-url">
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
                this.items.push({ title, url, icon: title.charAt(0) });
                this.renderGrid();
                this.saveState();
                this.closeDialog();
            }
        });

        // Enter key support
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
