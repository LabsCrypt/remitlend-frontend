const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../messages');
const EN_FILE = path.join(MESSAGES_DIR, 'en.json');
const OTHER_LOCALES = ['es.json', 'tl.json'];

function flattenObject(ob) {
  let toReturn = {};
  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == 'object' && ob[i] !== null) {
      let flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function checkLocales() {
  console.log('Checking locale drift...');
  
  if (!fs.existsSync(EN_FILE)) {
    console.error('Error: en.json not found');
    process.exit(1);
  }

  const enContent = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
  const enKeys = Object.keys(flattenObject(enContent)).sort();
  
  let hasErrors = false;

  OTHER_LOCALES.forEach(localeFile => {
    const localePath = path.join(MESSAGES_DIR, localeFile);
    if (!fs.existsSync(localePath)) {
      console.error(`Error: ${localeFile} not found`);
      hasErrors = true;
      return;
    }

    const localeContent = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    const localeKeys = Object.keys(flattenObject(localeContent)).sort();

    const missingKeys = enKeys.filter(k => !localeKeys.includes(k));
    const extraKeys = localeKeys.filter(k => !enKeys.includes(k));

    if (missingKeys.length > 0) {
      console.error(`\n❌ [${localeFile}] Missing keys compared to en.json:`);
      missingKeys.forEach(k => console.error(`  - ${k}`));
      hasErrors = true;
    }

    if (extraKeys.length > 0) {
      console.error(`\n❌ [${localeFile}] Extra keys not found in en.json:`);
      extraKeys.forEach(k => console.error(`  - ${k}`));
      hasErrors = true;
    }
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`✅ ${localeFile} is in sync with en.json`);
    }
  });

  if (hasErrors) {
    console.error('\n❌ Locale drift detected! Please ensure all locale files have the exact same keys as en.json.');
    process.exit(1);
  } else {
    console.log('\n✨ All locales are perfectly in sync!');
    process.exit(0);
  }
}

checkLocales();
