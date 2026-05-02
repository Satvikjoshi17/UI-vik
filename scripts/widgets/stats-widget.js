import { BaseWidget } from './base-widget.js';

/**
 * StatsOverview Widget — Tracks personal gaming/productivity stats.
 * Data is stored locally, optionally synced.
 */
export class StatsWidget extends BaseWidget {
    static get metadata() {
        return {
            id: 'stats',
            name: 'Stats Overview',
            icon: '📊',
            description: 'Track your daily sessions and productivity stats.'
        };
    }

    constructor(container) {
        super(container);
        this.stats = {
            sessionsToday: 0,
            hoursThisWeek: 0,
            streak: 0,
            lastVisit: null
        };
    }

    async render() {
        this.createCard('Stats Overview');

        this.statsGrid = document.createElement('div');
        this.statsGrid.className = 'stats-grid';
        this.bodyElement.appendChild(this.statsGrid);

        // Load saved state
        const saved = await this.loadState();
        if (saved) {
            this.stats = { ...this.stats, ...saved };
        }

        // Auto-increment session on each new tab open
        this.trackSession();
        this.renderStats();
    }

    trackSession() {
        const now = new Date();
        const today = now.toDateString();
        const lastVisit = this.stats.lastVisit;

        if (lastVisit !== today) {
            // New day
            if (lastVisit) {
                const lastDate = new Date(lastVisit);
                const diff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    this.stats.streak += 1;
                } else if (diff > 1) {
                    this.stats.streak = 1;
                }
            } else {
                this.stats.streak = 1;
            }
            this.stats.sessionsToday = 1;
        } else {
            this.stats.sessionsToday += 1;
        }

        this.stats.lastVisit = today;

        // Estimate hours (each session ≈ 2 min of "active" time)
        this.stats.hoursThisWeek = Math.min(
            99,
            parseFloat((this.stats.hoursThisWeek + 0.03).toFixed(2))
        );

        this.saveState();
    }

    renderStats() {
        const items = [
            { label: 'Sessions Today', value: this.stats.sessionsToday, icon: '🎯' },
            { label: 'Hours This Week', value: `${this.stats.hoursThisWeek}h`, icon: '⏱️' },
            { label: 'Day Streak', value: `${this.stats.streak}🔥`, icon: '📅' }
        ];

        this.statsGrid.innerHTML = items.map(item => `
            <div class="stats-card">
                <div class="stats-card__icon">${item.icon}</div>
                <div class="stats-card__value stats-lcd-value">${item.value}</div>
                <div class="stats-card__label">${item.label}</div>
            </div>
        `).join('');
    }

    serialize() {
        return this.stats;
    }

    deserialize(data) {
        if (data) {
            this.stats = { ...this.stats, ...data };
            this.renderStats();
        }
    }
}
