// Debug logging utility
const debug = false;
function debugLog(...args) {
  if (debug) {
    console.log('[Quick Grok Debug]', ...args);
  }
}

const style = document.createElement('style');
style.textContent = `
  #grok-popup-button {
    display: flex;
    position: absolute;
    padding: 8px 16px;
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translate(-50%, -50%);
    z-index: 50;
    white-space: nowrap;
    align-items: center;
    background-color: #fcfcfc;
    color: #000;
    border: 1px solid #e5e7eb;
    font-family: sans-serif;
    font-size: 14px;

    &.hidden {
      display: none;
    }

    svg {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      display: inline-block;
      flex-shrink: 0;
    }
  }

  @media (prefers-color-scheme: dark) {
    #grok-popup-button {
      background-color: #151515;
      color: #fff;
      border-color: #374151;
    }
  }

  #grok-card-popup {
    display: block;
    position: absolute;
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e5e7eb;
    z-index: 50;
    max-width: 448px;
    width: 320px;
    transform: translateX(-50%);
    font-family: sans-serif;
    font-size: 14px;

    &.hidden {
      display: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    #grok-card-popup {
      background-color: #151515;
      border-color: #374151;
    }
  }

  .grok-quote {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 6px;

    @media (prefers-color-scheme: dark) {
      background-color: #374151;
    }
  }

  #grok-selected-quote {
    font-style: italic;
    color: #4b5563;
    font-size: 14px;

    @media (prefers-color-scheme: dark) {
      color: #d1d5db;
    }
  }

  .grok-input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;

    #grok-prompt-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
      font-size: inherit;
      background-color: #fff;

      @media (prefers-color-scheme: dark) {
        background-color: #374151;
        border-color: #4b5563;
        color: white;
      }
    }
  }

  .grok-submit-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .grok-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      cursor: pointer;
      color: #4b5563;

      @media (prefers-color-scheme: dark) {
        color: #d1d5db;
      }

      input[type="checkbox"] {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid #d1d5db;
        background-color: #fff;
        cursor: pointer;
        position: relative;
        outline: none;

        &:checked {
          background-color: #1e1d1dff;
          border: none;

          &::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #1e1d1dff;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        @media (prefers-color-scheme: dark) {
          background-color: #374151;
          border-color: #4b5563;

          &:checked {
            background-color: #fff;
            border: none;

            &::after {
              background-color: #fff;
            }
          }
        }
      }
    }
  }

  #grok-submit-button {
    background-color: #151515;
    border: none;
    border-radius: 9999px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-size: 14px;

    &:hover {
      background-color: #1f2937;
    }

    svg {
      width: 20px;
      height: 20px;
      color: white;
    }
  }
`;
document.head.appendChild(style);

// Create and append popup button
const popupButton = document.createElement('button');
popupButton.id = 'grok-popup-button';
popupButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0.36 0.5 33.33 32">
    <path d="M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436" fill="currentColor"/>
    <path d="M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341" fill="currentColor"/>
  </svg>
  Ask Grok
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0.36 0.5 33.33 32">
          <path d="M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436" fill="currentColor"/>
          <path d="M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341" fill="currentColor"/>
        </svg>
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
  includeUrlCheckbox.checked = false; // Uncheck by default
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

// Enter key to submit in textarea (without Shift)
if (promptInput) {
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });
  debugLog('Prompt input listener attached successfully');
} else {
  debugLog('Prompt input not found in DOM!');
}