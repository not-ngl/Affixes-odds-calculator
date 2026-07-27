// Probability calculator logic will go here
async function loadData() {
  const weapons = await fetch('../data/weapons.json').then(r => r.json());
  const affixes = await fetch('../data/affixes.json').then(r => r.json());
  console.log('Weapons:', weapons);
  console.log('Affixes:', affixes);
}

loadData();
