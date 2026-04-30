import { StorageManager } from '../storage.js';

/**
 * BaseWidget - Abstract base class for all widgets.
 * Every widget must extend this and implement the lifecycle methods.
 */
export class BaseWidget {
    /**
     * Static metadata — override in subclass.
     * @returns {{ id: string, name: string, icon: string, description: string }}
     */
    static get metadata() {
        return {
            id: 'base',
            name: 'Base Widget',
            icon: '📦',
            description: 'A base widget.'
        };
    }

    constructor(container) {
        this.container = container;
        this.element = null;
        this._storageKey = `widget_${this.constructor.metadata.id}`;
    }

    /**
     * Render the widget and append to container.
     * Must be implemented by subclass.
     */
    render() {
        throw new Error('render() must be implemented by subclass');
    }

    /**
     * Cleanup and remove from DOM.
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }

    /**
     * Serialize widget state for persistence.
     * Override in subclass to save custom data.
     * @returns {Object}
     */
    serialize() {
        return {};
    }

    /**
     * Restore widget state from saved data.
     * Override in subclass to restore custom data.
     * @param {Object} data
     */
    deserialize(data) {
        // Override in subclass
    }

    /**
     * Save current state to StorageManager.
     */
    async saveState() {
        const data = this.serialize();
        await StorageManager.setPref(this._storageKey, data);
    }

    /**
     * Load saved state from StorageManager.
     * @returns {Object|null}
     */
    async loadState() {
        return await StorageManager.getPref(this._storageKey, null);
    }

    /**
     * Helper: create a glassmorphism widget card wrapper.
     * @param {string} title
     * @returns {HTMLElement}
     */
    createCard(title) {
        const card = document.createElement('div');
        card.className = 'widget-card';

        const header = document.createElement('div');
        header.className = 'widget-card__header';

        const titleEl = document.createElement('span');
        titleEl.className = 'widget-card__title';
        titleEl.textContent = `${this.constructor.metadata.icon} ${title}`;

        header.appendChild(titleEl);

        const body = document.createElement('div');
        body.className = 'widget-card__body';

        card.appendChild(header);
        card.appendChild(body);

        this.element = card;
        this.bodyElement = body;
        this.container.appendChild(card);

        return card;
    }
}
