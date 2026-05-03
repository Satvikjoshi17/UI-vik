import { StorageManager } from '../storage.js';

export class Settings {
    constructor(appContainer, widgetManager = null) {
        this.appContainer = appContainer;
        this.widgetManager = widgetManager;
        this.isOpen = false;
        this.componentVisibility = {};
        this.currentTheme = 'dark';
        this.blurIntensity = 5;
        this.widgetPosition = 'right'; 
        this.init();
    }

    async init() {
        // Load saved preferences
        this.componentVisibility = await StorageManager.getPref('component_visibility', {
            clock: true,
            search: true,
            quicklinks: true
        });
        this.currentTheme = await StorageManager.getPref('theme', 'professional');
        this.blurIntensity = await StorageManager.getPref('bg_blur_val', 5);
        this.widgetPosition = await StorageManager.getPref('widget_position', 'right');
        this.searchMode = await StorageManager.getPref('search_mode', 'always');
        this.searchEngine = await StorageManager.getPref('search_engine', 'google');
        this.bgType = await StorageManager.getPref('bg_type', 'image');
        this.bgSrc = await StorageManager.getPref('bg_src', '');
        this.showSeconds = await StorageManager.getPref('show_seconds', true);
        this.accentColor = await StorageManager.getPref('accent_color', '#6c63ff');

        
        // Apply saved theme AND force the browser to load the correct CSS file immediately
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themes = ['professional', 'gaming'];
        themes.forEach(t => {
            const link = document.getElementById('theme-' + t);
            if (link) link.disabled = (t !== this.currentTheme);
        });

        // Apply saved settings
        this.applyWidgetPosition(this.widgetPosition);
        this.applySearchMode(this.searchMode);
        this.applyVisibility();
        document.documentElement.style.setProperty('--blur-intensity', `${this.blurIntensity}px`);

        // Build DOM
        this.createTriggerButton();
        this.createBackdrop();
        this.createPanel();
        this.applyAccentColor(this.accentColor);
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
                <div class="settings-section__title">Theme & Color</div>
                <div class="theme-row">
                    <button class="theme-btn ${this.currentTheme === 'professional' ? 'active' : ''}" data-theme="professional">👔 Pro</button>
                    <button class="theme-btn ${this.currentTheme === 'gaming' ? 'active' : ''}" data-theme="gaming">🎮 Gaming</button>
                    
                </div>
                <div class="color-picker-section" style="margin-top: 1.5rem;">
                    <div class="section-subtitle">Accent Spectrum</div>
                    <div class="spectrum-slider-wrapper">
                        <input type="range" id="accent-hue-slider" min="0" max="360" value="230" class="spectrum-slider">
                    </div>
                    
                    <div class="section-subtitle" style="margin-top: 1.2rem;">Signature Accents</div>
                    <div class="signature-presets">
                        <div class="preset-orb" data-color="#4361ee" style="--p-color: #4361ee"></div>
                        <div class="preset-orb" data-color="#ff006e" style="--p-color: #ff006e"></div>
                        <div class="preset-orb" data-color="#00f5d4" style="--p-color: #00f5d4"></div>
                        <div class="preset-orb" data-color="#fee440" style="--p-color: #fee440"></div>
                        <div class="preset-orb" data-color="#9b5de5" style="--p-color: #9b5de5"></div>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Components</div>
                ${this.createToggle('Clock', 'clock')}
                ${this.createToggle('Search Bar', 'search')}
                ${this.createToggle('Top Sites', 'topsites')}
                <div class="toggle-row">
                    <span class="toggle-row__label">Show Seconds</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-seconds" ${this.showSeconds ? 'checked' : ''}>
                        <span class="toggle-switch__slider"></span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Widget Position</div>
                <div class="layout-grid">
                    ${this.createLayoutOption('widget-left', '⇠', 'Left', this.widgetPosition === 'left')}
                    ${this.createLayoutOption('widget-right', '⇢', 'Right', this.widgetPosition === 'right')}
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Search Visibility</div>
                <div class="layout-grid">
                    ${this.createLayoutOption('search-always', '👁️', 'Always Show', this.searchMode === 'always')}
                    ${this.createLayoutOption('search-gesture', '👆', 'Double-Tap', this.searchMode === 'gesture')}
                    ${this.createLayoutOption('search-hidden', '🚫', 'Hidden', this.searchMode === 'hidden')}
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Search Engine</div>
                <div class="layout-grid">
                    ${this.createLayoutOption('engine-google', 'G', 'Google', this.searchEngine === 'google')}
                    ${this.createLayoutOption('engine-bing', 'B', 'Bing', this.searchEngine === 'bing')}
                    ${this.createLayoutOption('engine-ddg', 'D', 'DuckDuckGo', this.searchEngine === 'ddg')}
                </div>
                <div class="settings-action-row" style="margin-top: 1rem;">
                    <button class="settings-btn secondary destructive" id="clear-search-history">🗑️ Clear Search History</button>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section__title">Background</div>
                <div class="layout-grid">
                    ${this.createLayoutOption('bg-image', '🖼️', 'Image', this.bgType === 'image')}
                    ${this.createLayoutOption('bg-video', '🎬', 'Video', this.bgType === 'video')}
                </div>
                
                <div id="video-settings" style="display: ${this.bgType === 'video' ? 'block' : 'none'}; margin-top: 1rem;">
                    <div class="input-row">
                        <input type="text" id="bg-video-url" class="settings-input" placeholder="Video URL (mp4, webm)..." value="${this.bgSrc}">
                        <button class="settings-btn" id="apply-video-btn">Apply</button>
                    </div>
                    <p class="settings-hint">Use a direct link to a video file.</p>
                </div>

                <div id="image-settings" style="display: ${this.bgType === 'image' ? 'block' : 'none'}; margin-top: 1rem;">
                    <div class="slider-row">
                        <span class="slider-row__label">Blur Intensity</span>
                        <div class="slider-row__control">
                            <input type="range" class="range-slider" id="blur-slider" min="0" max="30" value="${this.blurIntensity}">
                            <span class="slider-row__value" id="blur-value">${this.blurIntensity}px</span>
                        </div>
                    </div>
                    <div class="upload-row">
                        <button class="settings-btn" id="upload-bg-btn">🖼️ Upload Images</button>
                        <button class="settings-btn secondary" id="reset-bg-btn">🔄 Reset</button>
                        <input type="file" id="bg-upload-input" accept="image/*" multiple style="display: none;">
                    </div>
                    <p class="settings-hint">Select multiple images to start a slideshow.</p>
                </div>

                <div id="video-upload-section" style="display: ${this.bgType === 'video' ? 'block' : 'none'}; margin-top: 1rem;">
                     <div class="upload-row">
                        <button class="settings-btn" id="upload-video-btn">🎬 Upload Local Video</button>
                        <input type="file" id="video-upload-input" accept="video/mp4,video/webm" style="display: none;">
                    </div>
                    <p class="settings-hint">Max size: 20MB. MP4/WebM recommended.</p>
                </div>

                <div class="settings-section__subtitle" style="margin-top: 1.5rem; margin-bottom: 0.8rem; font-size: 0.85rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px;">Recently Used</div>
                <div class="recent-bg-grid" id="recent-bg-grid">
                    <!-- populated by js -->
                    <div class="recent-bg-empty">No recent items</div>
                </div>
            </div>

            ${this.createWidgetSection()}
        `;

        document.body.appendChild(this.panel);
        this.bindPanelEvents();
        this.renderRecentBackgrounds();
        this.listenForGlobalActions();
    }

    listenForGlobalActions() {
        window.addEventListener('requestThemeToggle', () => {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });

        window.addEventListener('requestComponentToggle', (e) => {
            const { component } = e.detail;
            this.componentVisibility[component] = !this.componentVisibility[component];
            this.applyVisibility();
            StorageManager.setPref('component_visibility', this.componentVisibility);
            
            const toggle = this.panel.querySelector(`input[data-component="${component}"]`);
            if (toggle) toggle.checked = this.componentVisibility[component];
        });

        window.addEventListener('requestSearchModeCycle', () => {
            const modes = ['always', 'gesture', 'hidden'];
            const nextIdx = (modes.indexOf(this.searchMode) + 1) % modes.length;
            this.setLayout(`search-${modes[nextIdx]}`);
        });
    }

    updateActiveOptions() {
        this.panel.querySelectorAll('.layout-option').forEach(opt => {
            const val = opt.dataset.layout;
            let isActive = false;
            
            if (val.startsWith('widget-')) isActive = (val === `widget-${this.widgetPosition}`);
            else if (val.startsWith('search-')) isActive = (val === `search-${this.searchMode}`);
            else if (val.startsWith('engine-')) isActive = (val === `engine-${this.searchEngine}`);
            else if (val.startsWith('bg-')) isActive = (val === `bg-${this.bgType}`);
            
            opt.classList.toggle('active', isActive);
        });
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

    createLayoutOption(value, icon, label, isActive = false) {
        const activeClass = isActive ? 'active' : '';
        return `
            <div class="layout-option ${activeClass}" data-layout="${value}">
                <div class="layout-option__icon">${icon}</div>
                ${label}
            </div>
        `;
    }

    bindPanelEvents() {
        this.panel.querySelector('.settings-panel__close').addEventListener('click', () => this.close());

        this.panel.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setTheme(btn.dataset.theme));
        });

        this.panel.querySelectorAll('.toggle-switch input').forEach(input => {
            input.addEventListener('change', () => {
                const component = input.dataset.component;
                this.componentVisibility[component] = input.checked;
                this.applyVisibility();
                StorageManager.setPref('component_visibility', this.componentVisibility);
            });
        });

        this.panel.querySelectorAll('.layout-option').forEach(opt => {
            opt.addEventListener('click', () => this.setLayout(opt.dataset.layout));
        });

        const secondsToggle = this.panel.querySelector('#toggle-seconds');
        if (secondsToggle) {
            secondsToggle.addEventListener('change', () => {
                this.showSeconds = secondsToggle.checked;
                StorageManager.setPref('show_seconds', this.showSeconds);
                window.dispatchEvent(new CustomEvent('clockSecondsUpdate', { detail: { show: this.showSeconds } }));
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });

        const blurSlider = this.panel.querySelector('#blur-slider');
        const blurValue = this.panel.querySelector('#blur-value');
        if (blurSlider) {
            blurSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                this.blurIntensity = parseInt(val);
                blurValue.textContent = `${val}px`;
                document.documentElement.style.setProperty('--blur-intensity', `${val}px`);
                StorageManager.setPref('bg_blur', `${val}px`);
                StorageManager.setPref('bg_blur_val', parseInt(val));
            });
        }

        const uploadBtn = this.panel.querySelector('#upload-bg-btn');
        const uploadInput = this.panel.querySelector('#bg-upload-input');
        const resetBtn = this.panel.querySelector('#reset-bg-btn');

        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;

                const processFile = (file) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 1920;
                                let width = img.width;
                                let height = img.height;
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);
                                resolve(canvas.toDataURL('image/jpeg', 0.8));
                            };
                            img.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                    });
                };

                try {
                    const dataUrls = await Promise.all(files.map(file => processFile(file)));
                    const bgData = { 
                        type: 'image', 
                        src: dataUrls.length === 1 ? dataUrls[0] : dataUrls 
                    };
                    
                    await StorageManager.setPref('background_data', bgData);
                    await StorageManager.saveRecentBackground(bgData);
                    window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: bgData }));
                    this.renderRecentBackgrounds();
                } catch (err) {
                    console.error('Upload failed:', err);
                    alert('Failed to process images.');
                }
            });
        }

        const videoUploadBtn = this.panel.querySelector('#upload-video-btn');
        const videoUploadInput = this.panel.querySelector('#video-upload-input');
        
        if (videoUploadBtn && videoUploadInput) {
            videoUploadBtn.addEventListener('click', () => videoUploadInput.click());
            videoUploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // 20MB limit check
                if (file.size > 20 * 1024 * 1024) {
                    alert('Video is too large! Please select a file under 20MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    const bgData = { type: 'video', src: event.target.result };
                    await StorageManager.setPref('background_data', bgData);
                    await StorageManager.saveRecentBackground(bgData);
                    window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: bgData }));
                    this.renderRecentBackgrounds();
                };
                reader.readAsDataURL(file);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                await StorageManager.saveMedia('custom_bg', null);
                const defaultBg = { type: 'image', src: 'https://images.unsplash.com/photo-1506744626753-1fa28f67c9bf?auto=format&fit=crop&w=1920&q=80' };
                await StorageManager.setPref('background_data', defaultBg);
                window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: defaultBg }));
            });
        }

        const videoInput = this.panel.querySelector('#bg-video-url');
        const applyVideoBtn = this.panel.querySelector('#apply-video-btn');
        if (applyVideoBtn && videoInput) {
            applyVideoBtn.addEventListener('click', async () => {
                const url = videoInput.value.trim();
                if (!url) return;
                this.bgSrc = url;
                StorageManager.setPref('bg_src', url);
                const bgData = { type: 'video', src: url };
                await StorageManager.setPref('background_data', bgData);
                window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: bgData }));
            });
        }

        if (this.widgetManager) {
            this.panel.querySelectorAll('[data-widget]').forEach(input => {
                input.addEventListener('change', async () => {
                    await this.widgetManager.toggle(input.dataset.widget);
                });
            });
        }

        const clearHistoryBtn = this.panel.querySelector('#clear-search-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your search history?')) {
                    window.dispatchEvent(new CustomEvent('clearSearchHistory'));
                }
            });
        }

        const hueSlider = this.panel.querySelector('#accent-hue-slider');
        if (hueSlider) {
            hueSlider.addEventListener('input', (e) => {
                const hue = e.target.value;
                const color = `hsl(${hue}, 80%, 60%)`;
                this.applyAccentColor(color);
            });
            hueSlider.addEventListener('change', () => {
                StorageManager.setPref('accent_color', this.accentColor);
            });
        }

        this.panel.querySelectorAll('.preset-orb').forEach(orb => {
            orb.addEventListener('click', () => {
                const color = orb.dataset.color;
                this.applyAccentColor(color);
                StorageManager.setPref('accent_color', color);
                
                // Visual feedback
                this.panel.querySelectorAll('.preset-orb').forEach(o => o.classList.remove('active'));
                orb.classList.add('active');
            });
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.panel.classList.add('open');
        this.backdrop.classList.add('active');
        document.body.classList.add('settings-open');
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('open');
        this.backdrop.classList.remove('active');
        document.body.classList.remove('settings-open');
    }

    applyAccentColor(color) {
        this.accentColor = color;
        const root = document.documentElement;
        
        // If it's HSL, we need to convert or just apply
        root.style.setProperty('--accent-color', color);
        
        // Generate a subtle gradient
        // If it's a hex, we use adjustColor, if HSL we can just shift the hue
        let secondary;
        if (color.startsWith('#')) {
            secondary = this.adjustColor(color, 20);
        } else {
            // HSL logic: shift hue slightly
            const hueMatch = color.match(/hsl\((\d+)/);
            if (hueMatch) {
                const h = parseInt(hueMatch[1]);
                secondary = `hsl(${(h + 20) % 360}, 85%, 65%)`;
            } else {
                secondary = color;
            }
        }
        
        root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${color}, ${secondary})`);
        
        // Update slider value if it's HSL and panel exists
        if (this.panel) {
            const hueMatch = color.match(/hsl\((\d+)/);
            const hueSlider = this.panel.querySelector('#accent-hue-slider');
            if (hueMatch && hueSlider) {
                hueSlider.value = hueMatch[1];
            }
        }
    }

    adjustColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        StorageManager.setPref('theme', theme);
        this.panel.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        // Dynamically enable the correct theme CSS
        const themes = ['professional', 'gaming'];
        themes.forEach(t => {
            const link = document.getElementById('theme-' + t);
            if (link) link.disabled = (t !== theme);
        });
    }

    setLayout(layout) {
        if (layout.startsWith('widget-')) {
            const pos = layout.replace('widget-', '');
            this.widgetPosition = pos;
            this.applyWidgetPosition(pos);
            StorageManager.setPref('widget_position', pos);
        } else if (layout.startsWith('search-')) {
            const mode = layout.replace('search-', '');
            this.searchMode = mode;
            this.applySearchMode(mode);
            StorageManager.setPref('search_mode', mode);
        } else if (layout.startsWith('engine-')) {
            const engine = layout.replace('engine-', '');
            this.searchEngine = engine;
            StorageManager.setPref('search_engine', engine);
            window.dispatchEvent(new CustomEvent('searchEngineUpdate', { detail: { engine } }));
        } else if (layout.startsWith('bg-')) {
            const type = layout.replace('bg-', '');
            this.bgType = type;
            StorageManager.setPref('bg_type', type);
            this.panel.querySelector('#video-upload-section').style.display = type === 'video' ? 'block' : 'none';
            this.panel.querySelector('#video-settings').style.display = type === 'video' ? 'block' : 'none';
            this.panel.querySelector('#image-settings').style.display = type === 'image' ? 'block' : 'none';
            if (type === 'image') {
                this.refreshBackgroundImage();
            } else if (type === 'video' && this.bgSrc) {
                const bgData = { type: 'video', src: this.bgSrc };
                StorageManager.setPref('background_data', bgData);
                window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: bgData }));
            }
        } 
        this.updateActiveOptions();
    }

    async renderRecentBackgrounds() {
        const recents = await StorageManager.getRecentBackgrounds();
        const grid = this.panel.querySelector('#recent-bg-grid');
        if (!grid) return;

        if (recents.length === 0) {
            grid.innerHTML = '<div class="recent-bg-empty">No recent items</div>';
            return;
        }

        grid.innerHTML = recents.map(item => {
            const isSlideshow = Array.isArray(item.src);
            const previewSrc = isSlideshow ? item.src[0] : item.src;
            
            return `
                <div class="recent-item" data-bg='${JSON.stringify(item)}'>
                    ${item.type === 'video' ? `<video src="${previewSrc}" muted></video><div class="video-badge">VIDEO</div>` : `<img src="${previewSrc}">`}
                    ${isSlideshow ? `<div class="video-badge" style="background: var(--accent-color)">SLIDE</div>` : ''}
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.recent-item').forEach(el => {
            el.addEventListener('click', async () => {
                const bgData = JSON.parse(el.dataset.bg);
                await StorageManager.setPref('background_data', bgData);
                window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: bgData }));
                this.updateActiveRecent(el);
            });
        });
    }

    updateActiveRecent(activeEl) {
        this.panel.querySelectorAll('.recent-item').forEach(el => el.classList.remove('active'));
        activeEl.classList.add('active');
    }

    async refreshBackgroundImage() {
        const customBg = await StorageManager.getMedia('custom_bg');
        const src = customBg || 'https://images.unsplash.com/photo-1506744626753-1fa28f67c9bf?auto=format&fit=crop&w=1920&q=80';
        window.dispatchEvent(new CustomEvent('backgroundUpdate', { 
            detail: { type: 'image', src } 
        }));
        this.renderRecentBackgrounds();
    }

    applySearchMode(mode) {
        window.dispatchEvent(new CustomEvent('searchModeUpdate', { detail: { mode } }));
    }

    applyWidgetPosition(pos) {
        const widgetArea = this.appContainer.querySelector('.widget-area');
        if (widgetArea) {
            widgetArea.classList.remove('left', 'right');
            widgetArea.classList.add(pos);
        }
        
        // Update body class for theme-based positioning
        document.body.classList.remove('widgets-left', 'widgets-right');
        document.body.classList.add(`widgets-${pos}`);

        // Update component specific position classes
        const clock = this.appContainer.querySelector('.clock-widget');
        if (clock) {
            clock.classList.remove('pos-left', 'pos-right');
            clock.classList.add(pos === 'left' ? 'pos-right' : 'pos-left');
        }

        const topSites = this.appContainer.querySelector('.top-sites-widget');
        if (topSites) {
            topSites.classList.remove('pos-left', 'pos-right');
            topSites.classList.add(pos === 'left' ? 'pos-right' : 'pos-left');
        }

        const player = this.appContainer.querySelector('.media-controller');
        if (player) {
            player.classList.remove('pos-left', 'pos-right');
            player.classList.add(`pos-${pos}`);
        }

        // Update search bar position to follow widgets (important for Gaming Theme)
        const search = this.appContainer.querySelector('.search-widget');
        if (search) {
            search.classList.remove('pos-left', 'pos-right');
            search.classList.add(`pos-${pos}`);
        }
    }

    applyVisibility() {
        const componentMap = {
            clock: '.clock-widget',
            search: '.search-widget',
            topsites: '.top-sites-widget'
        };
        Object.entries(componentMap).forEach(([key, selector]) => {
            const el = this.appContainer.querySelector(selector);
            if (el) {
                el.style.display = this.componentVisibility[key] !== false ? 'flex' : 'none';
            }
        });
    }

    createWidgetSection() {
        if (!this.widgetManager) return '';
        const widgets = this.widgetManager.getAvailableWidgets();
        if (widgets.length === 0) return '';
        let togglesHtml = '';
        for (const w of widgets) {
            const checked = this.widgetManager.isActive(w.id) ? 'checked' : '';
            togglesHtml += `
                <div class="toggle-row">
                    <span class="toggle-row__label">${w.icon} ${w.name}</span>
                    <label class="toggle-switch">
                        <input type="checkbox" data-widget="${w.id}" ${checked}>
                        <span class="toggle-switch__slider"></span>
                    </label>
                </div>
            `;
        }
        return `<div class="settings-section"><div class="settings-section__title">Widgets</div>${togglesHtml}</div>`;
    }
}
