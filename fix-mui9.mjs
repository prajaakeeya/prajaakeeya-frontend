
import { readFileSync, writeFileSync } from 'fs';

import { globSync } from 'glob';



const RENAMES = {

  PaperProps: 'slotProps={{ paper: ',

  BackdropProps: 'slotProps={{ backdrop: ',

  MenuListProps: 'slotProps={{ menuList: ',

  ListboxProps: 'slotProps={{ listbox: ',

  InputProps: 'slotProps={{ input: ',

  inputProps: 'slotProps={{ htmlInput: ',

  InputLabelProps: 'slotProps={{ inputLabel: ',

  SelectProps: 'slotProps={{ select: ',

  primaryTypographyProps: 'slotProps={{ primaryTypography: ',

};



const files = globSync('src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

for (const file of files) {

  let content = readFileSync(file, 'utf-8');

  let changed = false;

  for (const [oldKey, newPrefix] of Object.entries(RENAMES)) {

    const regex = new RegExp(`\\b${oldKey}=\\{`, 'g');

    let match;

    while ((match = regex.exec(content)) !== null) {

      const start = match.index;

      const braceStart = start + match[0].length - 1; // position of {

      // Find matching closing brace

      let depth = 1;

      let i = braceStart + 1;

      let inString = false;

      let stringChar = '';

      while (i < content.length && depth > 0) {

        const ch = content[i];

        if (inString) {

          if (ch === '\\') { i += 2; continue; }

          if (ch === stringChar) inString = false;

        } else {

          if (ch === "'" || ch === '"' || ch === '`') { inString = true; stringChar = ch; }

          else if (ch === '{') depth++;

          else if (ch === '}') depth--;

        }

        i++;

      }

      if (depth === 0) {

        const before = content.slice(0, start);

        const propValue = content.slice(braceStart + 1, i - 1);

        const after = content.slice(i);

        content = before + newPrefix + propValue + ' }}' + after;

        changed = true;

        regex.lastIndex = start + newPrefix.length + propValue.length + 3;

      }

    }

  }

  // Icon renames (safe string replacements)

  content = content.replace(/ChatBubbleOutline\b/g, 'ChatBubbleOutlined');

  content = content.replace(/\bDeleteOutline\b/g, 'DeleteOutlined');

  content = content.replace(/\bPeopleOutline\b/g, 'PeopleOutlined');

  content = content.replace(/useRef<NodeJS\.Timeout>\(\)/g, 'useRef<NodeJS.Timeout>(undefined)');

  if (changed || content !== readFileSync(file, 'utf-8')) {

    writeFileSync(file, content);

    console.log('Fixed:', file);

  }

}

console.log('Done');

