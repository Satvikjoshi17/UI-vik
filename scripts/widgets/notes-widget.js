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
    }

    serialize() {
        return { content: this.content };
    }

    deserialize(data) {
        if (data && data.content) {
            this.content = data.content;
            if (this.textarea) {
                this.textarea.value = this.content;
            }
        }
    }

    destroy() {
        clearTimeout(this.debounceTimeout);
        super.destroy();
    }
}
