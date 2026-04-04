// Debug logging utility
const debug = false;
function debugLog(...args) {
  if (debug) {
    console.log('[Quick Grok Debug]', ...args);
  }
}

// Create and append popup button
const popupButton = document.createElement('button');
popupButton.id = 'grok-popup-button';
const iconUrl = chrome.runtime.getURL('icons/icon.svg');
popupButton.innerHTML = `
  <img src="${iconUrl}" width="24" height="24" alt="Flare">
  <span class="grok-popup-label">Ask</span>
`;
document.body.appendChild(popupButton);
popupButton.classList.add('hidden'); // Ensure initial hidden state

// Create and append card popup
const cardPopup = document.createElement('div');
cardPopup.id = 'grok-card-popup';
cardPopup.innerHTML = `
  <div class="grok-quote">
    <p id="grok-selected-quote" class="grok-quote-text"></p>
  </div>
  <div class="grok-input-container">
    <textarea id="grok-prompt-input" rows="3" placeholder="Add more context or a question..."></textarea>
    <div class="grok-submit-container">
      <label class="grok-checkbox">
        <input type="checkbox" id="include-url">
        Include URL
      </label>
      <button id="grok-submit-button">
        <!-- SVG injected dynamically -->
      </button>
    </div>
  </div>
`;
cardPopup.classList.add('hidden');
document.body.appendChild(cardPopup);

// Get elements
const selectedQuote = document.getElementById('grok-selected-quote');
const promptInput = document.getElementById('grok-prompt-input');
const submitButton = document.getElementById('grok-submit-button');
const includeUrlCheckbox = document.getElementById('include-url');

// Robust function to check if the current selection is within an editable element
function isSelectionInEditable() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  let container = range.commonAncestorContainer;

  // If container is a text node, move to its parent element
  if (container.nodeType !== Node.ELEMENT_NODE) {
    container = container.parentElement;
  }

  if (!container) {
    return false;
  }

  // Traverse up the DOM tree from the common ancestor container
  // Check each element for editability (contenteditable or input/textarea)
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

// Position button at bottom center of selection
function positionButton() {
  debugLog('Mouseup event fired');
  // PLAN: Grab selection IMMEDIATELY—no setTimeout delay to beat React/event collapses
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  debugLog('Immediate selection:', selectedText);

  // PLAN: Primary check on selectedText truthiness, with fallbacks
  if (!selectedText || selection.rangeCount === 0 || selection.isCollapsed) {
    debugLog('No valid selection (immediate check)');
    popupButton.classList.add('hidden');
    return;
  }

  debugLog('Valid selection detected:', selectedText);

  // Check if selection is in an editable element using robust method
  if (isSelectionInEditable()) {
    debugLog('Selection in editable element, hiding button');
    popupButton.classList.add('hidden');
    return;
  }

  // PLAN: Store text in dataset immediately for handleButtonClick fallback
  popupButton.dataset.selection = selectedText;

  // PLAN: Wrap range access in try-catch to avoid crashes on empty/invalid rects
  let rect;
  try {
    const range = selection.getRangeAt(0);
    rect = range.getBoundingClientRect();
  } catch (e) {
    debugLog('Range rect error:', e);
    popupButton.classList.add('hidden');
    return;
  }

  popupButton.style.left = (rect.left + 55) + 'px';
  popupButton.style.top = (rect.bottom + window.scrollY + 30) + 'px';
  popupButton.style.position = 'absolute';
  popupButton.classList.remove('hidden');

  // PLAN: Bulletproof visibility—zero-delay setTimeout to enforce display
  setTimeout(() => {
    popupButton.classList.remove('hidden');
    const computedStyle = window.getComputedStyle(popupButton);
    if (computedStyle.display === 'none') {
      popupButton.style.display = 'flex';
    }
    debugLog('Visibility enforced');
  }, 0);

  debugLog('Popup button shown with stored selection:', selectedText);
}

// Handle button click to show card
function handleButtonClick() {
  debugLog('Popup button clicked');
  // PLAN: Use stored selection first (fallback to live if missing)
  let selection = popupButton.dataset.selection || window.getSelection().toString().trim();
  if (!selection) { 
    debugLog('No selection available (stored or live)');
    return;
  }
  debugLog('Using selection:', selection);

  // Store full quote for submission
  selectedQuote.dataset.fullQuote = selection;

  // Truncate for display: max 80 chars + "..."
  const truncated = selection.length > 80 ? selection.substring(0, 80) + '...' : selection;
  selectedQuote.textContent = truncated;

  const buttonRect = popupButton.getBoundingClientRect();
  let popupTop = buttonRect.bottom + 8;
  let popupLeft = buttonRect.left + buttonRect.width / 2;

  // ENHANCEMENT: Initial positioning (below button, centered)
  cardPopup.style.left = popupLeft + 'px';
  cardPopup.style.top = (popupTop + window.scrollY) + 'px';
  cardPopup.style.position = 'absolute';
  cardPopup.classList.remove('hidden');

  // ENHANCEMENT: Zero-delay measure & adjust for viewport fit
  setTimeout(() => {
    const popupRect = cardPopup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Vertical adjustment: Prefer below; flip above if overflows bottom, nudge if top
    let adjustedTop = popupTop + scrollY;
    if (popupRect.bottom > viewportHeight) {
      // Flip above if space allows (with buffer)
      const spaceAbove = buttonRect.top - popupRect.height - 8;
      if (spaceAbove > 0) {
        adjustedTop = (buttonRect.top - popupRect.height - 8) + scrollY;
        debugLog('Flipped popup above button');
      } else {
        // Nudge up to fit bottom
        adjustedTop = (viewportHeight - popupRect.height) + scrollY;
        debugLog('Nudged popup up to fit viewport');
      }
    } else if (popupRect.top < 0) {
      // Nudge down if overflows top (rare, but safe)
      adjustedTop = scrollY + 8;
    }

    // Horizontal adjustment: Center-clamp to fit (respects translateX(-50%))
    let adjustedLeft = popupLeft;
    const halfWidth = popupRect.width / 2;
    if (popupRect.left < 0) {
      adjustedLeft = halfWidth + 8; // Shift right, small buffer
    } else if (popupRect.right > viewportWidth) {
      adjustedLeft = (viewportWidth - halfWidth) - 8; // Shift left
    }

    // Apply adjustments
    cardPopup.style.top = adjustedTop + 'px';
    cardPopup.style.left = adjustedLeft + 'px';

    debugLog('Viewport adjustments applied:', { adjustedTop, adjustedLeft });
  }, 0);

  popupButton.classList.add('hidden');
  window.getSelection().removeAllRanges();
  promptInput.value = '';
  includeUrlCheckbox.checked = includeUrlDefaultSetting; // Use setting
  promptInput.focus();
  debugLog('Card popup shown');
}

// Handle submit: Send to background script for Grok tab injection
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

  // Base query components
  const quoteBlock = `\`\`\`\n${fullQuote}\n\`\`\``;
  const optionalPrompt = prompt ? `\n\n${prompt}` : '';

  let fullText;
  if (includeUrl) {
    // Get current page full URL for site: operator (hidden from UI)
    const siteUrl = window.location.href;
    const sitePrefix = `site: ${siteUrl}`;
    fullText = `${sitePrefix}\n\n${quoteBlock}${optionalPrompt}`;
  } else {
    fullText = `${quoteBlock}${optionalPrompt}`;
  }
  debugLog('fullText to send:', fullText);

  // Send to background
  chrome.runtime.sendMessage({ action: 'askGrok', query: fullText }, (response) => {
    if (chrome.runtime.lastError) {
      debugLog('Content: Error sending message:', chrome.runtime.lastError);
    } else {
      debugLog('Content: Message sent successfully, response:', response);
    }
  });

  // Hide popup
  cardPopup.classList.add('hidden');
}

// Event listeners
// PLAN: Early event listening—add { capture: true, passive: true } for pristine access without blocking
document.addEventListener('mouseup', positionButton, { capture: true, passive: true });

document.addEventListener('keydown', () => {
  if (!popupButton.classList.contains('hidden')) {
    popupButton.classList.add('hidden');
  }
});

document.addEventListener('mousedown', (e) => {
  if (!popupButton.contains(e.target) && !cardPopup.contains(e.target)) {
    popupButton.classList.add('hidden');
    cardPopup.classList.add('hidden');
  }
});

document.addEventListener('scroll', () => {
  popupButton.classList.add('hidden');
});

document.addEventListener('click', (e) => {
  if (!popupButton.contains(e.target) && !cardPopup.contains(e.target)) {
    popupButton.classList.add('hidden');
    cardPopup.classList.add('hidden');
  }
});

// Button event listeners
popupButton.addEventListener('click', handleButtonClick);

// Attach submit listener with debug
if (submitButton) {
  submitButton.addEventListener('click', handleSubmit);
  debugLog('Submit button listener attached successfully');
} else {
  debugLog('Submit button not found in DOM!');
}

// Set initial settings
let currentThemeSetting = 'system';
let includeUrlDefaultSetting = false;

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
  if (popupButton) popupButton.setAttribute('data-grok-theme', themeAttr);
  if (cardPopup) cardPopup.setAttribute('data-grok-theme', themeAttr);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentThemeSetting === 'system') {
    updateTheme();
  }
});

chrome.storage.sync.get({ provider: 'grok', theme: 'system', includeUrlDefault: false }, (settings) => {
  if (submitButton && typeof PROVIDERS_DATA !== 'undefined' && PROVIDERS_DATA[settings.provider]) {
    submitButton.innerHTML = PROVIDERS_DATA[settings.provider].icon;
  }
  currentThemeSetting = settings.theme;
  includeUrlDefaultSetting = settings.includeUrlDefault;
  updateTheme();
});

// Listen for settings changes
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
});

// Enter key to submit in textarea (without Shift)
if (promptInput) {
  promptInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });
  debugLog('Prompt input listener attached successfully');
} else {
  debugLog('Prompt input not found in DOM!');
}