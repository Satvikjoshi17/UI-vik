import { StorageManager } from '../storage.js';

export class Search {
    constructor(container) {
        this.container = container;
        this.suggestions = [];
        this.history = [];
        this.maxHistory = 10;
        this.originalPlaceholder = 'Search Google...';
        this.animatedPrompts = [
            'Search Google...',
            'Try "Weather in London"',
            'Search for "Beautiful sunsets"',
            'Try "Stock market today"',
            'Search "Best coding practices"',
            'What\'s on your mind?'
        ];
        this.promptIdx = 0;
        this.isAnimating = true;
        
        this.selectedIndex = -1;
        this.isVisible = true;
        this.init();
    }

    async init() {
        // Load initial state
        const searchMode = await StorageManager.getPref('search_mode', 'always');
        this.searchEngine = await StorageManager.getPref('search_engine', 'google');
        this.history = await StorageManager.getPref('search_history', []);
        this.isVisible = (searchMode === 'always');
        this.updatePlaceholderBase();

        this.element = document.createElement('div');
        this.element.className = `search-widget ${!this.isVisible ? 'hidden' : ''}`;

        this.inputWrapper = document.createElement('div');
        this.inputWrapper.className = 'search-input-wrapper';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'search-input';
        this.input.placeholder = this.originalPlaceholder;
        this.input.autocomplete = 'off';

        this.searchIcon = document.createElement('span');
        this.searchIcon.className = 'search-icon-inline';
        this.searchIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        this.autocompleteContainer = document.createElement('div');
        this.autocompleteContainer.className = 'search-autocomplete';

        this.inputWrapper.appendChild(this.searchIcon);
        this.inputWrapper.appendChild(this.input);
        this.element.appendChild(this.inputWrapper);
        this.element.appendChild(this.autocompleteContainer);
        this.container.appendChild(this.element);

        this.bindEvents();
        this.listenForSettings();
        this.startPlaceholderAnimation();
    }

    updatePlaceholderBase() {
        const names = { google: 'Google', bing: 'Bing', ddg: 'DuckDuckGo' };
        this.originalPlaceholder = `Search ${names[this.searchEngine] || 'Google'}...`;
        this.animatedPrompts[0] = this.originalPlaceholder;
    }

    startPlaceholderAnimation() {
        this.animationInterval = setInterval(() => {
            if (this.input.value || document.activeElement === this.input) return;
            
            this.promptIdx = (this.promptIdx + 1) % this.animatedPrompts.length;
            this.animatePlaceholder(this.animatedPrompts[this.promptIdx]);
        }, 5000);
    }

    animatePlaceholder(text) {
        let current = '';
        let i = 0;
        const speed = 40;
        
        const type = () => {
            if (i < text.length && !this.input.value && document.activeElement !== this.input) {
                current += text.charAt(i);
                this.input.placeholder = current;
                i++;
                setTimeout(type, speed);
            }
        };
        type();
    }

    listenForSettings() {
        window.addEventListener('searchModeUpdate', (e) => {
            const { mode } = e.detail;
            this.setVisibility(mode === 'always');
        });

        window.addEventListener('searchEngineUpdate', (e) => {
            this.searchEngine = e.detail.engine;
            this.updatePlaceholderBase();
            if (!this.input.value) this.input.placeholder = this.originalPlaceholder;
        });

        window.addEventListener('requestSearchFocus', () => {
            this.setVisibility(true);
        });

        window.addEventListener('searchHistoryUpdated', async () => {
            this.history = await StorageManager.getPref('search_history', []);
        });
        
        window.addEventListener('clearSearchHistory', () => {
            this.history = [];
            StorageManager.setPref('search_history', []);
            if (this.autocompleteContainer.classList.contains('active')) {
                this.onInput(this.input.value);
            }
        });
    }

    bindEvents() {
        this.input.addEventListener('input', (e) => this.onInput(e.target.value));
        this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        this.input.addEventListener('focus', () => {
            this.input.placeholder = this.originalPlaceholder;
            this.onInput(this.input.value); // Show history/suggestions on focus
        });

        this.input.addEventListener('blur', () => {
            setTimeout(() => {
                if (!this.input.value) this.input.placeholder = this.animatedPrompts[this.promptIdx];
                this.closeAutocomplete();
            }, 200); // Small delay to allow clicks on suggestions
        });
        
        this.searchIcon.addEventListener('click', () => {
            if (this.input.value.trim()) this.performSearch(this.input.value.trim());
        });

        document.addEventListener('click', async (e) => {
            const isClickInside = this.element.contains(e.target);
            if (!isClickInside) {
                this.closeAutocomplete();
                
                // Hide if in gesture mode and clicking outside
                const searchMode = await StorageManager.getPref('search_mode', 'always');
                if (searchMode === 'gesture' && this.isVisible) {
                    this.setVisibility(false);
                }
            }
        });
    }

    async onInput(query) {
        if (!query.trim()) {
            if (this.history.length > 0) {
                this.renderHistory();
            } else {
                this.closeAutocomplete();
            }
            return;
        }

        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => this.fetchSuggestions(query), 150);
    }

    async fetchSuggestions(query) {
        console.log("🔍 [SEARCH DEBUG] 1. fetchSuggestions triggered with query:", query);
        try {
            console.log("🔍 [SEARCH DEBUG] 2. Attempting to fetch from DuckDuckGo...");
            const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}`);
            console.log("🔍 [SEARCH DEBUG] 3. Fetch response received. Status:", response.status);
            
            const data = await response.json();
            console.log("🔍 [SEARCH DEBUG] 4. Parsed JSON data from API:", data);
            
            if (Array.isArray(data) && data.length > 0) {
                console.log("🔍 [SEARCH DEBUG] 5. Data is valid. Extracting text...");
                this.suggestions = data.slice(0, 8).map(item => item.phrase); 
                console.log("🔍 [SEARCH DEBUG] 6. Final extracted suggestions ready for UI:", this.suggestions);
                this.renderSuggestions(query);
            } else {
                console.log("🔍 [SEARCH DEBUG] 5. API returned empty array. Hiding dropdown.");
                this.closeAutocomplete(); 
            }
        } catch (error) {
            console.error('🚨 [SEARCH DEBUG ERROR] Fetch failed completely:', error);
            // Fallback to history
            const filteredHistory = this.history.filter(h => h.toLowerCase().includes(query.toLowerCase()));
            if (filteredHistory.length > 0) {
                this.renderHistory(filteredHistory);
            } else {
                this.closeAutocomplete();
            }
        }
    }

    renderHistory(filtered = this.history) {
        this.autocompleteContainer.innerHTML = '';
        this.selectedIndex = -1;

        if (filtered.length === 0) {
            this.closeAutocomplete();
            return;
        }

        const header = document.createElement('div');
        header.className = 'autocomplete-header';
        header.innerHTML = '<span>Recent Searches</span>';
        this.autocompleteContainer.appendChild(header);

        filtered.slice(0, 5).forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'suggestion-item history-item';
            
            const icon = document.createElement('span');
            icon.className = 'item-icon';
            icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
            
            const text = document.createElement('span');
            text.className = 'item-text';
            text.textContent = item;

            const removeBtn = document.createElement('span');
            removeBtn.className = 'item-remove';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Remove from history';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromHistory(item);
            });

            row.appendChild(icon);
            row.appendChild(text);
            row.appendChild(removeBtn);
            
            row.addEventListener('click', () => {
                this.input.value = item;
                this.performSearch(item);
            });
            
            this.autocompleteContainer.appendChild(row);
        });

        this.autocompleteContainer.classList.add('active');
    }

    renderSuggestions(query) {
        this.autocompleteContainer.innerHTML = '';
        this.selectedIndex = -1;

        if (this.suggestions.length === 0) {
            this.closeAutocomplete();
            return;
        }

        // Show suggestions
        this.suggestions.forEach((suggestion) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            const icon = document.createElement('span');
            icon.className = 'item-icon';
            icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';

            // Highlight match
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightedText = suggestion.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<strong>$1</strong>');
            
            const text = document.createElement('span');
            text.className = 'item-text';
            text.innerHTML = highlightedText;

            item.appendChild(icon);
            item.appendChild(text);

            item.addEventListener('click', () => {
                this.input.value = suggestion;
                this.performSearch(suggestion);
            });
            this.autocompleteContainer.appendChild(item);
        });

        this.autocompleteContainer.classList.add('active');
    }

    async removeFromHistory(term) {
        this.history = this.history.filter(h => h !== term);
        await StorageManager.setPref('search_history', this.history);
        window.dispatchEvent(new CustomEvent('searchHistoryUpdated'));
        this.onInput(this.input.value);
    }

    async saveToHistory(term) {
        if (!term) return;
        // Move to front if exists, or add to front
        this.history = [term, ...this.history.filter(h => h !== term)].slice(0, this.maxHistory);
        await StorageManager.setPref('search_history', this.history);
        window.dispatchEvent(new CustomEvent('searchHistoryUpdated'));
    }

    closeAutocomplete() {
        this.autocompleteContainer.classList.remove('active');
        this.selectedIndex = -1;
    }

    onKeyDown(e) {
        const items = this.autocompleteContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'Enter') {
            const query = this.input.value.trim();
            if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                const selectedText = items[this.selectedIndex].querySelector('.item-text').textContent;
                this.performSearch(selectedText);
            } else if (query) {
                this.performSearch(query);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!this.autocompleteContainer.classList.contains('active')) {
                this.onInput(this.input.value);
                return;
            }
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.selectedIndex <= 0) {
                this.selectedIndex = items.length - 1;
            } else {
                this.selectedIndex--;
            }
            this.updateSelection(items);
        } else if (e.key === 'Escape') {
            this.closeAutocomplete();
        }
    }

    updateSelection(items) {
        items.forEach(item => item.classList.remove('selected'));
        if (this.selectedIndex >= 0) {
            const selectedItem = items[this.selectedIndex];
            selectedItem.classList.add('selected');
            this.input.value = selectedItem.querySelector('.item-text').textContent;
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
    }

    async performSearch(query) {
        if (!query.trim()) return;
        await this.saveToHistory(query.trim());
        
        let url = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
        if (this.searchEngine === 'bing') {
            url = `https://www.bing.com/search?q=${encodeURIComponent(query.trim())}`;
        } else if (this.searchEngine === 'ddg') {
            url = `https://duckduckgo.com/?q=${encodeURIComponent(query.trim())}`;
        }
        
        window.location.href = url;
    }

    setVisibility(isVisible) {
        this.isVisible = isVisible;
        if (isVisible) {
            this.element.classList.remove('hidden');
            setTimeout(() => this.input.focus(), 100);
        } else {
            this.element.classList.add('hidden');
            this.input.blur();
            this.closeAutocomplete();
        }
    }
}
