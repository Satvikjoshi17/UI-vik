/**
 * media-controller.js - UI-vik (visual-increment-kit)
 * Component for rendering media controls and history.
 */
export class MediaController {
    constructor(parent) {
        this.parent = parent || document.querySelector('.main-content');
        this.container = null;
        this.isPlaying = false;
        this.currentTabId = null;
        this.isReady = false; // Guard for async updates[cite: 4]
        this.init();
    }

    init() {
        this.createUI();
        this.listenForMedia();
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({ type: 'GET_MEDIA_STATE' }).catch(() => { });
        }
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'media-controller';
        this.container.innerHTML = `
            <div class="media-art">
                <img src="" alt="Art" id="media-artwork" style="display:none">
                <div class="art-placeholder">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                </div>
            </div>
            <div class="media-info">
                <div class="media-title" id="media-title">Not Playing</div>
                <div class="media-artist" id="media-artist">Select a tab with music</div>
            </div>
            <div class="media-controls">
                <button class="m-btn" id="m-loop" title="Toggle Loop">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                </button>
                <button class="m-btn" id="m-prev" title="Previous"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg></button>
                <button class="m-btn play-btn" id="m-play" title="Play/Pause"><svg id="play-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
                <button class="m-btn" id="m-next" title="Next"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg></button>
                <button class="m-btn history-toggle" id="m-history" title="History"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></button>
                <button class="m-btn minimize-toggle" id="m-minimize" title="Minimize"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" id="minimize-icon"><path d="M18 15l-6-6-6 6"/></svg></button>
            </div>
            <div class="media-history-panel" id="media-history-panel">
                <div class="history-header">Recent Tracks</div>
                <div class="history-list" id="history-list"></div>
            </div>
        `;
        this.parent.appendChild(this.container);
        this.isReady = true; // DOM is now safe to manipulate[cite: 4]
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Single delegated listener for all buttons
        this.container.onclick = (e) => {
            const btn = e.target.closest('.m-btn');
            if (!btn) return;

            const id = btn.id;

            if (id === 'm-play') this.sendCommand('toggle');
            if (id === 'm-next') this.sendCommand('next');
            if (id === 'm-prev') this.sendCommand('prev');

            if (id === 'm-loop') {
                this.sendCommand('loop');

                // 1. Instant (Optimistic) UI change
                const isCurrentlyActive = btn.style.color !== '';
                if (isCurrentlyActive) {
                    btn.style.removeProperty('color');
                } else {
                    btn.style.setProperty('color', 'var(--accent-color)', 'important');
                }
            }

            if (id === 'm-history') {
                e.stopPropagation();
                this.container.classList.toggle('history-open');
            }

            if (id === 'm-minimize') {
                e.stopPropagation();
                this.container.classList.toggle('minimized');
            }
        };

        document.addEventListener('click', (e) => {
            if (this.container && !this.container.contains(e.target)) {
                this.container.classList.remove('history-open');
            }
        });
    }

    sendCommand(command) {
        if (command === 'toggle') {
            this.isPlaying = !this.isPlaying;
            this.updatePlayIcon(this.isPlaying);
        }
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({
                type: 'MEDIA_COMMAND',
                data: { command, tabId: this.currentTabId }
            }).catch(() => { });
        }
    }

    updatePlayIcon(playing) {
        const svg = this.container?.querySelector('#play-svg');
        if (svg) svg.innerHTML = playing ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
    }

    updateUI(data) {
        if (!this.isReady || !this.container) return; // Prevent TypeError[cite: 4]
        const loopBtn = this.container.querySelector('#m-loop');
        if (loopBtn) {
            // 2. Persistent Sync: Follow the actual tab state
            if (data.isLooping) {
                loopBtn.style.setProperty('color', 'var(--accent-color)', 'important');
            } else {
                loopBtn.style.removeProperty('color');
            }
        }

        this.currentTabId = data.tabId;
        this.isPlaying = data.isPlaying;

        const titleEl = this.container.querySelector('#media-title');
        const artistEl = this.container.querySelector('#media-artist');
        const artImg = this.container.querySelector('#media-artwork');
        const artPlaceholder = this.container.querySelector('.art-placeholder');

        if (titleEl) titleEl.textContent = data.title || 'Not Playing';
        if (artistEl) artistEl.textContent = data.artist || '';
        this.updatePlayIcon(this.isPlaying);

        if (artImg) {
            if (data.artwork) {
                artImg.src = data.artwork;
                artImg.style.display = 'block';
                if (artPlaceholder) artPlaceholder.style.display = 'none';
            } else {
                artImg.style.display = 'none';
                if (artPlaceholder) artPlaceholder.style.display = 'block';
            }
        }

        const listEl = this.container.querySelector('#history-list');
        if (listEl && data.history) {
            listEl.innerHTML = data.history.map(item => `
                <div class="history-item" data-url="${item.url}">
                    <div class="h-item-title">${item.title}</div>
                    <div class="h-item-artist">${item.artist}</div>
                </div>
            `).join('');

            listEl.querySelectorAll('.history-item').forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation();
                    chrome.runtime.sendMessage({
                        type: 'MEDIA_COMMAND',
                        data: { command: 'play', url: item.dataset.url }
                    });
                    this.container.classList.remove('history-open');
                };
            });
        }
    }

    listenForMedia() {
        if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
            chrome.runtime.onMessage.addListener((message) => {
                if (message.type === 'MEDIA_UPDATE') this.updateUI(message.data);
            });
        }
    }
}