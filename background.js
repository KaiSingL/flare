// Provider configuration will be fetched from storage to keep it dynamic

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
    // Read from the shared PROVIDERS_DATA injected into the background page context,
    // or fallback to hardcoded urls if not available in background script
    const providerMap = {
      grok: { name: 'Grok', url: 'https://grok.com/' },
      perplexity: { name: 'Perplexity', url: 'https://www.perplexity.ai/' },
      chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com/' },
      claude: { name: 'Claude', url: 'https://claude.ai/' },
      gemini: { name: 'Gemini', url: 'https://gemini.google.com/' }
    };
    const provider = providerMap[settings.provider] || providerMap.grok;
    const encodedQuery = encodeURIComponent(fullText);
    const url = `${provider.url}?q=${encodedQuery}`;
    
    // Create new active tab with the query URL
    chrome.tabs.create({ url, active: true }, (newTab) => {
      debugLog('Background: Created new active tab for', provider.name, 'query:', newTab.id);
    });
  });
}
