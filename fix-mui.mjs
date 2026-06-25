
import { readFileSync, writeFileSync } from 'fs';

import { glob } from 'glob';



function extractBraces(s, i) {

  let depth = 0, j = i;

  do {

    if (s[j] === '{') depth++;

    if (s[j] === '}') depth--;

    j++;

  } while (depth > 0 && j < s.length);

  return s.slice(i, j);

}



const files = glob.sync('src/**/*.{tsx,ts,jsx}', { ignore: '**/node_modules/**' });

let count = 0;



for (const file of files) {

  let c = readFileSync(file, 'utf8');

  const orig = c;

  const re = /(SelectProps|PaperProps|MenuListProps|BackdropProps|ListboxProps|InputProps|InputLabelProps)=/g;

  let m;

  while ((m = re.exec(c)) !== null) {

    const propName = m[1];

    const start = m.index;

    const val = extractBraces(c, m.index + m[0].length);

    const inner = val.slice(1, -1);

    let slotName;

    if (propName === 'InputProps') slotName = 'input';

    else if (propName === 'InputLabelProps') slotName = 'inputLabel';

    else if (propName === 'SelectProps') slotName = 'select';

    else if (propName === 'PaperProps') slotName = 'paper';

    else if (propName === 'MenuListProps') slotName = 'menuList';

    else if (propName === 'BackdropProps') slotName = 'backdrop';

    else if (propName === 'ListboxProps') slotName = 'listbox';

    // Check if already wrapped in slotProps

    const before = c.slice(Math.max(0, start - 20), start);

    if (before.includes('slotProps')) continue;

    // Check if inside an object value (like SelectProps={{ PaperProps: ... }})

    const prefix = c.slice(Math.max(0, start - 200), start);

    if (/(SelectProps|slotProps)\s*:\s*\{[^}]*$/.test(prefix)) continue;

    const replacement = `slotProps={{ ${slotName}: ${inner} }}`;

    c = c.slice(0, start) + replacement + c.slice(start + m[0].length + val.length);

    re.lastIndex = start + replacement.length;

  }

  if (c !== orig) {

    writeFileSync(file, c, 'utf8');

    count++;

    console.log('Fixed:', file);

  }

}

console.log(`\nFixed ${count} files. Restart your dev server.`);

