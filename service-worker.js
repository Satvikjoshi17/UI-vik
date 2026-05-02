/**
 * service-worker.js
 * Background script to track audible tabs and media info.
 */

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.audible !== undefined || changeInfo.title !== undefined) {
        broadcastMediaState();
    }
});

chrome.tabs.onRemoved.addListener(() => {
    broadcastMediaState();
});

let lastActiveTabId = null;
let lastMediaData = null;
let mediaHistory = [];

// Load last known media and history from storage on startup
chrome.storage.local.get(['lastMediaData', 'mediaHistory'], (result) => {
    if (result.lastMediaData) lastMediaData = result.lastMediaData;
    if (result.mediaHistory) mediaHistory = result.mediaHistory;
});

async function findTargetTab() {
    // 1. Try currently audible tabs
    const audibleTabs = await chrome.tabs.query({ audible: true });
    if (audibleTabs.length > 0) return audibleTabs[0];

    // 2. Try the last known active tab if it still exists
    if (lastActiveTabId) {
        try {
            const tab = await chrome.tabs.get(lastActiveTabId);
            if (tab && (tab.url.includes('youtube.com') || tab.url.includes('spotify.com') || tab.url.includes('music'))) {
                return tab;
            }
        } catch (e) {
            lastActiveTabId = null;
        }
    }

    // 3. Search for any open media tabs
    const allTabs = await chrome.tabs.query({});
    const mediaTab = allTabs.find(t => 
        t.url.includes('youtube.com/watch') || 
        t.url.includes('spotify.com') || 
        t.url.includes('music.youtube.com')
    );
    return mediaTab || null;
}

async function broadcastMediaState() {
    const targetTab = await findTargetTab();

    if (!targetTab) {
        if (lastMediaData) {
            chrome.runtime.sendMessage({ 
                type: 'MEDIA_UPDATE', 
                data: { ...lastMediaData, isPlaying: false, tabId: null, history: mediaHistory } 
            }).catch(() => {});
        } else {
            chrome.runtime.sendMessage({ 
                type: 'MEDIA_UPDATE', 
                data: { isPlaying: false, title: 'Not Playing', artist: 'Select a tab with music', history: mediaHistory } 
            }).catch(() => {});
        }
        return;
    }

    lastActiveTabId = targetTab.id;

    try {
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
                const ytTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.innerText || 
                                document.querySelector('yt-formatted-string.ytd-video-primary-info-renderer')?.innerText ||
                                document.title;
                const ytArtist = document.querySelector('ytd-channel-name a')?.innerText || 
                                 document.querySelector('#upload-info #channel-name')?.innerText || 'Web Media';
                return { 
                    title: ytTitle.replace(' - YouTube', ''), 
                    artist: ytArtist, 
                    artwork: null,
                    isPlaying: isPlaying,
                    url: window.location.href
                };
            }
        });

        if (results && results[0]?.result) {
            const data = results[0].result;
            
            // Update History if it's a new song
            if (data.title && (!lastMediaData || lastMediaData.title !== data.title)) {
                mediaHistory = [data, ...mediaHistory.filter(item => item.title !== data.title)].slice(0, 10);
                chrome.storage.local.set({ mediaHistory });
            }

            lastMediaData = data;
            chrome.storage.local.set({ lastMediaData: data });
            
            chrome.runtime.sendMessage({
                type: 'MEDIA_UPDATE',
                data: {
                    isPlaying: data.isPlaying,
                    title: data.title || 'Unknown Title',
                    artist: data.artist || 'Unknown Artist',
                    artwork: data.artwork,
                    tabId: targetTab.id,
                    url: data.url,
                    history: mediaHistory
                }
            }).catch(() => {});
        }
    } catch (err) {
        console.error('Metadata extraction failed:', err);
    }
}

// Listen for commands and state requests from the UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_MEDIA_STATE') {
        broadcastMediaState();
    } else if (message.type === 'MEDIA_COMMAND') {
        const { command, tabId } = message.data;
        
        if (tabId) {
            // Tab exists, just send command
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
            });
        } else if (command === 'toggle' && lastMediaData && lastMediaData.url) {
            // Tab was closed, REOPEN it in background
            chrome.tabs.create({ url: lastMediaData.url, active: false }, (newTab) => {
                // Wait for it to load and then play (approximation)
                setTimeout(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: newTab.id },
                        func: () => document.querySelector('video')?.play()
                    });
                }, 3000);
            });
        }
    }
});
