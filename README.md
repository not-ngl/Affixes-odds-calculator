# Windblown's Affix Calculator

A web UI for calculating affix combination probabilities for Windblown.

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

Feel free to submit issues or enhancements. If a result is odd check `src/probability.js` for more information.

## License

Calculator tool code: [MIT License](LICENSE)  
Game assets & icons: © Motion Twin  
Wiki data: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---

*This is an unofficial fan tool. Not affiliated with Windblown developers or publishers.*
