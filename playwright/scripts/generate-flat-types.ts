/**
 * Script zum Generieren von flachen TypeScript-Typen aus der OpenAPI-Spezifikation
 * Extrahiert automatisch alle Schemas und Operations aus types.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiTypesPath = path.join(__dirname, '../src/generated/types/types.ts');
const outputPath = path.join(__dirname, '../src/generated/types/models.ts');

/**
 * Validate that the input file exists and is readable
 */
function validateInputFile(): string {
  if (!fs.existsSync(apiTypesPath)) {
    console.error(`❌ Error: Input file not found: ${apiTypesPath}`);
    console.error('   Please run "npm run generate:api" first to generate types.ts');
    process.exit(1);
  }

  try {
    return fs.readFileSync(apiTypesPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file ${apiTypesPath}:`, error);
    process.exit(1);
  }
}

const apiTypesContent = validateInputFile();

// Extrahiere Schema-Namen aus der types.ts
function extractSchemas(content: string): string[] {
  const schemasSection = content.match(/export interface components \{[\s\S]*?schemas: \{([\s\S]*?)\n    \};/);

  if (!schemasSection) {
    console.warn('Keine Schemas gefunden in types.ts');
    return [];
  }

  const schemas = new Set<string>();
  const schemaContent = schemasSection[1];
  const lines = schemaContent.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*"?([A-Za-z0-9_]+)"?:\s*\{/);
    if (match && match[1]) {
      schemas.add(match[1]);
    }
  }

  return Array.from(schemas).sort();
}

// Extrahiere Operation-IDs aus der types.ts
function extractOperations(content: string): string[] {
  const operationsSection = content.match(/export interface operations \{([\s\S]*?)\n\}/);

  if (!operationsSection) {
    console.warn('Keine Operations gefunden in types.ts');
    return [];
  }

  const operations = new Set<string>();
  const operationContent = operationsSection[1];
  const lines = operationContent.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*"?([A-Za-z0-9_]+)"?:\s*\{/);
    if (match && match[1]) {
      const operationName = match[1];
      // Filtere ungültige TypeScript-Identifier (z.B. Zahlen, HTTP-Statuscodes, Schlüsselwörter)
      if (
        /^[a-zA-Z_]/.test(operationName) && // Muss mit Buchstabe oder _ beginnen
        !['content', 'headers', 'parameters', 'path', 'requestBody', 'responses'].includes(operationName) // Keine internen OpenAPI-Felder
      ) {
        operations.add(operationName);
      }
    }
  }

  return Array.from(operations).sort();
}

// Extrahiere Schemas und Operations
const schemas = extractSchemas(apiTypesContent);
const operations = extractOperations(apiTypesContent);

if (schemas.length === 0 && operations.length === 0) {
  console.error('❌ Error: No schemas or operations found in types.ts');
  console.error('   The OpenAPI specification might be invalid or empty');
  process.exit(1);
}

if (schemas.length === 0) {
  console.warn('⚠️  Warning: No schemas found in types.ts');
}

if (operations.length === 0) {
  console.warn('⚠️  Warning: No operations found in types.ts');
}

console.log(`📦 ${schemas.length} Schemas gefunden`);
console.log(`🔧 ${operations.length} Operations gefunden`);

// Header für die generierte Datei
const header = `/**
 * This file was auto-generated from OpenAPI types.
 * Do not make direct changes to the file.
 *
 * Run 'npm run update:api' to regenerate.
 */

import type { components, operations } from './types';

// ============================================================================
// Schemas - Flache Typen für einfache Verwendung
// ============================================================================

`;

// Generiere Schema-Typen
let content = header;

schemas.forEach((schema) => {
  content += `export type ${schema} = components['schemas']['${schema}'];\n`;
});

content += '\n// ============================================================================\n';
content += '// Operation Request/Response Types\n';
content += '// ============================================================================\n\n';

// Generiere Operation-Typen (Request Body und Response)
operations.forEach((operation) => {
  content += `// ${operation}\n`;
  content += `export type ${operation}RequestBody = operations['${operation}'] extends { requestBody?: { content: { 'application/json': infer R } } } ? R : never;\n`;
  content += `export type ${operation}Response = operations['${operation}'] extends { responses: infer R } ? R : never;\n\n`;
});

content += '\n// ============================================================================\n';
content += '// Helper Types für erfolgreiche Response-Daten (2xx)\n';
content += '// ============================================================================\n\n';

// Generiere Helper-Typen für erfolgreiche Responses (200, 201, 202)
operations.forEach((operation) => {
  const capitalizedName = operation.charAt(0).toUpperCase() + operation.slice(1);
  content += `export type ${capitalizedName}SuccessResponse = operations['${operation}'] extends { responses: { [K in 200 | 201 | 202]: { content: { 'application/json': infer D } } } } ? D : never;\n`;
});

/**
 * Write the generated content to the output file
 */
function writeOutputFile(content: string): void {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log('✅ Flache TypeScript-Typen erfolgreich generiert:', outputPath);
    console.log(`   - ${schemas.length} Schema-Typen`);
    console.log(`   - ${operations.length} Operation Request/Response-Typen`);
    console.log(`   - ${operations.length} Helper-Typen für Success-Response-Daten`);
  } catch (error) {
    console.error(`❌ Error writing file ${outputPath}:`, error);
    process.exit(1);
  }
}

writeOutputFile(content);
