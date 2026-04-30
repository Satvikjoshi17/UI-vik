import { StorageManager } from './storage.js';

export class Background {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.currentMediaElement = null;
        this.init();
    }

    init() {
        // Create background container
        this.container = document.createElement('div');
        this.container.className = 'bg-container';

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'bg-overlay';

        this.container.appendChild(this.overlay);
        
        // Insert at the beginning of app container
        if (this.appContainer.firstChild) {
            this.appContainer.insertBefore(this.container, this.appContainer.firstChild);
        } else {
            this.appContainer.appendChild(this.container);
        }
    }

    async setBackground({ type, src }) {
        return new Promise((resolve) => {
            let newMediaElement;

            if (type === 'video') {
                newMediaElement = document.createElement('video');
                newMediaElement.autoplay = true;
                newMediaElement.loop = true;
                newMediaElement.muted = true;
                newMediaElement.playsInline = true;
            } else {
                newMediaElement = document.createElement('img');
            }

            newMediaElement.className = 'bg-media fade-out';
            
            const handleLoad = () => {
                // Cross-fade
                if (this.currentMediaElement) {
                    const oldElement = this.currentMediaElement;
                    oldElement.classList.replace('fade-in', 'fade-out');
                    setTimeout(() => {
                        if (oldElement.parentNode) {
                            oldElement.parentNode.removeChild(oldElement);
                        }
                    }, 500); // Wait for transition
                }

                newMediaElement.classList.replace('fade-out', 'fade-in');
                this.currentMediaElement = newMediaElement;
                resolve();
            };

            if (type === 'video') {
                newMediaElement.oncanplay = handleLoad;
                newMediaElement.src = src;
                // Preload video to ensure it's ready before cross-fade starts
                newMediaElement.load();
            } else {
                newMediaElement.onload = handleLoad;
                newMediaElement.src = src;
            }

            // Insert behind the overlay
            this.container.insertBefore(newMediaElement, this.overlay);
        });
    }

    setVisualSettings({ blur = '0px', opacity = '0.2' }) {
        document.documentElement.style.setProperty('--blur-intensity', blur);
        document.documentElement.style.setProperty('--overlay-opacity', opacity);
    }

    enableParallax(intensity = 15, smoothing = 0.08) {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        this.mouse = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.parallaxActive = true;

        const handleMouseMove = (e) => {
            // Target coordinates (-1 to 1)
            this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const update = () => {
            if (!this.parallaxActive) return;
            if (!this.currentMediaElement) {
                requestAnimationFrame(update);
                return;
            }

            // Lerp: current = current + (target - current) * smoothing
            this.currentPos.x += (this.mouse.x - this.currentPos.x) * smoothing;
            this.currentPos.y += (this.mouse.y - this.currentPos.y) * smoothing;

            const translateX = this.currentPos.x * intensity * -1;
            const translateY = this.currentPos.y * intensity * -1;

            this.currentMediaElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.05)`;
            
            requestAnimationFrame(update);
        };

        document.addEventListener('mousemove', handleMouseMove);
        requestAnimationFrame(update);

        // Cleanup method if needed
        this._stopParallax = () => {
            this.parallaxActive = false;
            document.removeEventListener('mousemove', handleMouseMove);
        };

        // Initial scale
        if (this.currentMediaElement) {
            this.currentMediaElement.style.transform = 'scale(1.05)';
        }
    }
}
