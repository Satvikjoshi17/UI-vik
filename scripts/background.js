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

        this.loadInitialBackground();
        this.listenForChanges();
    }

    async loadInitialBackground() {
        const bgData = await StorageManager.getPref('background_data', {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1506744626753-1fa28f67c9bf?auto=format&fit=crop&w=1920&q=80'
        });
        
        if (Array.isArray(bgData.src)) {
            this.startSlideshow(bgData.src);
        } else {
            this.setBackground(bgData);
        }
        
        const settings = await StorageManager.getPref('visual_settings', { blur: '0px', opacity: '0.2' });
        this.setVisualSettings({ ...settings, blur: '0px' }); // Force sharp on load
    }

    listenForChanges() {
        window.addEventListener('backgroundUpdate', (e) => {
            const { type, src } = e.detail;
            this.stopSlideshow();
            if (type === 'image' && Array.isArray(src)) {
                this.startSlideshow(src);
            } else {
                this.setBackground({ type, src });
            }
        });

        window.addEventListener('visualSettingsUpdate', (e) => {
            this.setVisualSettings(e.detail);
        });
    }

    stopSlideshow() {
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }
    }

    startSlideshow(images, interval = 15000) {
        this.stopSlideshow();
        if (!images || images.length === 0) return;

        let currentIndex = 0;
        this.setBackground({ type: 'image', src: images[currentIndex] });

        this.slideshowInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            this.setBackground({ type: 'image', src: images[currentIndex] });
        }, interval);
    }

    async setBackground({ type, src }) {
        if (!src) return;
        
        return new Promise((resolve) => {
            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'bg-media-wrapper fade-out';
            
            let mainMedia;
            let ambientBlur;

            if (type === 'video') {
                mainMedia = document.createElement('video');
                mainMedia.autoplay = true;
                mainMedia.loop = true;
                mainMedia.muted = true;
                mainMedia.playsInline = true;
                mainMedia.className = 'bg-main-media';
            } else {
                // For images, we create the dual-layer effect
                ambientBlur = document.createElement('img');
                ambientBlur.className = 'bg-ambient-blur';
                ambientBlur.src = src;

                mainMedia = document.createElement('img');
                mainMedia.className = 'bg-main-media';
            }

            const handleLoad = () => {
                if (this.currentMediaWrapper) {
                    const oldWrapper = this.currentMediaWrapper;
                    oldWrapper.classList.replace('fade-in', 'fade-out');
                    setTimeout(() => {
                        if (oldWrapper.parentNode) {
                            oldWrapper.parentNode.removeChild(oldWrapper);
                        }
                    }, 1000);
                }

                mediaContainer.classList.replace('fade-out', 'fade-in');
                this.currentMediaWrapper = mediaContainer;
                
                if (this.parallaxActive) {
                    mediaContainer.style.transform = 'scale(1.02)';
                }
                resolve();
            };

            if (type === 'video') {
                mainMedia.oncanplay = handleLoad;
                mainMedia.src = src;
                mainMedia.load();
            } else {
                mainMedia.onload = handleLoad;
                mainMedia.src = src;
            }

            if (ambientBlur) mediaContainer.appendChild(ambientBlur);
            mediaContainer.appendChild(mainMedia);
            
            // Insert behind the overlay
            this.container.insertBefore(mediaContainer, this.overlay);
        });
    }

    setVisualSettings({ blur = '0px', opacity = '0.2' }) {
        // Ensure background media is sharp by default
        if (this.currentMediaElement) {
            this.currentMediaElement.style.filter = 'none';
        }
        document.documentElement.style.setProperty('--blur-intensity', blur);
        document.documentElement.style.setProperty('--overlay-opacity', opacity);
    }

    enableParallax(intensity = 10, smoothing = 0.08) {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        this.mouse = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.parallaxActive = true;

        const handleMouseMove = (e) => {
            this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const update = () => {
            if (!this.parallaxActive) return;
            if (!this.currentMediaElement) {
                requestAnimationFrame(update);
                return;
            }

            this.currentPos.x += (this.mouse.x - this.currentPos.x) * smoothing;
            this.currentPos.y += (this.mouse.y - this.currentPos.y) * smoothing;

            const translateX = this.currentPos.x * intensity * -1;
            const translateY = this.currentPos.y * intensity * -1;

            // Use a very subtle scale (1.02) to prevent the "over-zoomed" feeling
            this.currentMediaElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.02)`;
            
            requestAnimationFrame(update);
        };

        document.addEventListener('mousemove', handleMouseMove);
        requestAnimationFrame(update);

        if (this.currentMediaElement) {
            this.currentMediaElement.style.transform = 'scale(1.02)';
        }
    }
}
