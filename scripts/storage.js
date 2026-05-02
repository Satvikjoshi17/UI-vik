import './browser-polyfill.js';

export const StorageManager = {
    async getPref(key, defaultVal = null) {
        // Large data should always use local storage
        const isLargeData = ['background_data', 'recent_backgrounds', 'bg_src'].includes(key);
        const storageType = isLargeData ? 'local' : 'sync';

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage[storageType]) {
            return new Promise((resolve) => {
                chrome.storage[storageType].get([key], (result) => {
                    resolve(result[key] !== undefined ? result[key] : defaultVal);
                });
            });
        }
        // Fallback for regular web page testing
        const val = localStorage.getItem(`pref_${key}`);
        if (val) {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return defaultVal;
    },

    async setPref(key, value) {
        // Large data should always use local storage
        const isLargeData = ['background_data', 'recent_backgrounds', 'bg_src'].includes(key);
        const storageType = isLargeData ? 'local' : 'sync';

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage[storageType]) {
            return new Promise((resolve, reject) => {
                chrome.storage[storageType].set({ [key]: value }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(`Storage error for ${key}:`, chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    }
                    else resolve();
                });
            });
        }
        // Fallback
        localStorage.setItem(`pref_${key}`, typeof value === 'object' ? JSON.stringify(value) : value);
    },

    async saveMedia(id, dataUrl) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve, reject) => {
                const cb = () => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve();
                };
                if (dataUrl === null) {
                    chrome.storage.local.remove(`media_${id}`, cb);
                } else {
                    chrome.storage.local.set({ [`media_${id}`]: dataUrl }, cb);
                }
            });
        }
        // Fallback (may hit 5MB limit in localStorage)
        try {
            if (dataUrl === null) {
                localStorage.removeItem(`media_${id}`);
            } else {
                localStorage.setItem(`media_${id}`, dataUrl);
            }
        } catch (e) {
            console.error("Storage quota exceeded in fallback localStorage", e);
            throw e;
        }
    },

    async getMedia(id) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve) => {
                chrome.storage.local.get([`media_${id}`], (result) => {
                    resolve(result[`media_${id}`] || null);
                });
            });
        }
        return localStorage.getItem(`media_${id}`);
    },

    async getRecentBackgrounds() {
        return await this.getPref('recent_backgrounds', []);
    },

    async saveRecentBackground(bgData) {
        // bgData: { type, src, timestamp }
        let recents = await this.getRecentBackgrounds();
        
        // Filter out if already exists (checking src)
        // If src is an array (slideshow), we stringify for comparison
        const srcKey = Array.isArray(bgData.src) ? JSON.stringify(bgData.src) : bgData.src;
        recents = recents.filter(item => {
            const itemKey = Array.isArray(item.src) ? JSON.stringify(item.src) : item.src;
            return itemKey !== srcKey;
        });

        // Add to start
        recents.unshift({ ...bgData, timestamp: Date.now() });

        // Cap at 12 items for UI grid balance
        if (recents.length > 12) recents = recents.slice(0, 12);

        await this.setPref('recent_backgrounds', recents);
        return recents;
    }
};
