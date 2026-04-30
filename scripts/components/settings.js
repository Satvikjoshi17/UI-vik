import { StorageManager } from '../storage.js';

export class Settings {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.isOpen = false;
        this.componentVisibility = {};
        this.currentLayout = 'centered';
        this.currentTheme = 'dark';
        this.init();
    }

    async init() {
        // Load saved preferences
        this.componentVisibility = await StorageManager.getPref('component_visibility', {
            clock: true,
            search: true,
            quicklinks: true
        });
        this.currentLayout = await StorageManager.getPref('layout', 'centered');
        this.currentTheme = await StorageManager.getPref('theme', 'dark');

        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Apply saved layout
        this.applyLayout(this.currentLayout);

        // Apply saved visibility
        this.applyVisibility();

        // Build DOM
        this.createTriggerButton();
        this.createBackdrop();
        this.createPanel();
    }

    createTriggerButton() {
        this.trigger = document.createElement('button');
        this.trigger.className = 'settings-trigger';
        this.trigger.innerHTML = '⚙';
        this.trigger.title = 'Settings';
        this.trigger.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.trigger);
    }

    createBackdrop() {
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'settings-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this.backdrop);
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'settings-panel';
        this.panel.innerHTML = `
            <div class="settings-panel__header">
                <span class="settings-panel__title">Settings</span>
                <button class="settings-panel__close">✕</button>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Theme</div>
                <div class="theme-row">
                    <button class="theme-btn ${this.currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">🌙 Dark</button>
                    <button class="theme-btn ${this.currentTheme === 'light' ? 'active' : ''}" data-theme="light">☀️ Light</button>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Components</div>
                ${this.createToggle('Clock', 'clock')}
                ${this.createToggle('Search Bar', 'search')}
                ${this.createToggle('Quick Links', 'quicklinks')}
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Layout</div>
                <div class="layout-grid">
                    ${this.createLayoutOption('centered', '⊙', 'Centered')}
                    ${this.createLayoutOption('top', '⬆', 'Top')}
                    ${this.createLayoutOption('bottom', '⬇', 'Bottom')}
                    ${this.createLayoutOption('spread', '↕', 'Spread')}
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);
        this.bindPanelEvents();
    }

    createToggle(label, key) {
        const checked = this.componentVisibility[key] !== false ? 'checked' : '';
        return `
            <div class="toggle-row">
                <span class="toggle-row__label">${label}</span>
                <label class="toggle-switch">
                    <input type="checkbox" data-component="${key}" ${checked}>
                    <span class="toggle-switch__slider"></span>
                </label>
            </div>
        `;
    }

    createLayoutOption(value, icon, label) {
        const active = this.currentLayout === value ? 'active' : '';
        return `
            <div class="layout-option ${active}" data-layout="${value}">
                <div class="layout-option__icon">${icon}</div>
                ${label}
            </div>
        `;
    }

    bindPanelEvents() {
        // Close button
        this.panel.querySelector('.settings-panel__close').addEventListener('click', () => this.close());

        // Theme buttons
        this.panel.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setTheme(btn.dataset.theme));
        });

        // Component toggles
        this.panel.querySelectorAll('.toggle-switch input').forEach(input => {
            input.addEventListener('change', () => {
                this.componentVisibility[input.dataset.component] = input.checked;
                this.applyVisibility();
                StorageManager.setPref('component_visibility', this.componentVisibility);
            });
        });

        // Layout options
        this.panel.querySelectorAll('.layout-option').forEach(opt => {
            opt.addEventListener('click', () => this.setLayout(opt.dataset.layout));
        });

        // Keyboard shortcut (Escape to close)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.panel.classList.add('open');
        this.backdrop.classList.add('active');
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('open');
        this.backdrop.classList.remove('active');
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        StorageManager.setPref('theme', theme);

        // Update active state on buttons
        this.panel.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    setLayout(layout) {
        this.currentLayout = layout;
        this.applyLayout(layout);
        StorageManager.setPref('layout', layout);

        // Update active state on options
        this.panel.querySelectorAll('.layout-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.layout === layout);
        });
    }

    applyLayout(layout) {
        const mainContent = this.appContainer.querySelector('.main-content');
        if (!mainContent) return;

        // Remove all layout classes
        mainContent.classList.remove('layout-centered', 'layout-top', 'layout-bottom', 'layout-spread');
        mainContent.classList.add(`layout-${layout}`);
    }

    applyVisibility() {
        const componentMap = {
            clock: '.clock-widget',
            search: '.search-widget',
            quicklinks: '.quicklinks-widget'
        };

        Object.entries(componentMap).forEach(([key, selector]) => {
            const el = this.appContainer.querySelector(selector);
            if (el) {
                el.style.display = this.componentVisibility[key] !== false ? '' : 'none';
            }
        });
    }
}
