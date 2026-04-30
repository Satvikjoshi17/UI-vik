import { StorageManager } from '../storage.js';

export class Clock {
    constructor(container) {
        this.container = container;
        this.is24Hour = false;
        this.init();
    }

    async init() {
        // Load preference
        const formatPref = await StorageManager.getPref('clock_format', '12');
        this.is24Hour = formatPref === '24';

        // Create DOM
        this.element = document.createElement('div');
        this.element.className = 'clock-widget';
        
        this.timeSpan = document.createElement('span');
        this.ampmSpan = document.createElement('span');
        this.ampmSpan.className = 'ampm';
        
        this.element.appendChild(this.timeSpan);
        this.element.appendChild(this.ampmSpan);
        this.container.appendChild(this.element);

        // Bind events
        this.element.addEventListener('click', () => this.toggleFormat());

        // Start loop
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        let ampm = '';

        if (!this.is24Hour) {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            this.ampmSpan.textContent = ampm;
            this.ampmSpan.style.display = 'inline';
        } else {
            hours = hours.toString().padStart(2, '0');
            this.ampmSpan.style.display = 'none';
        }

        this.timeSpan.textContent = `${hours}:${minutes}`;
    }

    async toggleFormat() {
        this.is24Hour = !this.is24Hour;
        await StorageManager.setPref('clock_format', this.is24Hour ? '24' : '12');
        this.updateTime();
    }
}
