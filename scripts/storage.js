export const StorageManager = {
    async getPref(key, defaultVal = null) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            return new Promise((resolve) => {
                chrome.storage.sync.get([key], (result) => {
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
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            return new Promise((resolve) => {
                chrome.storage.sync.set({ [key]: value }, resolve);
            });
        }
        // Fallback
        localStorage.setItem(`pref_${key}`, typeof value === 'object' ? JSON.stringify(value) : value);
    },

    async saveMedia(id, dataUrl) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve) => {
                chrome.storage.local.set({ [`media_${id}`]: dataUrl }, resolve);
            });
        }
        // Fallback (may hit 5MB limit in localStorage)
        try {
            localStorage.setItem(`media_${id}`, dataUrl);
        } catch (e) {
            console.error("Storage quota exceeded in fallback localStorage", e);
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
    }
};
