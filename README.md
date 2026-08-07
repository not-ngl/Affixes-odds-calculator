# Windblown's Affix Calculator

A web UI for calculating affix combination probabilities for Windblown. Supports multiple languages (as long as the wiki modules exist, and an UI translation is provided)

## Live Demo

[Just here](https://not-ngl.github.io/Windblown-s-Affixes-Calculator/).

## Data Sources

All game data is fetched from the Windblown Wiki via MediaWiki API:

| Source | Wiki Page |
|--------|-----------|
| Weapons | [Module:Weapons/Data](https://windblown.wiki.gg/wiki/Module:Weapons/Data) |
| Trinkets | [Module:Trinkets/Data](https://windblown.wiki.gg/wiki/Module:Trinkets/Data) |
| Affixes | [Module:Affixes/Data](https://windblown.wiki.gg/wiki/Module:Affixes/Data) |

## Design & Assets

### Icons
All icons are served directly from the Windblown Wiki:

- Weapon Icons: [Category:Weapon Icon Images](https://windblown.wiki.gg/wiki/Category:Weapon_Icon_Images)
- Trinket Icons: [Category:Trinket Icon Images](https://windblown.wiki.gg/wiki/Category:Trinket_Icon_Images)
- Upgrade Icons: [Category:Upgrade Icon Images](https://windblown.wiki.gg/wiki/Category:Upgrade_Icon_Images)

### Styling
CSS variables and theme design copy-pasted from [Windblown Wiki Common.css](https://windblown.wiki.gg/wiki/MediaWiki:Common.css).

## Contributing

Feel free to submit issues or enhancement requests. If calculation results seem incorrect, check `src/probability.js` first: the formulas are documented there.
   
   To add a new language:
   1. Add translations to `UI_STRINGS` in `settings.js`
   2. Ensure corresponding wiki modules exist (e.g., `Module:Armes/Data` for French)
   3. Update `LANGUAGES` array in `scripts/fetch-wiki-data.js`
   4. Ensure good numbers formatting (e.g., `fr-FR` for French)

## How It Works

### Data Pipeline
- Game data syncs automatically from the Windblown Wiki via MediaWiki API every Sunday at 06:00 UTC
- Lua modules are fetched, parsed, and converted to JSON for client-side consumption
- All icons are hotlinked directly from the wiki

### Probability Engine
Calculations use combinatorial formulas that account for:
- Slot availability (based on gear level: 0–4 slots)
- Rarity tiers (Common, Uncommon, Rare with weighted pools)
- Upgrade mechanics (levels 0–3 with distinct p/q success rates)
  | Upgrade | p (Rare) | q (Common/Uncommon) | Max Rare |
  |---------|----------|---------------------|----------|
  | 0 | 0 | 1 | 0 |
  | 1 | 0.05 | 0.95 | 1 |
  | 2 | 0.10 | 0.90 | 1 |
  | 3 | 0.10 | 0.90 | 4 |

### Formula Complexity
Each formula handles a specific `(slots_available, slots_selected)` scenario. For example, `calc4_2` calculates the probability of getting 2 desired affixes when 4 slots are available. The computation branches recursively on each draw outcome until reaching base cases (`calc1_1`, etc.).

The code includes numerous conditional checks like `if (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p` because the success probability (p) depends on how many Rare affixes remain in the pool. Before attributing p/q values, several validations ensure we don't assign a Rare-success-rate when zero Rares exist. Similar logic applies for p1, p2, p3 (second, third, fourth Rare draws). This defensive programming makes the code harder to read but prevents invalid probability states.

### Input Validation
The UI prevents impossible selections before they reach the calculator:
- Affix count cannot exceed available slots (enforced in `updateCheckboxStates()`)
- Rare affix limit respected per upgrade tier (upgrade 1–2 allow max 1 Rare; upgrade 3 allows up to 4)
- Empty selections display '-' rather than triggering errors

## License

Calculator tool code: [MIT License](LICENSE)  
Game assets & icons: © Motion Twin  
Wiki data: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---

*This is an unofficial fan tool. Not affiliated with Windblown developers or publishers.*
