import { StorageManager } from '../storage.js';

/* clock.js */
export class Clock {
    constructor(container) {
        this.container = container;
        this.is24Hour = false;
        this.digitMap = {
            '0': [1,1,1,1,1,1,0], '1': [0,1,1,0,0,0,0], '2': [1,1,0,1,1,0,1],
            '3': [1,1,1,1,0,0,1], '4': [0,1,1,0,0,1,1], '5': [1,0,1,1,0,1,1],
            '6': [1,0,1,1,1,1,1], '7': [1,1,1,0,0,0,0], '8': [1,1,1,1,1,1,1],
            '9': [1,1,1,1,0,1,1], ' ': [0,0,0,0,0,0,0]
        };
        this.segments = [];
        this.lastTime = "";
        this.timezones = [
            { label: 'Local', offset: null },
            { label: 'UTC', offset: 0 },
            { label: 'NYC', offset: -4 }, // EDT
            { label: 'LDN', offset: 1 },  // BST
            { label: 'TYO', offset: 9 },
            { label: 'DEL', offset: 5.5 }
        ];
        this.activeTzIndex = 0;
        this.clockStyle = 'digital';
        this.showSeconds = true;
        this.init();
    }

    async init() {
        // Load saved preferences
        const formatPref = await StorageManager.getPref('clock_format', '12');
        this.is24Hour = formatPref === '24';
        this.activeTzIndex = await StorageManager.getPref('active_timezone', 0);
        this.clockStyle = await StorageManager.getPref('clock_style', 'digital');
        this.showSeconds = await StorageManager.getPref('show_seconds', true);

        this.element = document.createElement('div');
        this.element.className = 'clock-widget';
        this.updateBaseClass();
        
        // Load custom opacity
        const opacity = await StorageManager.getPref('clock_opacity', 0.05);
        this.element.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        
        // ... (rest of init remains same)
        
        // Header bar (Date and clickable secondary time)
        this.header = document.createElement('div');
        this.header.className = 'clock-header';
        
        this.headerDate = document.createElement('span');
        this.headerDate.className = 'header-date';
        
        this.headerSecondary = document.createElement('span');
        this.headerSecondary.className = 'header-secondary';
        this.headerSecondary.title = 'Click to cycle timezone';
        this.headerSecondary.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't toggle 24h format
            this.cycleTimezone();
        });

        this.header.appendChild(this.headerDate);
        this.header.appendChild(this.headerSecondary);
        this.element.appendChild(this.header);

        // Digits container
        this.digitsContainer = document.createElement('div');
        this.digitsContainer.className = 'clock-digits';
        
        // Hour and Minute digits (Large)
        this.mainDigits = document.createElement('div');
        this.mainDigits.className = 'main-digits';
        for(let i=0; i<4; i++) {
            const digit = this.createDigit('large');
            this.segments.push(digit.nodes);
            this.mainDigits.appendChild(digit.container);
            if (i === 1) {
                const colon = document.createElement('div');
                colon.className = 'digit-separator';
                this.mainDigits.appendChild(colon);
            }
        }
        this.digitsContainer.appendChild(this.mainDigits);

        // Seconds digits (Small, Unique Space)
        this.secondsContainer = document.createElement('div');
        this.secondsContainer.className = 'seconds-container';
        for(let i=0; i<2; i++) {
            const digit = this.createDigit('small');
            this.segments.push(digit.nodes);
            this.secondsContainer.appendChild(digit.container);
        }
        this.digitsContainer.appendChild(this.secondsContainer);
        
        // AM/PM Indicator
        this.ampm = document.createElement('div');
        this.ampm.className = 'clock-ampm';
        this.digitsContainer.appendChild(this.ampm);

        this.element.appendChild(this.digitsContainer);

        // Minimal Text Element (for minimal style)
        this.minimalText = document.createElement('div');
        this.minimalText.className = 'clock-minimal-text';
        this.element.appendChild(this.minimalText);

        // Analog Face (SVG)
        this.analogFace = document.createElement('div');
        this.analogFace.className = 'clock-analog-face';
        this.analogFace.innerHTML = `
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" class="analog-outer" />
                <line x1="50" y1="50" x2="50" y2="25" class="hand-hour" />
                <line x1="50" y1="50" x2="50" y2="15" class="hand-min" />
                <line x1="50" y1="50" x2="50" y2="10" class="hand-sec" />
                <circle cx="50" cy="50" r="2" class="analog-center" />
            </svg>
        `;
        this.element.appendChild(this.analogFace);

        this.container.appendChild(this.element);
        
        // On Click: Cycle through styles
        this.element.addEventListener('click', () => this.cycleStyle());
        
        // On Context Menu (Right Click): Toggle 12/24h format
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.toggleFormat();
        });
        
        this.listenForGlobalActions();
        
        // Use requestAnimationFrame for smooth UI sync[cite: 2]
        const tick = () => {
            this.updateTime();
            requestAnimationFrame(tick);
        };
        tick();
    }

    createDigit(size = 'large') {
        const div = document.createElement('div');
        div.className = `digit-container ${size}`;
        const classes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const nodes = classes.map(c => {
            const seg = document.createElement('div');
            seg.className = `segment seg-${c}`;
            div.appendChild(seg);
            return seg;
        });
        return { container: div, nodes };
    }

    updateTime() {
        const now = new Date();
        
        // Update Header (Thu 30 Apr 10:10)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        if (this.headerDate) {
            this.headerDate.innerHTML = `${dayName} ${day} ${month}`;
        }

        if (this.headerSecondary) {
            const tz = this.timezones[this.activeTzIndex];
            let secH, secM;
            
            if (tz.offset === null) {
                // Local time
                secH = now.getHours();
                secM = now.getMinutes();
            } else {
                // Calculate from UTC
                const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                const nd = new Date(utc + (3600000 * tz.offset));
                secH = nd.getHours();
                secM = nd.getMinutes();
            }

            const hStr = secH.toString().padStart(2, '0');
            const mStr = secM.toString().padStart(2, '0');
            
            // Dual-Format Logic: Primary digits show one, header shows the OTHER
            if (!this.is24Hour) {
                // Primary is 12h, so Header shows 24h
                this.headerSecondary.innerHTML = `<span class="clock-icon">🕒</span> ${tz.label}: ${hStr}:${mStr}`;
            } else {
                // Primary is 24h, so Header shows 12h
                const ampmSec = secH >= 12 ? 'PM' : 'AM';
                const h12 = secH % 12 || 12;
                this.headerSecondary.innerHTML = `<span class="clock-icon">🕒</span> ${tz.label}: ${h12}:${mStr} <span class="ampm-small">${ampmSec}</span>`;
            }
        }

        let h = now.getHours();
        const ampmVal = h >= 12 ? 'PM' : 'AM';
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        
        if (!this.is24Hour) {
            h = h % 12 || 12;
            this.ampm.textContent = ampmVal;
            this.ampm.style.display = 'flex';
        } else {
            this.ampm.style.display = 'none';
        }

        const hStr = h.toString().padStart(2, ' ').slice(-2);
        const timeStr = hStr + m + s;
        
        // Update 7-Segment Digits (HH MM SS)
        if (this.clockStyle === 'digital') {
            timeStr.split('').forEach((char, dIdx) => {
                const pattern = this.digitMap[char] || this.digitMap[' '];
                const segs = this.segments[dIdx];
                if (segs) {
                    segs.forEach((segNode, sIdx) => {
                        segNode.classList.toggle('on', !!pattern[sIdx]);
                    });
                }
            });
            
            // Blink colon
            const colon = this.mainDigits.querySelector('.digit-separator');
            if (colon) {
                colon.style.opacity = now.getSeconds() % 2 === 0 ? '1' : '0.3';
            }
        }

        // Update Minimal Style
        this.minimalText.textContent = this.showSeconds 
            ? `${hStr.trim()}:${m}:${s}` 
            : `${hStr.trim()}:${m}`;

        // Update Analog Style (Smooth Continuous Motion)
        const ms = now.getMilliseconds();
        const sDeg = (now.getSeconds() * 6) + (ms * 0.006);
        const mDeg = (now.getMinutes() * 6) + (now.getSeconds() * 0.1);
        const hDeg = ((now.getHours() % 12) * 30) + (now.getMinutes() * 0.5);

        const hHand = this.element.querySelector('.hand-hour');
        const mHand = this.element.querySelector('.hand-min');
        const sHand = this.element.querySelector('.hand-sec');

        if (hHand) hHand.style.transform = `rotate(${hDeg}deg)`;
        if (mHand) mHand.style.transform = `rotate(${mDeg}deg)`;
        if (sHand) {
            sHand.style.transform = `rotate(${sDeg}deg)`;
            sHand.style.display = this.showSeconds ? 'block' : 'none';
        }
    }

    listenForGlobalActions() {
        window.addEventListener('clockStyleUpdate', (e) => {
            const { style } = e.detail;
            this.clockStyle = style;
            this.updateBaseClass();
        });

        window.addEventListener('clockSecondsUpdate', (e) => {
            const { show } = e.detail;
            this.showSeconds = show;
            this.updateBaseClass();
        });

        window.addEventListener('clockOpacityUpdate', (e) => {
            const { opacity } = e.detail;
            this.element.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        });
    }

    updateBaseClass() {
        // Remove existing style classes
        const styles = ['style-digital', 'style-minimal', 'style-analog'];
        this.element.classList.remove(...styles);
        
        // Add current style class
        this.element.classList.add(`style-${this.clockStyle}`);
        
        // Handle show-seconds class
        this.element.classList.toggle('show-seconds', this.showSeconds);
    }

    async cycleStyle() {
        const styles = ['digital', 'minimal', 'analog'];
        const currentIdx = styles.indexOf(this.clockStyle);
        const nextIdx = (currentIdx + 1) % styles.length;
        const newStyle = styles[nextIdx];
        
        this.clockStyle = newStyle;
        this.updateBaseClass();
        
        await StorageManager.setPref('clock_style', newStyle);
        
        // Update Settings UI if open
        window.dispatchEvent(new CustomEvent('clockStyleChanged', { detail: { style: newStyle } }));
    }

    async toggleFormat() {
        this.is24Hour = !this.is24Hour;
        await StorageManager.setPref('clock_format', this.is24Hour ? '24' : '12'); 
    }

    async cycleTimezone() {
        this.activeTzIndex = (this.activeTzIndex + 1) % this.timezones.length;
        await StorageManager.setPref('active_timezone', this.activeTzIndex);
    }
}
