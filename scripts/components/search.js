export class Search {
    constructor(container) {
        this.container = container;
        this.debounceTimeout = null;
        this.suggestions = [];
        this.selectedIndex = -1;
        this.init();
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'search-widget';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'search-input';
        this.input.placeholder = 'Search the web...';
        this.input.autocomplete = 'off';

        this.autocompleteContainer = document.createElement('div');
        this.autocompleteContainer.className = 'search-autocomplete';

        this.element.appendChild(this.input);
        this.element.appendChild(this.autocompleteContainer);
        this.container.appendChild(this.element);

        this.bindEvents();
    }

    bindEvents() {
        this.input.addEventListener('input', (e) => this.onInput(e.target.value));
        this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Close autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeAutocomplete();
            }
        });
    }

    async onInput(query) {
        if (!query.trim()) {
            this.closeAutocomplete();
            return;
        }

        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => this.fetchSuggestions(query), 200);
    }

    async fetchSuggestions(query) {
        try {
            // DuckDuckGo autocomplete API
            const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.suggestions = data.map(item => item.phrase).slice(0, 5); // Max 5 suggestions
            this.renderSuggestions();
        } catch (error) {
            console.error('Error fetching autocomplete:', error);
            this.closeAutocomplete();
        }
    }

    renderSuggestions() {
        this.autocompleteContainer.innerHTML = '';
        this.selectedIndex = -1;

        if (this.suggestions.length === 0) {
            this.closeAutocomplete();
            return;
        }

        this.suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                this.input.value = suggestion;
                this.performSearch(suggestion);
            });
            this.autocompleteContainer.appendChild(item);
        });

        this.autocompleteContainer.classList.add('active');
    }

    closeAutocomplete() {
        this.autocompleteContainer.classList.remove('active');
        this.suggestions = [];
        this.selectedIndex = -1;
    }

    onKeyDown(e) {
        if (!this.autocompleteContainer.classList.contains('active')) {
            if (e.key === 'Enter' && this.input.value.trim()) {
                this.performSearch(this.input.value.trim());
            }
            return;
        }

        const items = this.autocompleteContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
            this.updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.selectedIndex >= 0) {
                const selected = this.suggestions[this.selectedIndex];
                this.input.value = selected;
                this.performSearch(selected);
            } else if (this.input.value.trim()) {
                this.performSearch(this.input.value.trim());
            }
        } else if (e.key === 'Escape') {
            this.closeAutocomplete();
        }
    }

    updateSelection(items) {
        items.forEach(item => item.classList.remove('selected'));
        if (this.selectedIndex >= 0) {
            items[this.selectedIndex].classList.add('selected');
        }
    }

    performSearch(query) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
}
