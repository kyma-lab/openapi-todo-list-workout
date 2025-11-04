/**
 * Script zum Generieren von flachen TypeScript-Typen aus der OpenAPI-Spezifikation
 * Parst die OpenAPI-Spezifikation direkt für robuste und wartbare Codegenerierung
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAPIParser } from './utils/openapi-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '../openApi-ts.yaml');
const outputPath = path.join(__dirname, '../src/generate/types/api-models.ts');

/**
 * Hauptfunktion zum Generieren der flachen TypeScript-Typen
 */
async function generateFlatTypes(): Promise<void> {
  const parser = new OpenAPIParser();
  await parser.parse(specPath);

  const schemas = parser.getSchemas();
  const operations = parser.getOperations();

  console.log(`📦 ${schemas.length} Schemas gefunden`);
  console.log(`🔧 ${operations.length} Operations gefunden`);

  // Header für die generierte Datei
  const header = `/**
 * This file was auto-generated from OpenAPI spec.
 * Do not make direct changes to the file.
 *
 * Run 'npm run generate:api' to regenerate.
 */

import type { components, operations } from './api-types';

// ============================================================================
// Schemas - Flache Typen für einfache Verwendung
// ============================================================================

`;

  // Generiere Schema-Typen
  let content = header;

  schemas.forEach((schema) => {
    // Füge JSDoc-Kommentar hinzu, wenn description vorhanden
    if (schema.description) {
      content += `/** ${schema.description} */\n`;
    }
    content += `export type ${schema.name} = components['schemas']['${schema.name}'];\n\n`;
  });

  content += '// ============================================================================\n';
  content += '// Operation Request/Response Types\n';
  content += '// ============================================================================\n\n';

  // Generiere Operation-Typen (Request Body und Response)
  operations.forEach((op) => {
    if (!op.operationId) return;

    // Füge JSDoc-Kommentar hinzu, wenn summary oder description vorhanden
    if (op.summary ?? op.description) {
      const doc = op.summary ?? op.description ?? '';
      content += `/** ${doc} - Request Type */\n`;
    }
    content += `export type ${op.operationId}Request = operations['${op.operationId}'] extends { requestBody?: infer R } ? R : never;\n`;

    if (op.summary ?? op.description) {
      const doc = op.summary ?? op.description ?? '';
      content += `/** ${doc} - Response Type */\n`;
    }
    content += `export type ${op.operationId}Response = operations['${op.operationId}'] extends { responses: infer R } ? R : never;\n\n`;
  });

  content += '// ============================================================================\n';
  content += '// Helper Types für 200er Response-Daten\n';
  content += '// ============================================================================\n\n';

  // Generiere Helper-Typen für erfolgreiche Responses
  operations.forEach((op) => {
    if (!op.operationId) return;

    const capitalizedName = op.operationId.charAt(0).toUpperCase() + op.operationId.slice(1);

    // Füge JSDoc-Kommentar hinzu, wenn summary oder description vorhanden
    if (op.summary ?? op.description) {
      const doc = op.summary ?? op.description ?? '';
      content += `/** ${doc} - Success Response Data */\n`;
    }
    content += `export type ${capitalizedName}Data = operations['${op.operationId}'] extends { responses: { 200: { content: { 'application/json': infer D } } } } ? D : never;\n\n`;
  });

  // Schreibe die Datei
  fs.writeFileSync(outputPath, content, 'utf-8');

  const operationsWithId = operations.filter(op => op.operationId).length;

  console.log('✅ Flache TypeScript-Typen erfolgreich generiert:', outputPath);
  console.log(`   - ${schemas.length} Schema-Typen`);
  console.log(`   - ${operationsWithId * 2} Operation Request/Response-Typen`);
  console.log(`   - ${operationsWithId} Helper-Typen für Response-Daten`);
}

// Führe die Generierung aus
generateFlatTypes().catch((error) => {
  console.error('❌ Fehler beim Generieren der flachen Typen:', error);
  process.exit(1);
});
