const DEFAULTS = { theme: 'system', provider: 'grok' };

const PROVIDERS_DATA = {
  grok: {
    name: 'Grok',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0.36 0.5 33.33 32">
            <path d="M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436" fill="currentColor"/>
            <path d="M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341" fill="currentColor"/>
          </svg>`
  },
  perplexity: {
    name: 'Perplexity',
    icon: `<svg fill="#1FB8CD" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"/></svg>`
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" /></svg>`
  },
  claude: {
    name: 'Claude',
    icon: `<svg fill="#D97757" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>`
  },
  gemini: {
    name: 'Gemini',
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" fill="url(#gemini-grad)"/>
            <defs>
              <linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22">
                <stop offset="0%" stop-color="#3689FF"/>
                <stop offset="33%" stop-color="#FA4340"/>
                <stop offset="66%" stop-color="#F6C013"/>
                <stop offset="100%" stop-color="#14BB69"/>
              </linearGradient>
            </defs>
          </svg>`
  }
};

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