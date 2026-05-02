import { BaseWidget } from './base-widget.js';

/**
 * Todo Widget — A simple persistent to-do list.
 */
export class TodoWidget extends BaseWidget {
    static get metadata() {
        return {
            id: 'todo',
            name: 'To-Do',
            icon: '✅',
            description: 'A simple to-do list to track tasks.'
        };
    }

    constructor(container) {
        super(container);
        this.items = [];
    }

    async render() {
        this.createCard('To-Do');

        // Input row
        const inputRow = document.createElement('div');
        inputRow.className = 'widget-todo__input-row';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'widget-todo__input';
        this.input.placeholder = 'Add a task...';

        const addBtn = document.createElement('button');
        addBtn.className = 'widget-todo__add-btn';
        addBtn.textContent = '+';
        addBtn.addEventListener('click', () => this.addItem());

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.addItem();
        });

        inputRow.appendChild(this.input);
        inputRow.appendChild(addBtn);

        // List container
        this.listEl = document.createElement('ul');
        this.listEl.className = 'widget-todo__list';

        this.bodyElement.appendChild(inputRow);
        this.bodyElement.appendChild(this.listEl);

        // Load saved state
        const saved = await this.loadState();
        if (saved && saved.items) {
            this.items = saved.items;
            this.renderList();
        }

        this.listenForCommands();
    }

    listenForCommands() {
        this._commandListener = (e) => {
            this.addItem(e.detail.text);
        };
        window.addEventListener('todo:add', this._commandListener);
    }

    addItem(textFromCommand = null) {
        const text = textFromCommand || this.input.value.trim();
        if (!text) return;

        this.items.push({ text, done: false });
        if (!textFromCommand) this.input.value = '';
        this.renderList();
        this.saveState();
    }

    destroy() {
        if (this._commandListener) {
            window.removeEventListener('todo:add', this._commandListener);
        }
        super.destroy();
    }

    toggleItem(index) {
        this.items[index].done = !this.items[index].done;
        this.renderList();
        this.saveState();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.renderList();
        this.saveState();
    }

    renderList() {
        this.listEl.innerHTML = '';
        this.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = `widget-todo__item ${item.done ? 'widget-todo__item--done' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.done;
            checkbox.className = 'widget-todo__checkbox';
            checkbox.addEventListener('change', () => this.toggleItem(index));

            const text = document.createElement('span');
            text.className = 'widget-todo__text';
            text.textContent = item.text;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'widget-todo__remove';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => this.removeItem(index));

            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(removeBtn);
            this.listEl.appendChild(li);
        });
    }

    serialize() {
        return { items: this.items };
    }

    deserialize(data) {
        if (data && data.items) {
            this.items = data.items;
            this.renderList();
        }
    }
}
