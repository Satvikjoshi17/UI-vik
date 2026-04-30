import { StorageManager } from '../storage.js';
import { NotesWidget } from './notes-widget.js';
import { TodoWidget } from './todo-widget.js';

/**
 * WidgetManager — Orchestrates widget lifecycle.
 * Registers available widgets, manages active instances, and handles persistence.
 */
export class WidgetManager {
    constructor(container) {
        this.container = container;
        this.registry = new Map(); // id -> WidgetClass
        this.activeWidgets = new Map(); // id -> instance
    }

    /**
     * Register a widget class.
     * @param {typeof BaseWidget} WidgetClass
     */
    register(WidgetClass) {
        const { id } = WidgetClass.metadata;
        this.registry.set(id, WidgetClass);
    }

    /**
     * Initialize: register default widgets and restore active state.
     */
    async init() {
        // Register all available widgets
        this.register(NotesWidget);
        this.register(TodoWidget);

        // Load which widgets are active
        const activeIds = await StorageManager.getPref('active_widgets', []);
        for (const id of activeIds) {
            await this.activate(id);
        }
    }

    /**
     * Activate a widget by ID.
     * @param {string} id
     */
    async activate(id) {
        if (this.activeWidgets.has(id)) return;

        const WidgetClass = this.registry.get(id);
        if (!WidgetClass) return;

        const instance = new WidgetClass(this.container);
        await instance.render();
        this.activeWidgets.set(id, instance);

        await this.saveActiveList();
    }

    /**
     * Deactivate a widget by ID.
     * @param {string} id
     */
    async deactivate(id) {
        const instance = this.activeWidgets.get(id);
        if (!instance) return;

        instance.destroy();
        this.activeWidgets.delete(id);

        await this.saveActiveList();
    }

    /**
     * Toggle a widget on/off.
     * @param {string} id
     * @returns {boolean} new active state
     */
    async toggle(id) {
        if (this.activeWidgets.has(id)) {
            await this.deactivate(id);
            return false;
        } else {
            await this.activate(id);
            return true;
        }
    }

    /**
     * Check if a widget is active.
     * @param {string} id
     * @returns {boolean}
     */
    isActive(id) {
        return this.activeWidgets.has(id);
    }

    /**
     * Get all registered widget metadata.
     * @returns {Array<{id, name, icon, description}>}
     */
    getAvailableWidgets() {
        const list = [];
        for (const [id, WidgetClass] of this.registry) {
            list.push(WidgetClass.metadata);
        }
        return list;
    }

    /**
     * Persist which widgets are active.
     */
    async saveActiveList() {
        const ids = Array.from(this.activeWidgets.keys());
        await StorageManager.setPref('active_widgets', ids);
    }
}
