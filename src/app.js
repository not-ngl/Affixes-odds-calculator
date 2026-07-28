let weaponsData = {};
let affixesData = {};
let trinketsData = {};

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

  const thresholdLevel = parseInt(levelMatch[1]); // normally 3

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
  // Handle CustomTooltip first (special case)
  text = text.replace(/\{\{CustomTooltip\|([^|]+)\|([^}]+)\}\}/g, (match, baseValue, tooltipText) => {
    return parseCustomTooltip(baseValue, tooltipText, currentLevel);
  });
  
  // Then handle other templates: {{templateName|DisplayText}}
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
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('result').innerHTML = `<p class="error">Failed to load data files: ${error.message}</p>`;
  }
}

function setupEventListeners() {
  document.getElementById('gearTypeSelect').addEventListener('change', onGearTypeChange);
  document.getElementById('gearSelect').addEventListener('change', onGearChange);
  document.getElementById('levelInput').addEventListener('input', onLevelChange);
  document.getElementById('levelInput').addEventListener('change', updateAffixDisplay);
  document.getElementById('levelInput').addEventListener('input', updateAffixDisplay);
}

// When gear type changes (Weapon vs Trinket)
function onGearTypeChange() {
  const gearType = document.getElementById('gearTypeSelect').value;
  const gearSelect = document.getElementById('gearSelect');
  
  gearSelect.innerHTML = '<option value="">-- Select Gear --</option>';
  
  if (gearType === 'weapon') {
    const weaponNames = Object.keys(weaponsData).sort();
    weaponNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      gearSelect.appendChild(option);
    });
  } else if (gearType === 'trinket') {
    const trinketNames = Object.keys(trinketsData).sort();
    trinketNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      gearSelect.appendChild(option);
    });
  }
  
  // Reset level and affixes
  document.getElementById('levelInput').value = '';
  document.getElementById('affixSelection').innerHTML = '';
}

// When gear is selected
function onGearChange() {
  updateAffixDisplay();
}

// When level is entered
function onLevelChange() {
  updateAffixDisplay();
}

// Update affix display based on current selections
function updateAffixDisplay() {
  const gearType = document.getElementById('gearTypeSelect').value;
  const gearName = document.getElementById('gearSelect').value;
  const levelInput = document.getElementById('levelInput').value.trim();
  const affixContainer = document.getElementById('affixSelection');
  const affixNote = document.getElementById('affixNote');
  const levelNote = document.getElementById('levelNote');
  
  // Check if we have all required selections
  if (!gearType || !gearName || !levelInput) {
    affixContainer.innerHTML = '';
    affixNote.textContent = 'Enter a level to see available affixes.';
    levelNote.textContent = '';
    return;
  }
  
  const level = parseInt(levelInput, 10);
  if (isNaN(level) || level < 1) {
    affixContainer.innerHTML = '<p class="error">Invalid level. Enter a positive number.</p>';
    affixNote.textContent = '';
    levelNote.textContent = '';
    return;
  }
  
  const numSlots = getAffixSlots(level);
  levelNote.textContent = `thus ${numSlots} affix slot`;
  if (numSlots > 1) {
	  levelNote.textContent += 's';
  }
  
  if (numSlots === 0) {
    affixContainer.innerHTML = `<p>Level ${level} has no affix slots.</p>`;
    affixNote.textContent = '';
    return;
  }
  
  // Find affixes applicable to this gear
  const gearKey = gearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
  
  const applicableAffixes = Object.entries(affixesData).filter(([_, affix]) => {
    const gearArray = affix[gearKey];
    if (!gearArray) return false;
    
    // Handle both __array notation and plain arrays
    const items = gearArray.__array || gearArray;
    return Array.isArray(items) && items.includes(gearName);
  });
  
  console.log(`Level ${level}: ${numSlots} slot(s), ${applicableAffixes.length} affixes for ${gearName}`);
  
  if (applicableAffixes.length === 0) {
    affixContainer.innerHTML = `<p>No affixes available for ${gearName}.</p>`;
    affixNote.textContent = '';
    return;
  }
  
  // Group by rarity
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
  
  // Build checkbox list grouped by rarity
  let html = '<div class="affix-list">';
  
  ['Common', 'Uncommon', 'Rare'].forEach(rarity => {
    if (byRarity[rarity].length > 0) {
      html += `<fieldset class="rarity-group ${rarity.toLowerCase()}">
        <legend>${rarity} (${byRarity[rarity].length})</legend>`;

      byRarity[rarity].forEach(simplifiedAffix => {
        const originalAffix = affixesData[simplifiedAffix.key];  // Get the full affix object
        let description = originalAffix.Description || '';
        
        const customValueKey = gearType === 'weapon' ? 'CustomValueW' : 'CustomValueT';
        const gearArrayKey = gearType === 'weapon' ? 'GearWeapon' : 'GearTrinket';
      
        const gearArray = originalAffix[gearArrayKey];  // Now it has the data
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
  });
  
  html += '</div>';
  
  affixContainer.innerHTML = html;
  
  // checkbox enforcement code 
  const checkboxes = affixContainer.querySelectorAll('.affix-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checkedCount = affixContainer.querySelectorAll('.affix-checkbox:checked').length;
    
      checkboxes.forEach(cb => {
        const label = cb.closest('.affix-label');
        if (!cb.checked && checkedCount >= numSlots) {
          cb.disabled = true;
          label.classList.add('disabled');
        } else {
          cb.disabled = false;
          label.classList.remove('disabled');
        }
      });
    });
  });
  
  // Build note
  let noteText = '';
  if (numSlots > 1) {
    noteText += `${numSlots} affix slot available. ${applicableAffixes.length} affixes to choose from.`;
  } else {
    noteText += `${numSlots} affix slots available. ${applicableAffixes.length} affixes to choose from.`;
  }
  
  affixNote.textContent = noteText;
}

const rareUpgradeSlider = document.getElementById('rareUpgradeLevel');
const upgradeDisplay = document.getElementById('upgradeDisplay');

const upgrades = [
  { name: 'No upgrades', icon: null },
  { name: 'Rare Affixes I', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_I_Upgrade_Icon.png?63b43a=&format=original' },
  { name: 'Rare Affixes II', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_II_Upgrade_Icon.png?1b9389=&format=original' },
  { name: 'Rare Affixes III', icon: 'https://windblown.wiki.gg/images/Rare_Affixes_III_Upgrade_Icon.png?72a677=&format=original' }
];

rareUpgradeSlider.addEventListener('input', () => {
  const level = parseInt(rareUpgradeSlider.value);
  const upgrade = upgrades[level];
  upgradeDisplay.innerHTML = `
    ${upgrade.icon ? `<img src="${upgrade.icon}" alt="${upgrade.name}" style="height: 40px; margin-right: 10px;">` : ''}
    <span>${upgrade.name}</span>
  `;
});

// Initialize display
rareUpgradeSlider.dispatchEvent(new Event('input'));

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadData);
