/**
 * Post-processing script to convert date-time formatted fields to Date types
 * Runs after openapi-typescript generation to enhance type safety
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiTypesPath = path.join(__dirname, '../src/generated/types/api-types.ts');

function patchDateTypes(): void {
  console.log('🔧 Patching date-time types...');

  let content = fs.readFileSync(apiTypesPath, 'utf-8');
  let patchCount = 0;

  // Pattern: Find fields preceded by a JSDoc comment with "Format: date-time"
  // Example:
  //   /**
  //    * Format: date-time
  //    * @description Zeitstempel des Satzes
  //    */
  //   quelleErzeugtAm?: string;

  // This regex matches:
  // - JSDoc comment containing "Format: date-time"
  // - Followed by field name with optional/required marker and type string
  // Using [\s\S]*? for non-greedy multiline matching
  const pattern = /(\/\*\*[\s\S]*?Format:\s*date-time[\s\S]*?\*\/\s+)(\w+)(\??):\s*string;/gi;

  content = content.replace(pattern, (match, comment, fieldName, optional) => {
    patchCount++;
    return `${comment}${fieldName}${optional}: Date | string;`;
  });

  // Write the modified content back
  fs.writeFileSync(apiTypesPath, content, 'utf-8');

  console.log(`✅ Patched ${patchCount} date-time fields to 'Date | string'`);
}

patchDateTypes();
