// ===== GLOBAL STATE =====
let eventListenersInitialized = false;
let weaponsData = {};
let affixesData = {};
let trinketsData = {};
let currentGearType = 'weapon';
let currentUpgradeLevel = 3;

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof Settings !== 'undefined') {
    Settings.init();
  }
  
  await loadData();
});

// ===== DATA LOADING =====
async function loadData() {
  try {
    if (typeof Settings !== 'undefined') {
      Settings.init();
    }
    
    const lang = Settings.getLang();
    const langSuffix = lang === 'en' ? '' : `-${lang}`;

    const [weaponsRes, trinketsRes, affixesRes] = await Promise.all([
      fetch(`./data/weapons${langSuffix}.json`),
      fetch(`./data/trinkets${langSuffix}.json`),
      fetch(`./data/affixes${langSuffix}.json`)
    ]);

    if (!weaponsRes.ok) throw new Error(`weapons${langSuffix}.json: ${weaponsRes.status}`);
    if (!trinketsRes.ok) throw new Error(`trinkets${langSuffix}.json: ${trinketsRes.status}`);
    if (!affixesRes.ok) throw new Error(`affixes${langSuffix}.json: ${affixesRes.status}`);

    const [weaponsRaw, affixesRaw, trinketsRaw] = await Promise.all([
      weaponsRes.json(),
      affixesRes.json(),
      trinketsRes.json()
    ]);

    weaponsData = weaponsRaw.Weapons || {};
    affixesData = affixesRaw.Affixes || {};
    trinketsData = trinketsRaw.Trinkets || {};

    console.log('Data loaded:', {
      weaponsCount: Object.keys(weaponsData).length,
      affixesCount: Object.keys(affixesData).length,
      trinketsCount: Object.keys(trinketsData).length
    });

    setupEventListeners();
    initializeUpgradeBoxes();
    initializeGearTypeBoxes();
    updateStaticText();
    updateLangUI();
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('result').innerHTML =
      `<p class="error">${Settings.t('errorFail')}${error.message}</p>`;
  }
}

// ===== UTILITY FUNCTIONS =====
function getAffixSlots(level) {
  const lvl = parseInt(level, 10);
  if (isNaN(lvl) || lvl < 1) return 0;
  if (lvl <= 2) return 0;
  if (lvl <= 4) return 1;
  if (lvl <= 7) return 2;
  if (lvl <= 10) return 3;
  return 4;
}

function parseCustomTooltip(baseValue, tooltipText, currentLevel) {
  const levelMatch = tooltipText.match(/Past Level (\d+)/) || tooltipText.match(/Au-delà du niveau (\d+)/);
  if (!levelMatch) return baseValue;

  const thresholdLevel = parseInt(levelMatch[1], 10);
  const incrementMatch = tooltipText.match(/([\+\-]\d+(?:[,.]\d+)?)/);
  if (!incrementMatch) return baseValue;

  const perLevelIncrement = parseFloat(incrementMatch[1].replace(',', '.'));
  const baseNumMatch = baseValue.match(/([\+\-]?\d+(?:\.\d+)?)/);
  if (!baseNumMatch) return baseValue;

  const baseNum = parseFloat(baseNumMatch[1]);

  if (currentLevel > thresholdLevel) {
    const total = Math.round((baseNum + (currentLevel - thresholdLevel) * perLevelIncrement) * 100) / 100;
    const sign = total >= 0 ? '+' : '';
    const locale = Settings.getLang() === 'fr' ? 'fr-FR' : 'en-US';
    return sign + total.toLocaleString(locale) + baseValue.replace(baseNumMatch[0], '');
  }

  return baseValue;
}

function cleanWikiText(text, currentLevel) {
  text = text.replace(/\{\{CustomTooltip\|([^|]+)\|([^}]+)\}\}/g, 
    (match, baseValue, tooltipText) => parseCustomTooltip(baseValue, tooltipText, currentLevel));
  text = text.replace(/\{\{[^|]+\|([^|}\n]+)(?:\|[^}]*)?\}\}/g, '$1');
  return text;
}

// ===== STATIC TEXT UPDATES =====
function updateStaticText() {
  const levelInput = document.getElementById('levelInput');
  if (levelInput) levelInput.placeholder = Settings.t('levelPlaceholder');

  const resultLabel = document.querySelector('.result-label');
  if (resultLabel) resultLabel.textContent = Settings.t('resultLabel');

  const gearSelectLabel = document.getElementById('gearSelectLabel');
  if (gearSelectLabel && (!gearSelectLabel.textContent || gearSelectLabel.textContent.includes('Fetching'))) {
    gearSelectLabel.textContent = Settings.t('gearLabelFetching');
  }

  const noneBox = document.querySelector('.upgrade-box[data-upgrade="0"] .upgrade-box-name');
  if (noneBox) noneBox.textContent = Settings.t('upgradeNone');

  const gearTypeBoxes = document.querySelectorAll('.gear-type-box');
  if (gearTypeBoxes.length >= 2) {
    if (gearTypeBoxes[0].querySelector('.gear-type-box-name')) {
      gearTypeBoxes[0].querySelector('.gear-type-box-name').textContent = Settings.t('gearWeapon');
    }
    if (gearTypeBoxes[1].querySelector('.gear-type-box-name')) {
      gearTypeBoxes[1].querySelector('.gear-type-box-name').textContent = Settings.t('gearTrinket');
    }
  }

  const copyrightNotice = document.querySelector('.copyright-notice');
  if (copyrightNotice) {
    copyrightNotice.innerHTML = Settings.t('copyrightNotice');
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  if (eventListenersInitialized) return;
  eventListenersInitialized = true;

  const gearTypeSelect = document.getElementById('gearTypeSelect');
  if (gearTypeSelect) {
    gearTypeSelect.addEventListener('change', () => {
      onGearTypeChange();
      calculateProbability();
    });
  }

  const gearSelectButton = document.getElementById('gearSelectButton');
  if (gearSelectButton) {
    gearSelectButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = gearSelectButton.getAttribute('aria-expanded') === 'true';
      isExpanded ? hideGearDropdown() : showGearDropdown();
    });
    
    gearSelectButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isExpanded = gearSelectButton.getAttribute('aria-expanded') === 'true';
        isExpanded ? hideGearDropdown() : showGearDropdown();
      } else if (e.key === 'Escape') {
        hideGearDropdown();
      }
    });
  }
  
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('gearSelectDropdown');
    const button = document.getElementById('gearSelectButton');
    if (dropdown && button && !dropdown.contains(e.target) && e.target !== button) {
      hideGearDropdown();
    }
  });

  const levelInput = document.getElementById('levelInput');
  if (levelInput) {
    levelInput.addEventListener('input', () => {
      onLevelChange();
      calculateProbability();
    });
  }

  document.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('affix-checkbox')) {
      calculateProbability();
    }
  });
  
  document.addEventListener('click', (e) => {
    if (e.target.closest('.upgrade-box')) {
      setTimeout(() => calculateProbability(), 50);
    }
  });
}

// ===== GEAR TYPE HANDLING =====
function initializeGearTypeBoxes() {
  const gearTypeSelection = document.getElementById('gearTypeSelection');
  if (!gearTypeSelection || !weaponsData || !trinketsData) return;
  
  const gearTypes = [
    { name: Settings.t('gearWeapon'), icon: 'https://windblown.wiki.gg/images/Weapons_Icon.png?format=original', value: 'weapon' },
    { name: Settings.t('gearTrinket'), icon: 'https://windblown.wiki.gg/images/Trinkets_Icon.png?format=original', value: 'trinket' }
  ];
  
  gearTypeSelection.innerHTML = '';
  
  gearTypes.forEach((gearType, index) => {
    const box = document.createElement('div');
    box.className = `gear-type-box ${index === 0 ? 'selected' : ''}`;
    box.dataset.gearType = gearType.value;
    box.tabIndex = 0;
    box.role = 'button';
    
    box.innerHTML = `
      <img src="${gearType.icon}" alt="${gearType.name}" class="invert-on-light">
      <span class="gear-type-box-name">${gearType.name}</span>
    `;
    
    box.addEventListener('click', () => selectGearTypeBox(gearType.value));
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectGearTypeBox(gearType.value);
      }
    });
    
    gearTypeSelection.appendChild(box);
  });
  
  populateGearDropdown(currentGearType);
}

function selectGearTypeBox(type) {
  document.querySelectorAll('.gear-type-box').forEach(box => {
    if (box.dataset.gearType === type) {
      box.classList.add('selected');
      box.setAttribute('aria-pressed', 'true');
    } else {
      box.classList.remove('selected');
      box.setAttribute('aria-pressed', 'false');
    }
  });
  
  const gearTypeSelect = document.getElementById('gearTypeSelect');
  if (gearTypeSelect) gearTypeSelect.value = type;
  
  populateGearDropdown(type);
  document.getElementById('affixSelection').innerHTML = '';
  document.getElementById('levelNote').textContent = '';
  document.getElementById('result').innerHTML = '';
  
  currentGearType = type;
}

// ===== GEAR DROPDOWN =====
function populateGearDropdown(gearType) {
  const gearSelectButton = document.getElementById('gearSelectButton');
  const gearSelectDropdown = document.getElementById('gearSelectDropdown');
  const gearSelectHidden = document.getElementById('gearSelect');
  if (!gearSelectButton || !gearSelectDropdown || !gearSelectHidden) return;

  gearSelectDropdown.innerHTML = '';

  const gearData = gearType === 'weapon' ? weaponsData : trinketsData;
  if (!gearData) return;

  const currentLang = Settings.getLang();
  const collator = new Intl.Collator(currentLang, {
    sensitivity: 'accent', 
    usage: 'sort'
  });

  const gearNames = Object.keys(gearData).sort((a, b) => collator.compare(a, b));
  let firstGearName = null;
  let firstGearIconUrl = null;

  gearNames.forEach((name, index) => {
    const gearInfo = gearData[name];
    const iconName = gearInfo.Image ? gearInfo.Image.replace(/ /g, '_') : '';
    const iconUrl = iconName ? `https://windblown.wiki.gg/images/${iconName}?format=original` : null;

    if (index === 0) {
      firstGearName = name;
      firstGearIconUrl = iconUrl;
    }

    const option = document.createElement('button');
    option.className = 'gear-option';
    option.type = 'button';
    option.dataset.gearValue = name;

    if (iconUrl) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'option-icon';
      const img = document.createElement('img');
      img.src = iconUrl;
      img.alt = name;
      iconSpan.appendChild(img);
      option.appendChild(iconSpan);
    }

    option.innerHTML += `<span class="option-name">${name}</span>`;
    option.addEventListener('click', () => selectGearOption(name, name, iconUrl));

    gearSelectDropdown.appendChild(option);
  });

  if (firstGearName && gearNames.length > 0) {
    selectGearOption(firstGearName, firstGearName, firstGearIconUrl, false);
  }
}

function selectGearOption(value, label, iconUrl, triggerCalculation = true) {
  const gearSelectButton = document.getElementById('gearSelectButton');
  const gearSelectLabel = document.getElementById('gearSelectLabel');
  const gearSelectIcon = document.getElementById('gearSelectIcon');
  const gearSelectDropdown = document.getElementById('gearSelectDropdown');
  const gearSelectHidden = document.getElementById('gearSelect');

  if (gearSelectHidden) gearSelectHidden.value = value;
  if (gearSelectLabel) gearSelectLabel.textContent = label;

  if (gearSelectIcon) {
    if (iconUrl) {
      gearSelectIcon.innerHTML = `<img src="${iconUrl}" alt="${label}">`;
      gearSelectIcon.classList.add('has-icon');
    } else {
      gearSelectIcon.innerHTML = '';
      gearSelectIcon.classList.remove('has-icon');
    }
  }

  document.querySelectorAll('.gear-option').forEach(opt => {
    if (opt.dataset.gearValue === value) {
      opt.classList.add('selected');
      opt.setAttribute('aria-selected', 'true');
    } else {
      opt.classList.remove('selected');
      opt.setAttribute('aria-selected', 'false');
    }
  });

  hideGearDropdown();
  if (triggerCalculation) {
    onGearChange();
    calculateProbability();
  }
}

function showGearDropdown() {
  const dropdown = document.getElementById('gearSelectDropdown');
  const button = document.getElementById('gearSelectButton');
  if (dropdown && button) {
    dropdown.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  }
}

function hideGearDropdown() {
  const dropdown = document.getElementById('gearSelectDropdown');
  const button = document.getElementById('gearSelectButton');
  if (dropdown && button) {
    dropdown.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  }
}

function onGearTypeChange() {
  currentGearType = document.getElementById('gearTypeSelect').value;
  selectGearTypeBox(currentGearType);
}

function onGearChange() {
  updateAffixDisplay();
  document.getElementById('result').innerHTML = '';
}

function onLevelChange() {
  updateAffixDisplay();
  document.getElementById('result').innerHTML = '';
}

// ===== AFFIX DISPLAY =====
function updateCheckboxStates(numSlots, upgradeLevel) {
  const affixContainer = document.getElementById('affixSelection');
  const allCheckboxes = affixContainer.querySelectorAll('.affix-checkbox');
  const rareCheckboxes = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]');
  
  const totalChecked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
  const rareChecked = Array.from(rareCheckboxes).filter(cb => cb.checked).length;
  
  const rareRestriction = (upgradeLevel === 1 || upgradeLevel === 2) && rareChecked >= 1;
  const upgradeZero = (upgradeLevel === 0);
  
  allCheckboxes.forEach(cb => {
    const label = cb.closest('.affix-label');
    let shouldDisable = false;
    
    if (upgradeZero && cb.dataset.rarity === 'Rare') shouldDisable = true;
    else if (totalChecked >= numSlots && !cb.checked) shouldDisable = true;
    else if (rareRestriction && cb.dataset.rarity === 'Rare' && !cb.checked) shouldDisable = true;
    
    cb.disabled = shouldDisable;
    if (label) label.classList.toggle('disabled', shouldDisable);
  });
}

function updateAffixDisplay() {
  const gearName = document.getElementById('gearSelect').value;
  const levelInput = document.getElementById('levelInput').value.trim();
  const affixContainer = document.getElementById('affixSelection');
  const levelNote = document.getElementById('levelNote');
  
  const level = parseInt(levelInput, 10);
  if (isNaN(level) || level < 1) {
    affixContainer.innerHTML = '';
    levelNote.textContent = '';
    return;
  }
  
  const numSlots = getAffixSlots(level);
  levelNote.textContent = '';
  
  if (numSlots === 0) {
    affixContainer.innerHTML = `<hr>${Settings.t('noSlots')(level)}`;
    return;
  }
  
  if (!gearName) {
    affixContainer.innerHTML = '<hr>';
    return;
  }
  
  const gearKey = currentGearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
  
  const applicableAffixes = Object.entries(affixesData).filter(([_, affix]) => {
    if (affix.RemovedIn != null) return false;
    const gearArray = affix[gearKey];
    const items = gearArray?.__array || gearArray || [];
    return Array.isArray(items) && items.includes(gearName);
  });
  
  if (applicableAffixes.length === 0) {
    affixContainer.innerHTML = `<p>${Settings.t('noAffixes')(gearName)}</p>`;
    return;
  }
  
  const byRarity = { 'Common': [], 'Uncommon': [], 'Rare': [] };
  applicableAffixes.forEach(([affixKey, affix]) => {
    const rarity = affix.Rarity || 'Common';
    byRarity[rarity]?.push({ key: affixKey, shortName: affix.ShortName || affixKey, description: affix.Description || '', rarity });
  });
  
  const combinedAffixes = [...(byRarity['Common'] || []), ...(byRarity['Uncommon'] || [])];
  const rareCount = byRarity['Rare']?.length || 0;
  
  let html = '<hr><div class="affix-list">';
  
  if (combinedAffixes.length > 0) {
    html += `<fieldset class="rarity-group common-uncommon"><legend>${Settings.t('commonLegend')} (${combinedAffixes.length})</legend>`;
    combinedAffixes.forEach(simplified => {
      const original = affixesData[simplified.key];
      let desc = original.Description || '';
      const customValueKey = currentGearType === 'weapon' ? 'CustomValueW' : 'CustomValueT';
      const gearArrayKey = currentGearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
      const gearArray = original[gearArrayKey];
      const items = gearArray?.__array || gearArray || [];
      const gearIndex = items.indexOf(gearName);
      
      if (gearIndex >= 0) {
        const customValue = original[customValueKey];
        const customValueArray = customValue?.__array || customValue || [];
        if (customValueArray[gearIndex] !== undefined) {
          const locale = Settings.getLang() === 'fr' ? 'fr-FR' : 'en-US';
          desc = desc.replace(/''x''/g, customValueArray[gearIndex].toLocaleString(locale));
        }
      }
      
      html += `
        <label class="affix-label">
          <input type="checkbox" class="affix-checkbox" value="${simplified.key}" data-rarity="${simplified.rarity}">
          <span>${cleanWikiText(desc, level)}</span>
        </label>`;
    });
    html += '</fieldset>';
  }
  
  if (rareCount > 0) {
    html += `<fieldset class="rarity-group rare"><legend>${Settings.t('rareLegend')} (${rareCount})</legend>`;
    (byRarity['Rare'] || []).forEach(simplified => {
      const original = affixesData[simplified.key];
      let desc = original.Description || '';
      const customValueKey = currentGearType === 'weapon' ? 'CustomValueW' : 'CustomValueT';
      const gearArrayKey = currentGearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
      const gearArray = original[gearArrayKey];
      const items = gearArray?.__array || gearArray || [];
      const gearIndex = items.indexOf(gearName);
      
      if (gearIndex >= 0) {
        const customValue = original[customValueKey];
        const customValueArray = customValue?.__array || customValue || [];
        if (customValueArray[gearIndex] !== undefined) {
          desc = desc.replace(/''x''/g, customValueArray[gearIndex]);
        }
      }
      
      html += `
        <label class="affix-label">
          <input type="checkbox" class="affix-checkbox" value="${simplified.key}" data-rarity="${simplified.rarity}">
          <span>${cleanWikiText(desc, level)}</span>
        </label>`;
    });
    html += '</fieldset>';
  }
  
  html += '</div>';
  affixContainer.innerHTML = html;
  
  if (currentUpgradeLevel === 0) {
    affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]').forEach(cb => {
      cb.disabled = true;
      cb.closest('.affix-label')?.classList.add('disabled');
    });
  }
  
  const checkboxes = affixContainer.querySelectorAll('.affix-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const targetCb = e.target;
      const checkedCount = affixContainer.querySelectorAll('.affix-checkbox:checked').length;
      const rareCheckedCount = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]:checked').length;
      
      if ((currentUpgradeLevel === 1 || currentUpgradeLevel === 2) && targetCb.dataset.rarity === 'Rare' && targetCb.checked) {
        const raresWithoutThis = affixContainer.querySelectorAll(`.affix-checkbox[data-rarity="Rare"]:checked:not([value="${targetCb.value}"])`).length;
        if (raresWithoutThis >= 1) {
          targetCb.checked = false;
          return;
        }
      }
      
      updateCheckboxStates(numSlots, currentUpgradeLevel);
    });
  });
  
  updateCheckboxStates(numSlots, currentUpgradeLevel);
}

// ===== PROBABILITY CALCULATION =====
function formatProbabilitySignificant(prob) {
  if (prob < 0) return 'Error (<0)';
  if (prob > 1) return 'Error (>1)';
  
  const percentage = prob * 100;
  let decimalPlaces;
  if (percentage >= 10) decimalPlaces = 1;
  else if (percentage >= 1) decimalPlaces = 2;
  else decimalPlaces = Math.max(0, Math.floor(-Math.log10(percentage)) + 3);
  
  const locale = Settings.getLang() === 'fr' ? 'fr-FR' : 'en-US';
  return percentage.toLocaleString(locale, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }) + '%';
}

function formatRerollsRaw(prob) {
  if (prob < 0) return 'Error (<0)';
  if (prob > 1) return 'Error (>1)';
  const locale = Settings.getLang() === 'fr' ? 'fr-FR' : 'en-US';
  return Math.round(1 / prob).toLocaleString(locale);
}

function calculateProbability() {
  const gearName = document.getElementById('gearSelect').value;
  const levelInput = document.getElementById('levelInput').value.trim();
  const affixContainer = document.getElementById('affixSelection');
  const resultValue = document.getElementById('resultValue');
  const resultRerolls = document.getElementById('resultRerolls');
  
  if (!gearName || !levelInput) {
    resultValue.textContent = '-';
    resultRerolls.textContent = '';
    return 0;
  }
  
  const level = parseInt(levelInput, 10);
  if (isNaN(level) || level < 1 || getAffixSlots(level) === 0) {
    resultValue.textContent = '-';
    resultRerolls.textContent = '';
    return 0;
  }
  
  const allCheckboxes = affixContainer.querySelectorAll('.affix-checkbox');
  if (allCheckboxes.length === 0) {
    resultValue.textContent = '-';
    resultRerolls.textContent = '';
    return 0;
  }
  
  const selectedCheckboxes = affixContainer.querySelectorAll('.affix-checkbox:checked');
  const slotsSelected = selectedCheckboxes.length;
  const slotsAvailable = getAffixSlots(level);
  
  if (slotsSelected === 0) {
    resultValue.textContent = '-';
    resultRerolls.textContent = '';
    return 0;
  }
  
  if (slotsSelected > slotsAvailable) {
    resultValue.textContent = 'Error';
    resultRerolls.textContent = '';
    return 0;
  }
  
  try {
    let NrAsked = 0, NuAsked = 0, NcAsked = 0;
    selectedCheckboxes.forEach(cb => {
      if (cb.dataset.rarity === 'Rare') NrAsked++;
      else if (cb.dataset.rarity === 'Uncommon') NuAsked++;
      else if (cb.dataset.rarity === 'Common') NcAsked++;
    });
    
    const Nr = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]').length;
    const Nu = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Uncommon"]').length;
    const Nc = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Common"]').length;
    
    const prob = ProbabilityCalculator.calculateProbabilities(
      Nr, Nu, Nc, currentUpgradeLevel, slotsAvailable, slotsSelected, NrAsked, NuAsked, NcAsked
    );

    resultValue.textContent = formatProbabilitySignificant(prob);
    resultRerolls.textContent = prob > 0
      ? `${Settings.t('rerollsPrefix')}${formatRerollsRaw(prob)}${Settings.t('rerollsSuffix')}`
      : '';
    return prob;
  } catch (error) {
    resultValue.textContent = 'Error (it somehow failed)';
    return 0;
  }
}

// ===== UPGRADE BOXES =====
function initializeUpgradeBoxes() {
  const upgradeSelection = document.getElementById('upgradeSelection');
  if (!upgradeSelection) return;
  
  const upgrades = [
    { name: Settings.t('upgradeNone'), icon: null },
    { name: '', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_I_Upgrade_Icon.png?63b43a=&format=original' },
    { name: '', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_II_Upgrade_Icon.png?1b9389=&format=original' },
    { name: '', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_III_Upgrade_Icon.png?72a677=&format=original' }
  ];
  
  let upgradeHtml = '<div class="upgrade-selection">';
  upgrades.forEach((upgrade, index) => {
    upgradeHtml += `
      <div class="upgrade-box ${index === 3 ? 'selected' : ''} ${upgrade.icon ? 'has-icon' : ''}" 
           data-upgrade="${index}" tabindex="0" role="button">
        ${upgrade.icon ? `<img src="${upgrade.icon}" alt="">` : ''}
        <span class="upgrade-box-name">${upgrade.name}</span>
      </div>`;
  });
  upgradeHtml += '</div>';
  upgradeSelection.innerHTML = upgradeHtml;
  
  document.querySelectorAll('.upgrade-box').forEach(box => {
    box.addEventListener('click', () => selectUpgradeBox(parseInt(box.dataset.upgrade)));
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectUpgradeBox(parseInt(box.dataset.upgrade));
      }
    });
  });
}

function selectUpgradeBox(index) {
  currentUpgradeLevel = index;
  
  document.querySelectorAll('.upgrade-box').forEach((box, i) => {
    if (i === index) {
      box.classList.add('selected');
      box.setAttribute('aria-pressed', 'true');
    } else {
      box.classList.remove('selected');
      box.setAttribute('aria-pressed', 'false');
    }
  });
  
  updateAffixDisplay();
  document.getElementById('result').innerHTML = '';
}
