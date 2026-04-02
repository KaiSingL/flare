// Load shared provider data
importScripts('providers.js');

// Debug logging utility
let debug = false;
function debugLog(...args) {
  if (debug) {
    console.log('[Quick Grok Debug]', ...args);
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'askGrok') {
    debugLog('Background: Received query:', message.query.substring(0, 50) + '...');
    openTabWithQuery(message.query);
  }
  sendResponse({ status: 'received' });
  return true; // Keep message channel open for async response
});

// Open new tab with pre-filled query via URL parameter, using selected provider
function openTabWithQuery(fullText) {
  chrome.storage.sync.get({ provider: 'grok' }, (settings) => {
    // Fall back to 'grok' if stored provider is disabled or invalid
    const storedProvider = PROVIDERS_DATA[settings.provider];
    const providerKey = (storedProvider && !storedProvider.disabled)
      ? settings.provider
      : 'grok';
    const provider = PROVIDERS_DATA[providerKey];
    const encodedQuery = encodeURIComponent(fullText);
    const url = `${provider.url}?q=${encodedQuery}`;
    
    // Create new active tab with the query URL
    chrome.tabs.create({ url, active: true }, (newTab) => {
      debugLog('Background: Created new active tab for', provider.name, 'query:', newTab.id);
    });
  });
}
