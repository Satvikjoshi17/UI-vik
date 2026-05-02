/**
 * MediaController Component
 * Displays and controls browser media playback.
 */
export class MediaController {
    constructor(parent) {
        this.parent = parent || document.querySelector('.main-content');
        this.container = null;
        this.isPlaying = false;
        this.currentTabId = null;
        this.init();
    }

    init() {
        this.createUI();
        this.listenForMedia();
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'GET_MEDIA_STATE' }).catch(() => {});
        }
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'media-controller';
        this.container.innerHTML = `
            <div class="media-art">
                <img src="" alt="Art" id="media-artwork">
                <div class="art-placeholder">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                </div>
            </div>
            <div class="media-info">
                <div class="media-title" id="media-title">Not Playing</div>
                <div class="media-artist" id="media-artist">Select a tab with music</div>
            </div>
            <div class="media-controls">
                <button class="m-btn" id="m-prev" title="Previous">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
                </button>
                <button class="m-btn play-btn" id="m-play" title="Play/Pause">
                    <svg id="play-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button class="m-btn" id="m-next" title="Next">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                </button>
                <button class="m-btn history-toggle" id="m-history" title="History">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </button>
                <button class="m-btn minimize-toggle" id="m-minimize" title="Minimize">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" id="minimize-icon"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
            </div>
            <div class="media-history-panel" id="media-history-panel">
                <div class="history-header">Recent Tracks</div>
                <div class="history-list" id="history-list"></div>
            </div>
        `;

        this.parent.appendChild(this.container);
        this.checkPosition();
        this.setupEventListeners();
    }

    checkPosition() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
            this.container.classList.add('pos-top');
        } else {
            this.container.classList.remove('pos-top');
        }
    }

    setupEventListeners() {
        this.container.querySelector('#m-play').onclick = () => this.sendCommand('toggle');
        this.container.querySelector('#m-next').onclick = () => this.sendCommand('next');
        this.container.querySelector('#m-prev').onclick = () => this.sendCommand('prev');
        
        const historyToggle = this.container.querySelector('#m-history');
        historyToggle.onclick = (e) => {
            e.stopPropagation();
            this.container.classList.toggle('history-open');
            this.checkPosition();
        };

        const minimizeBtn = this.container.querySelector('#m-minimize');
        minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            this.container.classList.toggle('minimized');
            const icon = minimizeBtn.querySelector('path');
            if (this.container.classList.contains('minimized')) {
                icon.setAttribute('d', 'M6 9l6 6 6-6');
            } else {
                icon.setAttribute('d', 'M18 15l-6-6-6 6');
            }
        };

        document.addEventListener('click', (e) => {
            if (this.container && !this.container.contains(e.target)) {
                this.container.classList.remove('history-open');
            }
        });

        window.addEventListener('resize', () => this.checkPosition());
        
        // Check position after a short delay for theme transitions
        setTimeout(() => this.checkPosition(), 500);
    }

    sendCommand(command) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                type: 'MEDIA_COMMAND',
                data: { command, tabId: this.currentTabId }
            }).catch(() => {});
        }
    }

    updateUI(data) {
        this.currentTabId = data.tabId;
        this.isPlaying = data.isPlaying;
        
        const titleEl = this.container.querySelector('#media-title');
        const artistEl = this.container.querySelector('#media-artist');
        const artImg = this.container.querySelector('#media-artwork');
        const artPlaceholder = this.container.querySelector('.art-placeholder');
        
        titleEl.textContent = data.title;
        artistEl.textContent = data.artist;
        
        const playSvg = this.container.querySelector('#play-svg');
        if (this.isPlaying) {
            playSvg.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        } else {
            playSvg.innerHTML = '<path d="M8 5v14l11-7z"/>';
        }

        if (data.artwork) {
            artImg.src = data.artwork;
            artImg.style.display = 'block';
            artPlaceholder.style.display = 'none';
        } else {
            artImg.style.display = 'none';
            artPlaceholder.style.display = 'block';
        }

        if (data.history) {
            const listEl = this.container.querySelector('#history-list');
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
                        data: { command: 'toggle', tabId: null, url: item.dataset.url }
                    });
                    this.container.classList.remove('history-open');
                };
            });
        }

        if (data.title === 'Not Playing') {
            this.container.classList.add('hidden');
        } else {
            this.container.classList.remove('hidden');
        }
    }

    listenForMedia() {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener((message) => {
                if (message.type === 'MEDIA_UPDATE') {
                    this.updateUI(message.data);
                }
            });
        }
    }
}
