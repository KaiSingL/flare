// Debug logging utility
const debug = false;
function debugLog(...args) {
  if (debug) {
    console.log('[Quick Grok Debug]', ...args);
  }
}

// Create unified widget (replaces both popupButton and cardPopup)
const iconUrl = chrome.runtime.getURL('icons/icon.svg');
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
}

// Position widget at bottom center of selection (collapsed pill mode)
function positionButton() {
  debugLog('Mouseup event fired');
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

  // Position the pill: centered below the selection
  grokWidget.style.left = (rect.left + 55) + 'px';
  grokWidget.style.top = (rect.bottom + window.scrollY + 30) + 'px';
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
  const pillCenterX = pillRect.left + pillRect.width / 2;
  // Remove the collapsed transform and set explicit positioning
  grokWidget.style.transform = 'translateX(-50%)';

  // Switch to expanded — CSS transitions handle the morphing
  grokWidget.classList.add('expanded');

  // Position: expand downward from the pill position
  // Use the pill's bottom edge as the top of the expanded card
  const scrollTop = window.scrollY;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let popupTop = pillRect.top + scrollTop; // Keep top at pill's top position
  let popupLeft = pillCenterX;

  grokWidget.style.left = popupLeft + 'px';
  grokWidget.style.top = popupTop + 'px';

  // After transition starts, adjust for viewport fit
  setTimeout(() => {
    const popupRect = grokWidget.getBoundingClientRect();
    let adjustedTop = popupTop;
    let adjustedLeft = popupLeft;

    // Vertical: flip above if overflows bottom
    if (popupRect.bottom > viewportHeight) {
      const spaceAbove = pillRect.top - popupRect.height - 8;
      if (spaceAbove > 0) {
        adjustedTop = (pillRect.top - popupRect.height - 8) + scrollTop;
      } else {
        adjustedTop = (viewportHeight - popupRect.height) + scrollTop;
      }
    } else if (popupRect.top < 0) {
      adjustedTop = scrollTop + 8;
    }

    // Horizontal: clamp to fit
    const halfWidth = popupRect.width / 2;
    if (popupRect.left < 0) {
      adjustedLeft = halfWidth + 8;
    } else if (popupRect.right > viewportWidth) {
      adjustedLeft = (viewportWidth - halfWidth) - 8;
    }

    grokWidget.style.top = adjustedTop + 'px';
    grokWidget.style.left = adjustedLeft + 'px';
  }, 0);

  window.getSelection().removeAllRanges();
  promptInput.value = '';
  includeUrlCheckbox.checked = includeUrlDefaultSetting;

  // Focus input after transition
  setTimeout(() => {
    promptInput.focus();
  }, 300);

  debugLog('Widget expanded');
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

// Scroll: hide
document.addEventListener('scroll', () => {
  hideWidget();
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

chrome.storage.sync.get({ provider: 'grok', theme: 'system', includeUrlDefault: false }, (settings) => {
  if (submitButton && typeof PROVIDERS_DATA !== 'undefined' && PROVIDERS_DATA[settings.provider]) {
    submitButton.innerHTML = PROVIDERS_DATA[settings.provider].icon;
  }
  currentThemeSetting = settings.theme;
  includeUrlDefaultSetting = settings.includeUrlDefault;
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
