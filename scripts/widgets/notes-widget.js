import { BaseWidget } from './base-widget.js';

/**
 * Notes Widget — A simple persistent notepad.
 */
export class NotesWidget extends BaseWidget {
    static get metadata() {
        return {
            id: 'notes',
            name: 'Notes',
            icon: '📝',
            description: 'A quick notepad for jotting things down.'
        };
    }

    constructor(container) {
        super(container);
        this.content = '';
        this.debounceTimeout = null;
    }

    async render() {
        this.createCard('Notes');

        this.textarea = document.createElement('textarea');
        this.textarea.className = 'widget-notes__textarea';
        this.textarea.placeholder = 'Type your notes here...';
        this.textarea.spellcheck = false;

        // Load saved state
        const saved = await this.loadState();
        if (saved && saved.content) {
            this.content = saved.content;
            this.textarea.value = this.content;
        }

        // Auto-save on input (debounced)
        this.textarea.addEventListener('input', () => {
            this.content = this.textarea.value;
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => this.saveState(), 500);
        });

        this.bodyElement.appendChild(this.textarea);
        this.listenForCommands();
    }

    listenForCommands() {
        this._commandListener = (e) => {
            const text = e.detail.text;
            if (!text) return;
            
            const separator = this.textarea.value ? '\n' : '';
            this.textarea.value += separator + '- ' + text;
            this.content = this.textarea.value;
            this.saveState();
        };
        window.addEventListener('notes:append', this._commandListener);
    }

    destroy() {
        if (this._commandListener) {
            window.removeEventListener('notes:append', this._commandListener);
        }
        clearTimeout(this.debounceTimeout);
        super.destroy();
    }
}
