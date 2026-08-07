// ===== SETTINGS MODULE =====
const Settings = (function() {
  // Language settings
  const LANG_STORAGE_KEY = 'windblownCalculatorLang';
  let currentLang = 'en';

  const UI_STRINGS = {
    'en': {
      gearLabelFetching: 'Fetching icons from the wiki...',
      levelPlaceholder: 'Enter level (e.g., 5)',
      resultLabel: 'Your Choice Odds:',
      upgradeNone: 'None',
      gearWeapon: 'Weapon',
      gearTrinket: 'Trinket',
      commonLegend: 'Common',
      rareLegend: 'Rare',
      noSlots: (lvl) => `Level ${lvl} has no affix slots.`,
      noAffixes: (name) => `No affixes available for ${name}.`,
      rerollsPrefix: '(1 in ',
      rerollsSuffix: ' rerolls)',
      errorFail: 'Failed to load data files: ',
      copyrightNotice: `© Motion Twin • Icons & data from <a href="https://windblown.wiki.gg/" target="_blank" rel="noopener">Windblown Wiki</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>) • by ngl`,
      switchToLight: 'Switch to Light',
      switchToDark: 'Switch to Dark'
    },
    'fr': {
      gearLabelFetching: 'Chargement des icônes du wiki...',
      levelPlaceholder: 'Niveau (ex. 5)',
      resultLabel: 'Chances d\'avoir :',
      upgradeNone: 'Aucun',
      gearWeapon: 'Arme',
      gearTrinket: 'Relique',
      commonLegend: 'Commun',
      rareLegend: 'Rare',
      noSlots: (lvl) => `Le niveau ${lvl} n'a pas d'emplacement d'affixe.`,
      noAffixes: (name) => `Aucun affixe disponible pour ${name}.`,
      rerollsPrefix: '(1 sur ',
      rerollsSuffix: ' relances)',
      errorFail: 'Échec du chargement des données : ',
      copyrightNotice: `© Motion Twin • Icônes et données du <a href="https://windblown.wiki.gg/fr" target="_blank" rel="noopener">Windblown Wiki</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>) • par ngl`,
      switchToLight: 'Mode clair',
      switchToDark: 'Mode sombre'
    }
  };

  // Theme settings
  const THEME_STORAGE_KEY = 'windblownCalculatorTheme';
  const DEFAULT_THEME = 'view-dark';

  // Getter/Setter
  function getLang() { return currentLang; }
  function setLang(lang) {
    if (UI_STRINGS[lang]) {
      currentLang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }

  function getCurrentTheme() {
    return document.documentElement.classList.contains('view-light') ? 'light' : 'dark';
  }

  function setTheme(theme) {
    const html = document.documentElement;
    html.classList.remove('view-dark', 'view-light');
    html.classList.add(theme === 'light' ? 'view-light' : 'view-dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  // Public API
  return {
    // Language
    getLang,
    setLang,
    t: (key) => UI_STRINGS[currentLang]?.[key] || '',
    uiStrings: UI_STRINGS,

    // Theme
    getCurrentTheme,
    setTheme,

    // Initialize
    init() {
      // Restore language
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang && UI_STRINGS[savedLang]) {
        currentLang = savedLang;
      }

      // Restore theme
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  };
})();

// ===== LANGUAGE TOGGLE SETUP =====
function setupLanguageToggle() {
  const langBtn = document.getElementById('langToggleBtn');
  const langDropdown = document.getElementById('langDropdown');

  let dropdownOpen = false;

  langBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    
    dropdownOpen = !dropdownOpen;
    langDropdown.hidden = !dropdownOpen;
    langBtn.setAttribute('aria-expanded', dropdownOpen.toString());
  });

  document.addEventListener('click', (e) => {
    if (dropdownOpen && !langDropdown.contains(e.target) && e.target !== langBtn) {
      dropdownOpen = false;
      langDropdown.hidden = true;
      langBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      
      const newLang = option.dataset.lang;
      if (newLang === Settings.getLang()) {
        dropdownOpen = false;
        langDropdown.hidden = true;
        langBtn.setAttribute('aria-expanded', 'false');
        return;
      }

      Settings.setLang(newLang);
      updateLangUI();

      if (typeof setupThemeToggle === 'function') {
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
          const label = themeBtn.querySelector('.theme-label');
          if (label) {
            label.textContent = Settings.getCurrentTheme() === 'light' 
              ? Settings.t('switchToDark') 
              : Settings.t('switchToLight');
          }
        }
      }
      
      dropdownOpen = false;
      langDropdown.hidden = true;
      langBtn.setAttribute('aria-expanded', 'false');
      
      // Clear UI state
      document.getElementById('affixSelection').innerHTML = '';
      document.getElementById('result').innerHTML = '';
      document.getElementById('resultValue').textContent = '-';
      document.getElementById('resultRerolls').textContent = '';
      document.getElementById('gearSelect').value = '';
      document.getElementById('levelInput').value = '';
      document.getElementById('levelNote').textContent = '';
      
      // Reload data
      if (typeof loadData === 'function') {
        loadData();
      }
    });
  });
}

function updateLangUI() {
  const label = document.getElementById('langLabel');
  if (label) label.textContent = Settings.getLang().toUpperCase();

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.lang === Settings.getLang() ? 'true' : 'false');
  });
}

// ===== THEME TOGGLE SETUP =====
function setupThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');

  function updateToggleButton(theme) {
    const label = btn.querySelector('.theme-label');
    if (!label) return;
    label.textContent = theme === 'light' ? Settings.t('switchToDark') : Settings.t('switchToLight');
  }

  // Initial state
  updateToggleButton(Settings.getCurrentTheme());

  btn.addEventListener('click', () => {
    const currentTheme = Settings.getCurrentTheme();
    Settings.setTheme(currentTheme === 'light' ? 'dark' : 'light');
    updateToggleButton(Settings.getCurrentTheme());
  });
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  Settings.init();
  setupLanguageToggle();
  setupThemeToggle();
});

