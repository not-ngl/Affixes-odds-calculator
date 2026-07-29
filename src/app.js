// Theme Toggle Functionality
(function() {
    const STORAGE_KEY = 'windblownCalculatorTheme';
    const defaultTheme = 'view-dark';
    
    function getCurrentTheme() {
        return document.documentElement.classList.contains('view-light') ? 'light' : 'dark';
    }
    
    function setTheme(theme) {
        const html = document.documentElement;
        html.classList.remove('view-dark', 'view-light');
        html.classList.add(theme === 'light' ? 'view-light' : 'view-dark');
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleButton(theme);
    }
    
    function updateToggleButton(theme) {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        
        const label = btn.querySelector('.theme-label');
        
        if (theme === 'light') {
            label.textContent = 'Switch to Dark';
        } else {
            label.textContent = 'Switch to Light';
        }
    }
    
    function initTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }
    
    // Initialize on page load
    initTheme();
    
    // Event listener for toggle button
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const currentTheme = getCurrentTheme();
                setTheme(currentTheme === 'light' ? 'dark' : 'light');
            });
        }
    });
})();

let weaponsData = {};
let affixesData = {};
let trinketsData = {};

// Global state variables
let currentGearType = 'weapon'; // Default
let currentUpgradeLevel = 3; // Default

// Calculate affix slots based on level
function getAffixSlots(level) {
  const lvl = parseInt(level, 10);
  if (isNaN(lvl) || lvl < 1) return 0;
  if (lvl <= 2) return 0;
  if (lvl <= 4) return 1;
  if (lvl <= 7) return 2;
  if (lvl <= 10) return 3;
  return 4; // level 11+
}

function parseCustomTooltip(baseValue, tooltipText, currentLevel) {
  const levelMatch = tooltipText.match(/Past Level (\d+)/);
  if (!levelMatch) return baseValue;

  const thresholdLevel = parseInt(levelMatch[1]);
  const incrementMatch = tooltipText.match(/([\+\-]\d+)/);
  if (!incrementMatch) return baseValue;

  const perLevelIncrement = parseInt(incrementMatch[1]);
  const baseNumMatch = baseValue.match(/([\+\-]?\d+)/);
  if (!baseNumMatch) return baseValue;

  const baseNum = parseInt(baseNumMatch[1]);

  if (currentLevel > thresholdLevel) {
    const additionalValue = (currentLevel - thresholdLevel) * perLevelIncrement;
    const total = baseNum + additionalValue;
    const sign = total >= 0 ? '+' : '';
    const suffix = baseValue.replace(/[\+\-]?\d+/g, '');
    return sign + total + suffix;
  }

  return baseValue;
}

function cleanWikiText(text, currentLevel) {
  text = text.replace(/\{\{CustomTooltip\|([^|]+)\|([^}]+)\}\}/g, (match, baseValue, tooltipText) => {
    return parseCustomTooltip(baseValue, tooltipText, currentLevel);
  });
  
  text = text.replace(/\{\{[^|]+\|([^|}\n]+)(?:\|[^}]*)?\}\}/g, '$1');
  
  return text;
}

// Load JSON data
async function loadData() {
  try {
    console.log('Attempting to load JSON files...');
    
    const weaponsResponse = await fetch('./data/weapons.json');
    console.log('Weapons fetch status:', weaponsResponse.status);
    if (!weaponsResponse.ok) throw new Error(`Weapons.json failed: ${weaponsResponse.status}`);
    
    const trinketsResponse = await fetch('./data/trinkets.json');
    console.log('Trinkets fetch status:', trinketsResponse.status);
    if (!trinketsResponse.ok) throw new Error(`Trinkets.json failed: ${trinketsResponse.status}`);
    
    const affixesResponse = await fetch('./data/affixes.json');
    console.log('Affixes fetch status:', affixesResponse.status);
    if (!affixesResponse.ok) throw new Error(`Affixes.json failed: ${affixesResponse.status}`);
    
    const weaponsRaw = await weaponsResponse.json();
    const affixesRaw = await affixesResponse.json();
    const trinketsRaw = await trinketsResponse.json();
    
    weaponsData = weaponsRaw.Weapons || {};
    affixesData = affixesRaw.Affixes || {};
    trinketsData = trinketsRaw.Trinkets || {};
    
    console.log('Data loaded successfully:', { 
      weaponsCount: Object.keys(weaponsData).length, 
      affixesCount: Object.keys(affixesData).length,
      trinketsCount: Object.keys(trinketsData).length
    });
    
    setupEventListeners();
    initializeUpgradeBoxes();
    initializeGearTypeBoxes();
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('result').innerHTML = `<p class="error">Failed to load data files: ${error.message}</p>`;
  }
}

function setupEventListeners() {
  // Old dropdown is hidden but we need to listen for changes if it exists
  const gearTypeSelect = document.getElementById('gearTypeSelect');
  if (gearTypeSelect) {
    gearTypeSelect.addEventListener('change', () => {
      onGearTypeChange();
      calculateProbability();
    });
  }

  // Custom gear selector button
  const gearSelectButton = document.getElementById('gearSelectButton');
  if (gearSelectButton) {
    gearSelectButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = gearSelectButton.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        hideGearDropdown();
      } else {
        showGearDropdown();
      }
    });
    
    // Keyboard support
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
  
  // Click outside to close dropdown
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
    levelInput.addEventListener('change', () => {
      updateAffixDisplay();
      calculateProbability();
    });
  }

  document.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('affix-checkbox')) {
      calculateProbability();
    }
  });
  
  // Listen for upgrade box clicks via delegation
  document.addEventListener('click', (e) => {
    if (e.target.closest('.upgrade-box')) {
      setTimeout(() => calculateProbability(), 50);
    }
  });
}

// ===== GEAR TYPE BOXES INITIALIZATION =====
function initializeGearTypeBoxes() {
  const gearTypeSelection = document.getElementById('gearTypeSelection');
  
  if (!gearTypeSelection) {
    console.error('gearTypeSelection element not found!');
    return;
  }
  
  // Check if data is loaded
  if (!weaponsData || !trinketsData) {
    console.error('Gear data not loaded yet!');
    return;
  }
  
  const gearTypes = [
    { 
      name: 'Weapon', 
      icon: 'https://windblown.wiki.gg/images/Weapons_Icon.png?format=original',
      value: 'weapon' 
    },
    { 
      name: 'Trinket', 
      icon: 'https://windblown.wiki.gg/images/Trinkets_Icon.png?format=original',
      value: 'trinket' 
    }
  ];
  
  gearTypeSelection.innerHTML = '';
  
  gearTypes.forEach((gearType, index) => {
    const isSelected = index === 0 ? 'selected' : '';
    
    const box = document.createElement('div');
    box.className = `gear-type-box ${isSelected}`;
    box.dataset.gearType = gearType.value;
    box.tabIndex = 0;
    box.role = 'button';
    box.setAttribute('aria-label', gearType.name);
    box.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    
    const img = document.createElement('img');
    img.src = gearType.icon;
    img.alt = gearType.name;

    img.classList.add('invert-on-light');
    
    const span = document.createElement('span');
    span.className = 'gear-type-box-name';
    span.textContent = gearType.name;
    
    box.appendChild(img);
    box.appendChild(span);
    gearTypeSelection.appendChild(box);
    
    box.addEventListener('click', () => {
      currentGearType = gearType.value;
      selectGearTypeBox(gearType.value);
    });
    
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        currentGearType = gearType.value;
        selectGearTypeBox(gearType.value);
      }
    });
  });
  
  // Populate initial gear dropdown
  populateGearDropdown(currentGearType);
}

function selectGearTypeBox(type) {
  const gearTypeBoxes = document.querySelectorAll('.gear-type-box');
  
  gearTypeBoxes.forEach(box => {
    if (box.dataset.gearType === type) {
      box.classList.add('selected');
      box.setAttribute('aria-pressed', 'true');
    } else {
      box.classList.remove('selected');
      box.setAttribute('aria-pressed', 'false');
    }
  });
  
  // Update hidden dropdown to match
  const gearTypeSelect = document.getElementById('gearTypeSelect');
  if (gearTypeSelect) {
    gearTypeSelect.value = type;
  }
  
  populateGearDropdown(type);
  
  // Reset level and affixes
  document.getElementById('affixSelection').innerHTML = '';
  document.getElementById('levelNote').textContent = '';
  document.getElementById('result').innerHTML = '';
  
  console.log(`Gear type changed to: ${type}`);
}

function populateGearDropdown(gearType) {
  const gearSelectButton = document.getElementById('gearSelectButton');
  const gearSelectDropdown = document.getElementById('gearSelectDropdown');
  const gearSelectHidden = document.getElementById('gearSelect');

  if (!gearSelectButton || !gearSelectDropdown || !gearSelectHidden) return;

  // Clear existing options
  gearSelectDropdown.innerHTML = '';

  let gearData;
  if (gearType === 'weapon') {
    gearData = weaponsData;
  } else if (gearType === 'trinket') {
    gearData = trinketsData;
  }

  if (!gearData || typeof gearData !== 'object') {
    console.log(`No ${gearType} data available`);
    return;
  }

  const gearNames = Object.keys(gearData).sort();
  console.log(`Populated ${gearNames.length} ${gearType}s`);

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
    option.setAttribute('role', 'option');
    option.dataset.gearValue = name;
    option.setAttribute('aria-selected', 'false');

    if (iconUrl) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'option-icon';
      const img = document.createElement('img');
      img.src = iconUrl;
      img.alt = name;
      iconSpan.appendChild(img);
      option.appendChild(iconSpan);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'option-name';
    nameSpan.textContent = name;
    option.appendChild(nameSpan);

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
  const gearOptions = document.querySelectorAll('.gear-option');

  // Update hidden input for compatibility
  if (gearSelectHidden) {
    gearSelectHidden.value = value;
  }

  // Update button display
  if (gearSelectLabel) {
    gearSelectLabel.textContent = label;
  }

  // Update icon display
  if (gearSelectIcon) {
    if (iconUrl) {
      gearSelectIcon.innerHTML = `<img src="${iconUrl}" alt="${label}">`;
      gearSelectIcon.classList.add('has-icon');
    } else {
      gearSelectIcon.innerHTML = '';
      gearSelectIcon.classList.remove('has-icon');
    }
  }

  // Update selected state of options
  gearOptions.forEach(opt => {
    if (opt.dataset.gearValue === value) {
      opt.classList.add('selected');
      opt.setAttribute('aria-selected', 'true');
    } else {
      opt.classList.remove('selected');
      opt.setAttribute('aria-selected', 'false');
    }
  });

  // Close dropdown
  hideGearDropdown();

  // Trigger existing handlers
  if (triggerCalculation) {
    onGearChange();
    calculateProbability();
  }

  console.log(`Selected gear: ${value}`);
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

// When gear type changes (for hidden dropdown compatibility)
function onGearTypeChange() {
  const gearType = document.getElementById('gearTypeSelect').value;
  currentGearType = gearType; // Sync global state
  selectGearTypeBox(gearType);
}

// When gear is selected
function onGearChange() {
  updateAffixDisplay();
  document.getElementById('result').innerHTML = '';
}

// When level is entered
function onLevelChange() {
  updateAffixDisplay();
  document.getElementById('result').innerHTML = '';
}

// Helper function to update checkbox states based on slots and upgrade level
function updateCheckboxStates(numSlots, upgradeLevel) {
  const affixContainer = document.getElementById('affixSelection');
  const allCheckboxes = affixContainer.querySelectorAll('.affix-checkbox');
  const rareCheckboxes = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]');
  
  const totalChecked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
  const rareChecked = Array.from(rareCheckboxes).filter(cb => cb.checked).length;
  
  // Determine if rare affixes are restricted by upgrade level
  const rareRestriction = (upgradeLevel === 1 || upgradeLevel === 2) && rareChecked >= 1;
  const upgradeZero = (upgradeLevel === 0);
  
  allCheckboxes.forEach(cb => {
    const label = cb.closest('.affix-label');
    let shouldDisable = false;
    
    // If upgrade is 0, disable ALL rare affixes
    if (upgradeZero && cb.dataset.rarity === 'Rare') {
      shouldDisable = true;
    }
    // If total slots exceeded, disable unchecked boxes
    else if (totalChecked >= numSlots && !cb.checked) {
      shouldDisable = true;
    }
    // If rare restriction applies (upgrade 1-2) and this is an unchecked rare
    else if (rareRestriction && cb.dataset.rarity === 'Rare' && !cb.checked) {
      shouldDisable = true;
    }
    
    cb.disabled = shouldDisable;
    if (label) {
      label.classList.toggle('disabled', shouldDisable);
    }
  });
}

// Update affix display based on current selections
function updateAffixDisplay() {
  const gearType = currentGearType; // Use global state
  const gearName = document.getElementById('gearSelect').value;
  const levelInput = document.getElementById('levelInput').value.trim();
  const affixContainer = document.getElementById('affixSelection');
  const affixNote = document.getElementById('affixNote');
  const levelNote = document.getElementById('levelNote');
  
  const level = parseInt(levelInput, 10);
  if (isNaN(level) || level < 1) {
    affixContainer.innerHTML = '';
    levelNote.textContent = '';
    return;
  }
  
  const numSlots = getAffixSlots(level);
  levelNote.textContent = ''; //`thus ${numSlots} affix slot${numSlots > 1 ? 's' : ''}`;
  
  if (numSlots === 0) {
    affixContainer.innerHTML = `<hr>Level ${level} has no affix slots.`;
    affixNote.textContent = '';
    return;
  }
  
  if (!gearType || !gearName || !levelInput) {
    affixContainer.innerHTML = '<hr>';
    affixNote.textContent = 'Enter a level to see available affixes.';
    affixNote.textContent = `${numSlots} affix slot${numSlots > 1 ? 's' : ''} available. ${applicableAffixes.length} affixes to choose from.`;
    levelNote.textContent = '';
    return;
  }
  
  const gearKey = gearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
  
  const applicableAffixes = Object.entries(affixesData).filter(([_, affix]) => {
    if (affix.RemovedIn != null && affix.RemovedIn !== undefined) {
      console.log(`Skipping removed affix: ${_[1]}`);
      return false;
    }

    const gearArray = affix[gearKey];
    if (!gearArray) return false;
    const items = gearArray.__array || gearArray;
    return Array.isArray(items) && items.includes(gearName);
  });
  
  console.log(`Level ${level}: ${numSlots} slot(s), ${applicableAffixes.length} affixes for ${gearName}`);
  
  if (applicableAffixes.length === 0) {
    affixContainer.innerHTML = `<p>No affixes available for ${gearName}.</p>`;
    affixNote.textContent = '';
    return;
  }
  
  const byRarity = { 'Common': [], 'Uncommon': [], 'Rare': [] };
  applicableAffixes.forEach(([affixKey, affix]) => {
    const rarity = affix.Rarity || 'Common';
    if (!byRarity[rarity]) byRarity[rarity] = [];
    byRarity[rarity].push({
      key: affixKey,
      shortName: affix.ShortName || affixKey,
      description: affix.Description || '',
      rarity: rarity
    });
  });
  
  console.log(`Level ${level}: ${numSlots} slot(s), ${applicableAffixes.length} affixes for ${gearName}`);
  
  if (applicableAffixes.length === 0) {
    affixContainer.innerHTML = `<p>No affixes available for ${gearName}.</p>`;
    affixNote.textContent = '';
    return;
  }
  
  let html = '<hr><div class="affix-list">';
  
  // Group 
  const commonCount = byRarity['Common']?.length || 0;
  const uncommonCount = byRarity['Uncommon']?.length || 0;
  const rareCount = byRarity['Rare']?.length || 0;
  
  // Display Common + Uncommon together
  if (commonCount + uncommonCount > 0) {
    const combinedAffixes = [...(byRarity['Common'] || []), ...(byRarity['Uncommon'] || [])];
    
    html += `<fieldset class="rarity-group common-uncommon">
      <legend>Common (${combinedAffixes.length})</legend>`;

    combinedAffixes.forEach(simplifiedAffix => {
      const originalAffix = affixesData[simplifiedAffix.key];
      let description = originalAffix.Description || '';
      
      const customValueKey = gearType === 'weapon' ? 'CustomValueW' : 'CustomValueT';
      const gearArrayKey = gearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
    
      const gearArray = originalAffix[gearArrayKey];
      const items = gearArray?.__array || gearArray || [];
      const gearIndex = items.indexOf(gearName);
    
      if (gearIndex >= 0) {
        const customValue = originalAffix[customValueKey];
        const customValueArray = customValue?.__array || customValue || [];
        if (customValueArray[gearIndex] !== undefined && customValueArray[gearIndex] !== null) {
          description = description.replace(/''x''/g, customValueArray[gearIndex]);
        }
      }
    
      const cleanDescription = cleanWikiText(description, level);
    
      html += `
        <label class="affix-label">
          <input type="checkbox" class="affix-checkbox" 
            value="${simplifiedAffix.key}" 
            data-rarity="${simplifiedAffix.rarity}">
          <span>${cleanDescription}</span>
        </label>`;
    });

    html += '</fieldset>';
  }
  
  // Display Rare 
  if (rareCount > 0) {
    html += `<fieldset class="rarity-group rare">
      <legend>Rare (${rareCount})</legend>`;

    byRarity['Rare'].forEach(simplifiedAffix => {
      const originalAffix = affixesData[simplifiedAffix.key];
      let description = originalAffix.Description || '';
      
      const customValueKey = gearType === 'weapon' ? 'CustomValueW' : 'CustomValueT';
      const gearArrayKey = gearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
    
      const gearArray = originalAffix[gearArrayKey];
      const items = gearArray?.__array || gearArray || [];
      const gearIndex = items.indexOf(gearName);
    
      if (gearIndex >= 0) {
        const customValue = originalAffix[customValueKey];
        const customValueArray = customValue?.__array || customValue || [];
        if (customValueArray[gearIndex] !== undefined && customValueArray[gearIndex] !== null) {
          description = description.replace(/''x''/g, customValueArray[gearIndex]);
        }
      }
    
      const cleanDescription = cleanWikiText(description, level);
    
      html += `
        <label class="affix-label">
          <input type="checkbox" class="affix-checkbox" 
            value="${simplifiedAffix.key}" 
            data-rarity="${simplifiedAffix.rarity}">
          <span>${cleanDescription}</span>
        </label>`;
    });

    html += '</fieldset>';
  }
  
  html += '</div>';
  affixContainer.innerHTML = html;
  
  // Add change listeners to all checkboxes
  const checkboxes = affixContainer.querySelectorAll('.affix-checkbox');
  
  // FIRST: Disable all rare affixes if upgrade level is 0
  if (currentUpgradeLevel === 0) {
    const rareCheckboxes = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]');
    rareCheckboxes.forEach(cb => {
      cb.disabled = true;
      const label = cb.closest('.affix-label');
      if (label) label.classList.add('disabled');
    });
  }
  
  // THEN: Apply slot and rare limit logic on each checkbox change
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const targetCb = e.target;
      const checkedCount = affixContainer.querySelectorAll('.affix-checkbox:checked').length;
      const rareCheckedCount = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]:checked').length;
      
      // If we're at upgrade 1-2 and a rare was just checked, prevent it if another rare is already selected
      if ((currentUpgradeLevel === 1 || currentUpgradeLevel === 2) && 
          targetCb.dataset.rarity === 'Rare' && 
          targetCb.checked) {
        // Count rares EXCLUDING the one we're trying to check
        const raresWithoutThisOne = affixContainer.querySelectorAll(`.affix-checkbox[data-rarity="Rare"]:checked:not([value="${targetCb.value}"])`).length;
        
        if (raresWithoutThisOne >= 1) {
          // Already have a rare selected, reject this one
          targetCb.checked = false;
          return;
        }
      }
      
      // Now apply slot and remaining rare restrictions to ALL checkboxes
      checkboxes.forEach(cb => {
        const label = cb.closest('.affix-label');
        let shouldDisable = false;
        
        // Upgrade 0 blocks all rares
        if (currentUpgradeLevel === 0 && cb.dataset.rarity === 'Rare') {
          shouldDisable = true;
        }
        // Total slots exceeded (unchanged from original)
        else if (!cb.checked && checkedCount >= numSlots) {
          shouldDisable = true;
        }
        // For upgrade 1-2, disable unchecked rares if one is already selected
        else if ((currentUpgradeLevel === 1 || currentUpgradeLevel === 2) && 
                 cb.dataset.rarity === 'Rare' && 
                 rareCheckedCount >= 1 && 
                 !cb.checked) {
          shouldDisable = true;
        }
        
        cb.disabled = shouldDisable;
        if (label) {
          label.classList.toggle('disabled', shouldDisable);
        }
      });
    });
  });
  
  // Apply initial state based on upgrade level and slots
  updateCheckboxStates(numSlots, currentUpgradeLevel);
  
}

// ===== PROBABILTY CALCULATION =====
function formatProbabilitySignificant(prob) {
  if (prob <= 0) return '0.00%';
  if (prob >= 1) return '100%';
  
  const percentage = prob * 100;
  
  // Ensures 2 significant figures after first non-zero digit
  let decimalPlaces;
  if (percentage >= 10) {
    decimalPlaces = 2;
  } else if (percentage >= 1) {
    decimalPlaces = 2;
  } else {
    // For small percentages, calculate dynamically
    const order = Math.floor(-Math.log10(percentage));
    decimalPlaces = order + 2;
  }
  
  decimalPlaces = Math.max(0, decimalPlaces);
  
  // Ensure we don't exceed reasonable precision
  decimalPlaces = Math.min(decimalPlaces, 6);
  
  return percentage.toFixed(decimalPlaces) + '%';
}

function formatRerollsRaw(prob) {
  if (prob <= 0) return 'Infinity';
  if (prob >= 1) return '1';
  
  const rerolls = 1 / prob;
  return Math.round(rerolls).toLocaleString('en-US');
}

function calculateProbability() {
  const gearName = document.getElementById('gearSelect').value;
  const levelInput = document.getElementById('levelInput').value.trim();
  const affixContainer = document.getElementById('affixSelection');
  const resultValue = document.getElementById('resultValue');
  const resultRerolls = document.getElementById('resultRerolls');
  
  // Set placeholder if no valid input
  if (!gearName || !levelInput) {
    resultValue.textContent = '-';
    resultRerolls.textContent = '';
    return 0;
  }
  
  const level = parseInt(levelInput, 10);
  if (isNaN(level) || level < 1) {
    resultValue.textContent = '-';
    resultRerolls.textContent = '';
    return 0;
  }
  
  const slotsAvailable = getAffixSlots(level);
  if (slotsAvailable === 0) {
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
  
  const rareCheckboxes = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Rare"]');
  const uncommonCheckboxes = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Uncommon"]');
  const commonCheckboxes = affixContainer.querySelectorAll('.affix-checkbox[data-rarity="Common"]');
  
  const Nr = rareCheckboxes.length;
  const Nu = uncommonCheckboxes.length;
  const Nc = commonCheckboxes.length;
  
  const selectedCheckboxes = affixContainer.querySelectorAll('.affix-checkbox:checked');
  const slotsSelected = selectedCheckboxes.length;
  
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
    // Count by rarity
    let NrAsked = 0, NuAsked = 0, NcAsked = 0;
    selectedCheckboxes.forEach(cb => {
      if (cb.dataset.rarity === 'Rare') NrAsked++;
      else if (cb.dataset.rarity === 'Uncommon') NuAsked++;
      else if (cb.dataset.rarity === 'Common') NcAsked++;
    });
    
    const prob = ProbabilityCalculator.calculateProbabilities(
      Nr, Nu, Nc,
      currentUpgradeLevel,
      slotsAvailable, slotsSelected,
      NrAsked, NuAsked, NcAsked
    );

    const formattedPercentage = formatProbabilitySignificant(prob);
    const formattedRerolls = formatRerollsRaw(prob);
    
    const percentage = (prob * 100).toFixed(2);
    const rerolls = prob > 0 ? Math.round(1 / prob) : Infinity;
    
    resultValue.textContent = formattedPercentage;
    resultRerolls.textContent = prob > 0 ? `(1 in ${formattedRerolls} rerolls)` : '';
    return prob;
    
  } catch (error) {
    console.error('Calculation error:', error);
    resultValue.textContent = '4 affixes not computed (yet)';
    resultRerolls.textContent = '';
    return 0;
  }
}

// ===== UPGRADE BOXES INITIALIZATION =====
function initializeUpgradeBoxes() {
  const upgradeSelection = document.getElementById('upgradeSelection');
  
  if (!upgradeSelection) {
    console.error('upgradeSelection element not found!');
    return;
  }
  
  const upgrades = [
    { name: 'None', icon: null },
    { name: '', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_I_Upgrade_Icon.png?63b43a=&format=original' },
    { name: '', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_II_Upgrade_Icon.png?1b9389=&format=original' },
    { name: '', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_III_Upgrade_Icon.png?72a677=&format=original' }
  ];
  
  let upgradeHtml = '<div class="upgrade-selection">';
  upgrades.forEach((upgrade, index) => {
    upgradeHtml += `
      <div class="upgrade-box ${index === 3 ? 'selected' : ''} ${upgrade.icon ? 'has-icon' : ''}" 
           data-upgrade="${index}" 
           tabindex="0"
           role="button"
           aria-label="${upgrade.name}">
        ${upgrade.icon ? `<img src="${upgrade.icon}" alt="${upgrade.name}">` : ''}
        <span class="upgrade-box-name">${upgrade.name}</span>
      </div>
    `;
  });
  upgradeHtml += '</div>';
  upgradeSelection.innerHTML = upgradeHtml;
  
  const upgradeBoxes = upgradeSelection.querySelectorAll('.upgrade-box');
  upgradeBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const selectedIndex = parseInt(box.dataset.upgrade, 10);
      currentUpgradeLevel = selectedIndex;
      selectUpgradeBox(selectedIndex);
    });
    
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const selectedIndex = parseInt(box.dataset.upgrade, 10);
        currentUpgradeLevel = selectedIndex;
        selectUpgradeBox(selectedIndex);
      }
    });
  });
  
  console.log('Upgrade boxes initialized, default: level 3');
}

function selectUpgradeBox(index) {
  const upgradeBoxes = document.querySelectorAll('.upgrade-box');
  
  upgradeBoxes.forEach((box, i) => {
    if (i === index) {
      box.classList.add('selected');
      box.setAttribute('aria-pressed', 'true');
    } else {
      box.classList.remove('selected');
      box.setAttribute('aria-pressed', 'false');
    }
  });
  
  console.log(`Selected upgrade: level ${index}`);
  
  // Refresh affix display to apply new restrictions
  updateAffixDisplay();
  document.getElementById('result').innerHTML = '';
  
  if (typeof onUpgradeChange === 'function') {
    onUpgradeChange(index);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadData);
