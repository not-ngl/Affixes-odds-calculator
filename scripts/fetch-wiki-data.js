const fs = require('fs');
const luaparse = require('luaparse');

const fetchWikiModule = async (wikiUrl, moduleName) => {
  const apiUrl = `${wikiUrl}/api.php?action=query&titles=${moduleName}&prop=revisions&rvprop=content&format=json&redirects=1`;
  console.log(`API URL: ${apiUrl}`);

  const response = await fetch(apiUrl);
  const data = await response.json();

  const pages = data.query?.pages;
  if (!pages) {
    throw new Error('No pages found in API response');
  }

  const page = Object.values(pages)[0];
  const revisions = page.revisions?.[0];

  if (!revisions || !revisions['*']) {
    throw new Error(`Module "${moduleName}" not found or has no content`);
  }

  return revisions['*']; 
};

async function luaToJson(luaContent) {
  try {
    const ast = luaparse.parse(luaContent);
    
    // Handle 'return { ... }' statements
    const statement = ast.body[0];
    
    if (statement.type === 'ReturnStatement') {
      // For: return { ... }
      return astToJson(statement.arguments[0]);  
    }
    
    throw new Error('Unexpected Lua structure');
  } catch (error) {
    console.error('Error parsing Lua:', error.message);
    throw error;
  }
}

function nodeToValue(node) {
  if (node.type === 'TableConstructorExpression') {
    return astToJson(node); // Recursively parse nested tables
  }
  if (node.type === 'StringLiteral') {
    return node.raw.slice(1, -1); // Remove quotes
  }
  if (node.type === 'NumericLiteral') {
    return node.value;
  }
  if (node.type === 'BooleanLiteral') {
    return node.value;
  }
  if (node.type === 'Identifier' && node.name === 'nil') {
    return null;
  }
  return null;
}

function astToJson(table) {
  const result = {};
  const arrayValues = [];

  if (!table.fields) return result;

  for (const field of table.fields) {
    if (field.type === 'TableKey' || field.type === 'TableKeyString') {
      let key;
      if (field.key.type === 'StringLiteral') {
        key = field.key.raw.slice(1, -1); // Remove quotes from StringLiteral
      } else if (field.key.type === 'Identifier') {
        key = field.key.name; // Direct name from Identifier
      } else {
        key = field.key.value; // Fallback
      }

      const value = nodeToValue(field.value);
      result[key] = value;
    } else if (field.type === 'TableValue') {
      arrayValues.push(nodeToValue(field.value));
    }
  }

  if (arrayValues.length > 0) {
    result['__array'] = arrayValues;
  }

  return result;
}

async function updateData() {
  const wikiUrl = 'https://windblown.wiki.gg/';
  
  console.log('Fetching Module:Weapons/Data...');
  const weaponsLua = await fetchWikiModule(wikiUrl, 'Module:Weapons/Data');
  if (weaponsLua) {
    const weaponsData = await luaToJson(weaponsLua);  
    fs.writeFileSync('data/weapons.json', JSON.stringify(weaponsData, null, 2));
    console.log('Saved weapons.json');
  }

  console.log('Fetching Module:Trinkets/Data...');
  const trinketsLua = await fetchWikiModule(wikiUrl, 'Module:Trinkets/Data');
  if (trinketsLua) {
    const trinketsData = await luaToJson(trinketsLua); 
    fs.writeFileSync('data/trinkets.json', JSON.stringify(trinketsData, null, 2));
    console.log('Saved trinkets.json');
  }

  console.log('Fetching Module:Affixes/Data...');
  const affixesLua = await fetchWikiModule(wikiUrl, 'Module:Affixes/Data');
  if (affixesLua) {
    const affixesData = await luaToJson(affixesLua);
    fs.writeFileSync('data/affixes.json', JSON.stringify(affixesData, null, 2));
    console.log('Saved affixes.json');
  }
}

updateData();

