// Debug logging utility
const debug = false;
function debugLog(...args) {
  if (debug) {
    console.log('[Quick Grok Debug]', ...args);
  }
}

// Create unified widget (replaces both popupButton and cardPopup)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" fill="none" viewBox="0 0 256 256"><path d="m16.23 158.4c-1.86-9.36-2.84-17.28-2.84-27.68 0-57.98 46.78-111.7 109.6-111.7 13.16 0 23.16 1.33 35.17 5.44 7.95 2.91 16.86 4.54 28.59 4.54 21.49 0 41.52-6 66.22-24.96l-66.78 66.29c-13.23 13.5-25.11 18.68-41.45 18.68-5.92 0-10.48-1.34-27.6-1.34-46.78 0-87.06 28.29-100.9 70.74z" fill="url(#paint0_linear_101_49831)"/><path d="m3 252 103.8-101.6c19.21-19.02 40.27-31.56 63.94-41.63 23.94-10.2 48.32-26.02 67.87-64.47-6.4 18.88-8.34 29.85-7.99 46.24 0.35 13.76 2.42 23.28 2.42 37.63 0 54.7-41.82 104.9-101.8 111.4 18.77-16.39 29.64-34.86 29.77-51.75 0.11-12.04-6.54-22.98-19.89-22.98-7.94 0-13.57 3.12-16.6 5.27l-121.5 81.89z" fill="url(#paint1_linear_101_49831)"/><defs><linearGradient id="paint0_linear_101_49831" x1="94.99" x2="145.2" y1="160" y2="6.72" gradientUnits="userSpaceOnUse"><stop stop-color="#FF420E" offset="0"/><stop stop-color="#FF8200" offset="1"/></linearGradient><linearGradient id="paint1_linear_101_49831" x1="120.8" x2="120.8" y1="253.2" y2="44.34" gradientUnits="userSpaceOnUse"><stop stop-color="#F60073" offset="0"/><stop stop-color="#FD4A3C" offset="1"/></linearGradient></defs></svg>`;
const iconUrl = `data:image/svg+xml,${encodeURIComponent(iconSvg)}`;
const grokWidget = document.createElement('div');
grokWidget.id = 'grok-widget';
grokWidget.innerHTML = `
  <div class="grok-widget-header">
    <img src="${iconUrl}" width="24" height="24" alt="Flare">
    <span class="grok-popup-label">Ask</span>
  </div>
  <div class="grok-widget-body-wrapper">
    <div class="grok-widget-body">
      <div class="grok-quote">
        <p id="grok-selected-quote" class="grok-quote-text"></p>
      </div>
      <div class="grok-input-container">
        <textarea id="grok-prompt-input" rows="3" placeholder="Add more context or a question..."></textarea>
        <div class="grok-submit-container">
          <label class="grok-checkbox">
            <input type="checkbox" id="include-url">
            <svg class="grok-url-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path class="grok-check-mark" d="m9 12 2 2 4-4"/>
            </svg>
            Include URL
          </label>
          <button id="grok-submit-button">
            <!-- SVG injected dynamically -->
          </button>
        </div>
      </div>
    </div>
  </div>
`;
document.body.appendChild(grokWidget);
grokWidget.classList.add('hidden');

// Get elements
const selectedQuote = document.getElementById('grok-selected-quote');
const promptInput = document.getElementById('grok-prompt-input');
const submitButton = document.getElementById('grok-submit-button');
const includeUrlCheckbox = document.getElementById('include-url');
const widgetHeader = grokWidget.querySelector('.grok-widget-header');

// Robust function to check if the current selection is within an editable element
function isSelectionInEditable() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  let container = range.commonAncestorContainer;

  if (container.nodeType !== Node.ELEMENT_NODE) {
    container = container.parentElement;
  }

  if (!container) {
    return false;
  }

  while (container && container !== document.body) {
    if (
      container.isContentEditable ||
      container.tagName === 'INPUT' ||
      container.tagName === 'TEXTAREA'
    ) {
      return true;
    }
    container = container.parentElement;
  }

  return false;
}

// Check if widget is in collapsed (pill) state
function isCollapsed() {
  return !grokWidget.classList.contains('expanded');
}

// Hide widget entirely
function hideWidget() {
  grokWidget.classList.remove('expanded');
  grokWidget.classList.add('hidden');
  grokWidget.style.transform = '';
}

const EXPANSION_MARGIN = 16;
const EST_EXPANDED_WIDTH = 320;
const EST_EXPANDED_HEIGHT = 380;

function getExpansionType(pillRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pillCenterX = pillRect.left + pillRect.width / 2;

  const centerFits =
    pillCenterX - EST_EXPANDED_WIDTH / 2 >= EXPANSION_MARGIN &&
    pillCenterX + EST_EXPANDED_WIDTH / 2 <= vw - EXPANSION_MARGIN;

  let horizontal;
  if (centerFits) {
    horizontal = 'center';
  } else if (vw - pillRect.right >= pillRect.left) {
    horizontal = 'left';
  } else {
    horizontal = 'right';
  }

  let vertical;
  if (vh - pillRect.bottom >= EST_EXPANDED_HEIGHT + EXPANSION_MARGIN) {
    vertical = 'down';
  } else if (pillRect.top >= EST_EXPANDED_HEIGHT + EXPANSION_MARGIN) {
    vertical = 'up';
  } else {
    vertical = (vh - pillRect.bottom >= pillRect.top) ? 'down' : 'up';
  }

  return { horizontal, vertical };
}

function getExpansionTransform(expansion) {
  const tx = { center: '-50%', left: '0', right: '-100%' }[expansion.horizontal];
  const ty = { down: '0', up: '-100%' }[expansion.vertical];
  if (tx === '0' && ty === '0') return 'none';
  if (tx === '0') return `translateY(${ty})`;
  if (ty === '0') return `translateX(${tx})`;
  return `translate(${tx}, ${ty})`;
}

function adjustForViewportAfterTransition() {
  function adjust() {
    const rect = grokWidget.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = parseFloat(grokWidget.style.left) || 0;
    let top = parseFloat(grokWidget.style.top) || 0;
    let changed = false;

    let expansion;
    try { expansion = JSON.parse(grokWidget.dataset.expansionType); } catch { expansion = { horizontal: 'center', vertical: 'down' }; }

    // Horizontal clamping — adjust 'left' based on anchor type
    if (rect.left < EXPANSION_MARGIN) {
      if (expansion.horizontal === 'center') {
        left = scrollX + EXPANSION_MARGIN + rect.width / 2;
      } else if (expansion.horizontal === 'left') {
        left = scrollX + EXPANSION_MARGIN;
      } else {
        left = scrollX + EXPANSION_MARGIN + rect.width;
      }
      changed = true;
    } else if (rect.right > vw - EXPANSION_MARGIN) {
      if (expansion.horizontal === 'center') {
        left = scrollX + vw - EXPANSION_MARGIN - rect.width / 2;
      } else if (expansion.horizontal === 'left') {
        left = scrollX + vw - EXPANSION_MARGIN - rect.width;
      } else {
        left = scrollX + vw - EXPANSION_MARGIN;
      }
      changed = true;
    }

    // Vertical clamping — adjust 'top' based on anchor type
    if (rect.top < EXPANSION_MARGIN) {
      top = scrollY + EXPANSION_MARGIN;
      changed = true;
    } else if (rect.bottom > vh - EXPANSION_MARGIN) {
      if (expansion.vertical === 'down') {
        top = scrollY + vh - EXPANSION_MARGIN - rect.height;
      } else {
        top = scrollY + vh - EXPANSION_MARGIN;
      }
      changed = true;
    }

    if (changed) {
      grokWidget.style.transition = 'none';
      grokWidget.style.left = left + 'px';
      grokWidget.style.top = top + 'px';
      requestAnimationFrame(() => {
        grokWidget.style.transition = '';
      });
    }
  }

  function onTransitionEnd(e) {
    if (e.propertyName === 'width') {
      grokWidget.removeEventListener('transitionend', onTransitionEnd);
      adjust();
    }
  }

  grokWidget.addEventListener('transitionend', onTransitionEnd);
  setTimeout(adjust, 500);
}

function repositionInView() {
  if (isCollapsed()) return;

  const rect = grokWidget.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = parseFloat(grokWidget.style.left) || 0;
  let top = parseFloat(grokWidget.style.top) || 0;

  let expansion;
  try { expansion = JSON.parse(grokWidget.dataset.expansionType); } catch { expansion = { horizontal: 'center', vertical: 'down' }; }

  if (rect.left < EXPANSION_MARGIN) {
    if (expansion.horizontal === 'center') {
      left = scrollX + EXPANSION_MARGIN + rect.width / 2;
    } else if (expansion.horizontal === 'left') {
      left = scrollX + EXPANSION_MARGIN;
    } else {
      left = scrollX + EXPANSION_MARGIN + rect.width;
    }
  } else if (rect.right > vw - EXPANSION_MARGIN) {
    if (expansion.horizontal === 'center') {
      left = scrollX + vw - EXPANSION_MARGIN - rect.width / 2;
    } else if (expansion.horizontal === 'left') {
      left = scrollX + vw - EXPANSION_MARGIN - rect.width;
    } else {
      left = scrollX + vw - EXPANSION_MARGIN;
    }
  }

  if (rect.top < EXPANSION_MARGIN) {
    top = scrollY + EXPANSION_MARGIN;
  } else if (rect.bottom > vh - EXPANSION_MARGIN) {
    if (expansion.vertical === 'down') {
      top = scrollY + vh - EXPANSION_MARGIN - rect.height;
    } else {
      top = scrollY + vh - EXPANSION_MARGIN;
    }
  }

  grokWidget.style.transition = 'none';
  grokWidget.style.left = left + 'px';
  grokWidget.style.top = top + 'px';
  requestAnimationFrame(() => {
    grokWidget.style.transition = '';
  });
}

// Position widget at bottom center of selection (collapsed pill mode)
function positionButton() {
  debugLog('Mouseup event fired');
  if (!extensionEnabled) return;
  // Don't reposition if expanded
  if (!isCollapsed()) return;

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  debugLog('Immediate selection:', selectedText);

  if (!selectedText || selection.rangeCount === 0 || selection.isCollapsed) {
    debugLog('No valid selection (immediate check)');
    grokWidget.classList.add('hidden');
    grokWidget.classList.remove('expanded');
    return;
  }

  debugLog('Valid selection detected:', selectedText);

  if (isSelectionInEditable()) {
    debugLog('Selection in editable element, hiding widget');
    grokWidget.classList.add('hidden');
    return;
  }

  grokWidget.dataset.selection = selectedText;

  let rect;
  try {
    const range = selection.getRangeAt(0);
    rect = range.getBoundingClientRect();
  } catch (e) {
    debugLog('Range rect error:', e);
    grokWidget.classList.add('hidden');
    return;
  }

  // Position the pill: centered below the selection, clamped to viewport
  const PILL_W = 82;
  const PILL_H = 44;
  const PILL_MARGIN = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let pillLeft = rect.left + 55;
  let pillTop = rect.bottom + window.scrollY + 30;

  // Clamp pill within viewport while accounting for translate(-50%, -50%)
  if (pillLeft - PILL_W / 2 < PILL_MARGIN) {
    pillLeft = PILL_MARGIN + PILL_W / 2;
  } else if (pillLeft + PILL_W / 2 > vw - PILL_MARGIN) {
    pillLeft = vw - PILL_MARGIN - PILL_W / 2;
  }
  if (pillTop - PILL_H / 2 < window.scrollY + PILL_MARGIN) {
    pillTop = window.scrollY + PILL_MARGIN + PILL_H / 2;
  } else if (pillTop + PILL_H / 2 > window.scrollY + vh - PILL_MARGIN) {
    pillTop = window.scrollY + vh - PILL_MARGIN - PILL_H / 2;
  }

  grokWidget.style.left = pillLeft + 'px';
  grokWidget.style.top = pillTop + 'px';
  grokWidget.style.position = 'absolute';
  grokWidget.style.transform = 'translate(-50%, -50%)';
  grokWidget.classList.remove('hidden');
  grokWidget.classList.remove('expanded');

  setTimeout(() => {
    grokWidget.classList.remove('hidden');
    const computedStyle = window.getComputedStyle(grokWidget);
    if (computedStyle.display === 'none') {
      grokWidget.style.display = 'flex';
    }
    debugLog('Visibility enforced');
  }, 0);

  debugLog('Widget shown (collapsed) with stored selection:', selectedText);
}

// Handle click on collapsed pill → expand into card
function handleExpand() {
  debugLog('Widget clicked for expand');
  if (!extensionEnabled) { hideWidget(); return; }
  grokWidget.classList.remove('hidden');
  let selection = grokWidget.dataset.selection || window.getSelection().toString().trim();
  if (!selection) {
    debugLog('No selection available (stored or live)');
    return;
  }
  debugLog('Using selection:', selection);

  // Store full quote for submission
  selectedQuote.dataset.fullQuote = selection;
  const truncated = selection.length > 80 ? selection.substring(0, 80) + '...' : selection;
  selectedQuote.textContent = truncated;

  // Capture current pill position BEFORE expanding
  const pillRect = grokWidget.getBoundingClientRect();
  const expansion = getExpansionType(pillRect);
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Document coordinates for the anchor point
  let left, top;
  if (expansion.horizontal === 'center') {
    left = pillRect.left + pillRect.width / 2 + scrollX;
  } else if (expansion.horizontal === 'left') {
    left = pillRect.left + scrollX;
  } else {
    left = pillRect.right + scrollX;
  }

  if (expansion.vertical === 'down') {
    top = pillRect.top + scrollY;
  } else {
    top = pillRect.bottom + scrollY;
  }

  grokWidget.style.left = left + 'px';
  grokWidget.style.top = top + 'px';
  grokWidget.style.transform = getExpansionTransform(expansion);
  grokWidget.classList.add('expanded');

  grokWidget.dataset.expansionType = JSON.stringify(expansion);

  adjustForViewportAfterTransition();

  window.getSelection().removeAllRanges();
  promptInput.value = '';
  includeUrlCheckbox.checked = includeUrlDefaultSetting;

  // Focus input after transition
  setTimeout(() => {
    promptInput.focus();
  }, 300);

  debugLog('Widget expanded with type:', expansion);
}

// Handle submit: Send to background script
function handleSubmit() {
  debugLog('handleSubmit called');
  const fullQuote = selectedQuote.dataset.fullQuote || selectedQuote.textContent.trim();
  const prompt = promptInput.value.trim();
  const includeUrl = includeUrlCheckbox.checked;
  if (!fullQuote) {
    debugLog('No fullQuote, bailing out');
    return;
  }
  debugLog('fullQuote:', fullQuote);
  debugLog('prompt:', prompt);
  debugLog('includeUrl:', includeUrl);

  const quoteBlock = `\`\`\`\n${fullQuote}\n\`\`\``;
  const optionalPrompt = prompt ? `\n\n${prompt}` : '';

  let fullText;
  if (includeUrl) {
    const siteUrl = window.location.href;
    const sitePrefix = `site: ${siteUrl}`;
    fullText = `${sitePrefix}\n\n${quoteBlock}${optionalPrompt}`;
  } else {
    fullText = `${quoteBlock}${optionalPrompt}`;
  }
  debugLog('fullText to send:', fullText);

  chrome.runtime.sendMessage({ action: 'askGrok', query: fullText }, (response) => {
    if (chrome.runtime.lastError) {
      debugLog('Content: Error sending message:', chrome.runtime.lastError);
    } else {
      debugLog('Content: Message sent successfully, response:', response);
    }
  });

  // Collapse and hide
  hideWidget();
}

// ==============================
// Event listeners
// ==============================

// Mouseup for selection detection
document.addEventListener('mouseup', positionButton, { capture: true, passive: true });

// Keydown: hide collapsed pill on any key
document.addEventListener('keydown', (e) => {
  if (isCollapsed()) {
    grokWidget.classList.add('hidden');
  }
  // Escape key: collapse expanded widget
  if (e.key === 'Escape' && !isCollapsed()) {
    hideWidget();
  }
});

// Mousedown outside widget: hide
document.addEventListener('mousedown', (e) => {
  if (!grokWidget.contains(e.target)) {
    hideWidget();
  }
});

// Re-read enabled state when tab becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    chrome.storage.sync.get({ enabled: true }, (settings) => {
      extensionEnabled = settings.enabled !== false;
      if (!extensionEnabled) {
        hideWidget();
      }
    });
  }
});

// Scroll: hide collapsed pill, reposition expanded card
document.addEventListener('scroll', () => {
  if (isCollapsed()) {
    grokWidget.classList.add('hidden');
  } else {
    repositionInView();
  }
});

// Resize: reposition expanded card to stay in viewport
window.addEventListener('resize', () => {
  if (!isCollapsed()) {
    repositionInView();
  }
});

// Click outside widget: hide
document.addEventListener('click', (e) => {
  if (!grokWidget.contains(e.target)) {
    hideWidget();
  }
});

// Click on widget (collapsed pill) → expand
grokWidget.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!extensionEnabled) { hideWidget(); return; }
  if (isCollapsed()) {
    handleExpand();
  }
});

// Submit button
if (submitButton) {
  submitButton.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSubmit();
  });
  debugLog('Submit button listener attached successfully');
} else {
  debugLog('Submit button not found in DOM!');
}

// Settings
let currentThemeSetting = 'system';
let includeUrlDefaultSetting = false;
let extensionEnabled = true;

function updateTheme() {
  let isDark = false;
  if (currentThemeSetting === 'dark') {
    isDark = true;
  } else if (currentThemeSetting === 'light') {
    isDark = false;
  } else {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const themeAttr = isDark ? 'dark' : 'light';
  grokWidget.setAttribute('data-grok-theme', themeAttr);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentThemeSetting === 'system') {
    updateTheme();
  }
});

chrome.storage.sync.get({ provider: 'grok', theme: 'system', includeUrlDefault: false, enabled: true }, (settings) => {
  if (submitButton && typeof PROVIDERS_DATA !== 'undefined' && PROVIDERS_DATA[settings.provider]) {
    submitButton.innerHTML = PROVIDERS_DATA[settings.provider].icon;
  }
  currentThemeSetting = settings.theme;
  includeUrlDefaultSetting = settings.includeUrlDefault;
  extensionEnabled = settings.enabled !== false;
  updateTheme();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.provider && submitButton && typeof PROVIDERS_DATA !== 'undefined' && PROVIDERS_DATA[changes.provider.newValue]) {
    submitButton.innerHTML = PROVIDERS_DATA[changes.provider.newValue].icon;
  }
  if (changes.theme) {
    currentThemeSetting = changes.theme.newValue;
    updateTheme();
  }
  if (changes.includeUrlDefault) {
    includeUrlDefaultSetting = changes.includeUrlDefault.newValue;
    if (includeUrlCheckbox) {
      includeUrlCheckbox.checked = includeUrlDefaultSetting;
    }
  }
  if (changes.enabled) {
    extensionEnabled = changes.enabled.newValue !== false;
    if (!extensionEnabled) {
      hideWidget();
    }
  }
});

// Enter key to submit in textarea (without Shift)
if (promptInput) {
  promptInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      hideWidget();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });
  debugLog('Prompt input listener attached successfully');
} else {
  debugLog('Prompt input not found in DOM!');
}
