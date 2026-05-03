/**
 * service-worker.js
 * Background script to track audible tabs and media info.
 */

let lastActiveTabId = null;
let lastMediaData = null;
let mediaHistory = [];

// Load last known media and history from storage on startup[cite: 2]
chrome.storage.local.get(['lastMediaData', 'mediaHistory'], (result) => {
    if (result.lastMediaData) lastMediaData = result.lastMediaData;
    if (result.mediaHistory) mediaHistory = result.mediaHistory;
});

// Listener for tab updates (Title changes or audio starts/stops)[cite: 2]
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.audible !== undefined || changeInfo.title !== undefined || changeInfo.status === 'complete') {
        broadcastMediaState();
    }
});

// Listener for tab removal[cite: 2]
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastActiveTabId) {
        lastActiveTabId = null;
    }
    broadcastMediaState();
});

/**
 * findTargetTab
 * Locates the best candidate for media extraction, prioritizing audible tabs
 * and ignoring restricted browser internal pages.[cite: 2]
 */
async function findTargetTab() {
    const allTabs = await chrome.tabs.query({});
    
    // 1. Try to find a tab that is currently AUDIBLE and not a system page[cite: 2]
    let target = allTabs.find(t => 
        t.audible && 
        !t.url.startsWith('chrome://') && 
        !t.url.startsWith('edge://') && 
        !t.url.startsWith('about:')
    );

    // 2. If nothing is audible, check if the last known active tab still exists[cite: 2]
    if (!target && lastActiveTabId) {
        target = allTabs.find(t => t.id === lastActiveTabId);
    }

    // 3. Fallback: Search for any open media-compatible URL[cite: 2]
    if (!target) {
        target = allTabs.find(t => 
            !t.url.startsWith('chrome://') && 
            !t.url.startsWith('edge://') &&
            (t.url.includes('youtube.com/watch') || 
             t.url.includes('spotify.com') || 
             t.url.includes('music.youtube.com'))
        );
    }

    return target || null;
}

/**
 * broadcastMediaState
 * Extracts metadata from the target tab and communicates with the UI.[cite: 2]
 */
async function broadcastMediaState() {
    try {
        const targetTab = await findTargetTab();
        
        // If no tab exists at all, send "Not Playing" and clear the UI[cite: 2]
        if (!targetTab || !targetTab.id) {
            const data = { isPlaying: false, title: 'Not Playing', artist: 'Select a tab with music', history: mediaHistory };
            chrome.runtime.sendMessage({ type: 'MEDIA_UPDATE', data }).catch(() => {});
            return;
        }

        lastActiveTabId = targetTab.id;

        // Script injection with a catch to suppress "Frame with ID 0" errors[cite: 2]
        const results = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            func: () => {
                const meta = navigator.mediaSession?.metadata;
                const video = document.querySelector('video');
                const isPlaying = video ? !video.paused : false;
                
                if (meta && meta.title) {
                    return {
                        title: meta.title,
                        artist: meta.artist,
                        artwork: meta.artwork?.[0]?.src || null,
                        isPlaying: isPlaying,
                        url: window.location.href
                    };
                }
                
                // Fallback for sites without MediaSession
                return {
                    title: document.title.replace(' - YouTube', ''),
                    artist: 'Web Media',
                    artwork: null,
                    isPlaying: isPlaying,
                    url: window.location.href
                };
            }
        }).catch(() => null);

        if (results && results[0]?.result) {
            const data = results[0].result;
            
            // Update history only if it's a new track and is actually playing[cite: 2]
            const isNewTrack = !lastMediaData || lastMediaData.title !== data.title;
            if (data.isPlaying && isNewTrack) {
                mediaHistory = [data, ...mediaHistory.filter(item => item.title !== data.title)].slice(0, 10);
                chrome.storage.local.set({ mediaHistory });
            }

            lastMediaData = data;
            chrome.storage.local.set({ lastMediaData: data });

            chrome.runtime.sendMessage({
                type: 'MEDIA_UPDATE',
                data: { ...data, history: mediaHistory, tabId: targetTab.id }
            }).catch(() => {});
        } else if (lastMediaData) {
            // Tab is paused/buffering: send last known info but set isPlaying to false[cite: 2]
            chrome.runtime.sendMessage({
                type: 'MEDIA_UPDATE',
                data: { ...lastMediaData, isPlaying: false, history: mediaHistory, tabId: targetTab.id }
            }).catch(() => {});
        }
    } catch (globalErr) {
        if (!globalErr.message.includes('ID 0')) {
            console.error('Media Broadcast Error:', globalErr);
        }
    }
}

// Listen for UI requests and media control commands[cite: 2]
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_MEDIA_STATE') {
        broadcastMediaState();
    } else if (message.type === 'MEDIA_COMMAND') {
        // THE FIX: Accept 'url' from the message data
        const { command, tabId, url } = message.data;

        if (tabId) {
            chrome.scripting.executeScript({
                target: { tabId },
                func: (cmd) => {
                    const video = document.querySelector('video');
                    if (video) {
                        if (cmd === 'toggle') video.paused ? video.play() : video.pause();
                        else if (cmd === 'next') (document.querySelector('.ytp-next-button') || document.querySelector('[aria-label="Next"]'))?.click();
                        else if (cmd === 'prev') window.history.back();
                    }
                },
                args: [command]
            }).catch(() => {});
        } else if (url) {
            // THE FIX: Open the SPECIFIC URL from history, not just the last played one
            chrome.tabs.create({ url: url, active: true }); 
        }
    }
});