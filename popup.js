const DEFAULTS = { theme: 'system', provider: 'grok' };

const knob = document.querySelector('.theme-knob');
const control = document.querySelector('.theme-segmented-control');

// Provider Dropdown Elements
const providerTrigger = document.getElementById('provider-trigger');
const providerMenu = document.getElementById('provider-menu');
const providerTriggerIcon = document.getElementById('provider-trigger-icon');
const providerTriggerLabel = document.getElementById('provider-trigger-label');

function positionKnob(theme) {
  if (!knob || !control) return;
  const controlWidth = control.offsetWidth;
  const padding = 3;
  const segmentWidth = (controlWidth - padding * 2) / 3;
  const positions = { system: 0, light: 1, dark: 2 };
  const idx = positions[theme] ?? 0;
  knob.style.left = (padding + idx * segmentWidth) + 'px';
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  positionKnob(theme);
}

// Provider Dropdown Logic
function renderProviderMenu(currentProvider) {
  providerMenu.innerHTML = '';
  
  Object.keys(PROVIDERS_DATA).forEach((key) => {
    const provider = PROVIDERS_DATA[key];
    const isSelected = key === currentProvider;
    
    const optionBtn = document.createElement('button');
    optionBtn.className = 'provider-option';
    optionBtn.setAttribute('role', 'option');
    optionBtn.setAttribute('aria-selected', String(isSelected));
    optionBtn.dataset.provider = key;
    
    optionBtn.innerHTML = `
      <span class="provider-option-icon">${provider.icon}</span>
      <span class="provider-option-label">${provider.name}</span>
    `;
    
    optionBtn.addEventListener('click', () => {
      selectProvider(key);
      closeProviderMenu();
    });
    
    providerMenu.appendChild(optionBtn);
  });
}

function updateProviderTrigger(providerKey) {
  const provider = PROVIDERS_DATA[providerKey] || PROVIDERS_DATA.grok;
  providerTriggerIcon.innerHTML = provider.icon;
  providerTriggerLabel.textContent = provider.name;
}

function selectProvider(providerKey) {
  updateProviderTrigger(providerKey);
  
  // Update aria-selected state
  document.querySelectorAll('.provider-option').forEach(btn => {
    btn.setAttribute('aria-selected', String(btn.dataset.provider === providerKey));
  });
  
  chrome.storage.sync.set({ provider: providerKey });
}

function toggleProviderMenu() {
  const isExpanded = providerTrigger.getAttribute('aria-expanded') === 'true';
  if (isExpanded) {
    closeProviderMenu();
  } else {
    openProviderMenu();
  }
}

function openProviderMenu() {
  providerMenu.classList.add('show');
  providerTrigger.setAttribute('aria-expanded', 'true');
}

function closeProviderMenu() {
  providerMenu.classList.remove('show');
  providerTrigger.setAttribute('aria-expanded', 'false');
}

// Event Listeners for Dropdown
providerTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleProviderMenu();
});

providerTrigger.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openProviderMenu();
    const firstOption = providerMenu.querySelector('.provider-option');
    if (firstOption) firstOption.focus();
  }
});

document.addEventListener('click', (e) => {
  if (!providerTrigger.contains(e.target) && !providerMenu.contains(e.target)) {
    closeProviderMenu();
  }
});

providerMenu.addEventListener('keydown', (e) => {
  const options = Array.from(providerMenu.querySelectorAll('.provider-option'));
  const currentIndex = options.indexOf(document.activeElement);
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const nextIndex = (currentIndex + 1) % options.length;
    options[nextIndex].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prevIndex = (currentIndex - 1 + options.length) % options.length;
    options[prevIndex].focus();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeProviderMenu();
    providerTrigger.focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    // If they hit space/enter, click handles it, but we should make sure it doesn't double trigger
  }
});

function init() {
  const versionElement = document.getElementById('extension-version');
  if (versionElement && chrome.runtime && chrome.runtime.getManifest) {
    versionElement.textContent = 'v' + chrome.runtime.getManifest().version;
  }

  const reloadBtn = document.getElementById('reload-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      chrome.runtime.reload();
    });
  }

  chrome.storage.sync.get(DEFAULTS, (settings) => {
    applyTheme(settings.theme);

    document.querySelectorAll('.theme-option-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.theme === settings.theme));
    });

    const currentProvider = settings.provider || 'grok';
    updateProviderTrigger(currentProvider);
    renderProviderMenu(currentProvider);
  });
}

document.querySelectorAll('.theme-option-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;

    document.querySelectorAll('.theme-option-btn').forEach((b) => {
      b.setAttribute('aria-pressed', String(b === btn));
    });

    applyTheme(theme);

    chrome.storage.sync.set({ theme });
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.theme) {
    applyTheme(changes.theme.newValue);
    document.querySelectorAll('.theme-option-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.theme === changes.theme.newValue));
    });
  }
  if (changes.provider) {
    const newProvider = changes.provider.newValue;
    updateProviderTrigger(newProvider);
    document.querySelectorAll('.provider-option').forEach(btn => {
      btn.setAttribute('aria-selected', String(btn.dataset.provider === newProvider));
    });
  }
});

init();