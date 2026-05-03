/**
 * service-worker.js - UI-vik (visual-increment-kit)
 * Background script for media tracking and tab control.
 */

let lastActiveTabId = null;
let lastMediaData = null;
let mediaHistory = [];

// Load persistence data[cite: 3]
chrome.storage.local.get(['lastMediaData', 'mediaHistory'], (result) => {
    if (result.lastMediaData) lastMediaData = result.lastMediaData;
    if (result.mediaHistory) mediaHistory = result.mediaHistory;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.audible !== undefined || changeInfo.title !== undefined || changeInfo.status === 'complete') {
        broadcastMediaState();
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastActiveTabId) lastActiveTabId = null;
    broadcastMediaState();
});

async function findTargetTab() {
    const allTabs = await chrome.tabs.query({});
    
    // Priority 1: Audible tab (not system pages)[cite: 3]
    let target = allTabs.find(t => t.audible && !t.url.startsWith('chrome://') && !t.url.startsWith('edge://'));

    // Priority 2: Last known active tab[cite: 3]
    if (!target && lastActiveTabId) {
        target = allTabs.find(t => t.id === lastActiveTabId);
    }

    // Priority 3: Any open media URL[cite: 3]
    if (!target) {
        target = allTabs.find(t => 
            !t.url.startsWith('chrome://') && 
            (t.url.includes('youtube.com/watch') || t.url.includes('spotify.com') || t.url.includes('music.youtube.com'))
        );
    }
    return target || null;
}

async function broadcastMediaState() {
    try {
        const targetTab = await findTargetTab();
        
        if (!targetTab || !targetTab.id) {
            const data = { isPlaying: false, title: 'Not Playing', artist: 'Select a tab with music', history: mediaHistory };
            chrome.runtime.sendMessage({ type: 'MEDIA_UPDATE', data }).catch(() => {});
            return;
        }

        lastActiveTabId = targetTab.id;

        const results = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            func: () => {
                const meta = navigator.mediaSession?.metadata;
                const video = document.querySelector('video');
                const isPlaying = video ? !video.paused : false;
                
                return {
                    title: meta?.title || document.title.replace(' - YouTube', ''),
                    artist: meta?.artist || 'Web Media',
                    artwork: meta?.artwork?.[0]?.src || null,
                    isPlaying: video ? !video.paused : false,
                    isLooping: video ? video.loop : false,
                    url: window.location.href
                };
            }
        }).catch(() => null);

        if (results && results[0]?.result) {
            const data = results[0].result;
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
            chrome.runtime.sendMessage({
                type: 'MEDIA_UPDATE',
                data: { ...lastMediaData, isPlaying: false, history: mediaHistory, tabId: targetTab.id }
            }).catch(() => {});
        }
    } catch (err) {
        if (!err.message.includes('ID 0')) console.error(err);
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'GET_MEDIA_STATE') {
        broadcastMediaState();
    } else if (message.type === 'MEDIA_COMMAND') {
        const { command, tabId, url } = message.data;

        if (url && (command === 'play' || !tabId)) {
            chrome.tabs.create({ url: url, active: true });
            return;
        }

        if (tabId) {
            chrome.scripting.executeScript({
                target: { tabId },
                func: (cmd) => {
                    const video = document.querySelector('video');
                    if (!video) return; // Guard clause

                    if (cmd === 'toggle') {
                        video.paused ? video.play() : video.pause();
                    } else if (cmd === 'next') {
                        const next = document.querySelector('.ytp-next-button') || 
                                     document.querySelector('[aria-label="Next"]');
                        next?.click();
                    } else if (cmd === 'prev') {
                        window.history.back();
                    } else if (cmd === 'loop') {
                        // The core looping logic[cite: 3]
                        video.loop = !video.loop;
                    }
                },
                args: [command]
            }).catch(() => {}); // Suppress injection errors[cite: 3]
        }
    }
});