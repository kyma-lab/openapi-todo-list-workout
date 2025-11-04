/**
 * Script zum automatischen Generieren des API-Clients aus der OpenAPI-Spezifikation
 * Parst die OpenAPI-Spezifikation direkt für robuste und wartbare Codegenerierung
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAPIParser, type ParsedOperation } from './utils/openapi-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '../openApi-ts.yaml');
const outputPath = path.join(__dirname, '../src/generate/api/client.ts');

/**
 * Generiere Methoden-Name basierend auf der HTTP-Methode und operationId
 * Bevorzugt operationId aus der OpenAPI-Spezifikation für bessere Benennung
 */
function getMethodName(operation: ParsedOperation): string {
  // Bevorzuge operationId aus der OpenAPI-Spezifikation
  if (operation.operationId) {
    // Konvertiere camelCase: postSatzart -> create, getSatzart -> get, etc.
    const opId = operation.operationId;
    if (opId.startsWith('post')) return opId.replace('post', 'create').replace(/^create/, 'create');
    if (opId.startsWith('get')) return opId.replace('get', 'get').replace(/^get/, 'get');
    if (opId.startsWith('put')) return opId.replace('put', 'update').replace(/^update/, 'update');
    if (opId.startsWith('delete'))
      return opId.replace('delete', 'delete').replace(/^delete/, 'delete');
    if (opId.startsWith('patch')) return opId.replace('patch', 'patch').replace(/^patch/, 'patch');
    return opId;
  }

  const methodMap: Record<string, string> = {
    post: 'create',
    get: 'get',
    put: 'update',
    delete: 'delete',
    patch: 'patch'
  };

  // Spezielle Behandlung für Pfade mit speziellen Namen
  const path = operation.path;
  if (path.includes('/simuliere')) return 'simuliereSPoCEingang';
  if (path.includes('/verarbeitungRvSystemBestand') && path.includes('{correlationid}'))
    return 'rvSystemBestandSatzSammlung';
  if (path.includes('/verarbeitungRvSystemBestand')) return 'rvSystemBestand';
  if (path.includes('/verarbeitungPsd')) return 'psd';
  if (path.includes('/verarbeitungZielsystem')) return 'zielsystem';
  if (path.includes('/verarbeitungsstatus')) return 'getVerarbeitungsstatus';
  if (path.includes('/sendeSatzzustellung')) return 'send';
  if (path.includes('/prozessdatenloeschung')) return 'datenloeschung';
  if (path.includes('/prozesskettentrigger')) return 'kettentrigger';

  return methodMap[operation.method] || operation.method;
}

/**
 * Hauptfunktion zum Generieren des API-Clients
 */
async function generateClient(): Promise<void> {
  const parser = new OpenAPIParser();
  await parser.parse(specPath);

  const operations = parser.getOperations();
  const groupedPaths = parser.getOperationsByResource();

  console.log(`🔗 ${operations.length} API-Endpunkte gefunden`);
  console.log(`📁 ${groupedPaths.size} Ressourcen-Gruppen`);

  // Header für die generierte Datei
  const header = `/**
 * This file was auto-generated from OpenAPI spec.
 * Do not make direct changes to the file.
 *
 * Run 'npm run generate:api' to regenerate.
 */

import { Fetcher } from 'openapi-typescript-fetch';
import type { paths } from '../types/api-types';

// Basis-URL aus Umgebungsvariablen oder Standard
const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8090';

// Erstelle den Fetcher mit den generierten Typen
const fetcher = Fetcher.for<paths>();

// Konfiguriere den Fetcher
fetcher.configure({
  baseUrl: BASE_URL,
  init: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // Optional: Basic Auth aus Umgebungsvariablen
  use: [
    async (url, init, next) => {
      const username = process.env.API_USERNAME;
      const password = process.env.API_PASSWORD;

      if (username && password) {
        const auth = Buffer.from(\`\${username}:\${password}\`).toString('base64');
        const newInit = {
          ...init,
          headers: {
            ...init.headers,
            Authorization: \`Basic \${auth}\`,
          },
        };
        return next(url, newInit);
      }

      return next(url, init);
    },
  ],
});

// API Client Methoden
export const apiClient = {
`;

  let content = header;

  // Spezielle Gruppierungen für bessere Organisation
  const specialGroups = new Map<string, string[]>([
    ['simulation', ['simuliereSPoCEingang']],
    [
      'verarbeitung',
      ['verarbeitungRvSystemBestandSpocRoute', 'verarbeitungPsdRoute', 'verarbeitungZielsystem']
    ],
    ['status', ['verarbeitungsstatus']],
    ['prozess', ['prozessdatenloeschung', 'prozesskettentrigger']]
  ]);

  // Generiere Client-Code für jede Ressource
  const processedResources = new Set<string>();

  for (const [resource, methods] of groupedPaths) {
    // Überspringe, wenn bereits in einer speziellen Gruppe verarbeitet
    if (Array.from(specialGroups.values()).some(group => group.includes(resource))) {
      continue;
    }

    processedResources.add(resource);

    content += `  // ${resource.charAt(0).toUpperCase() + resource.slice(1)}\n`;
    content += `  ${resource}: {\n`;

    for (const op of methods) {
      const methodName = getMethodName(op);
      // Füge JSDoc-Kommentar hinzu, wenn summary oder description vorhanden
      if (op.summary ?? op.description) {
        const doc = op.summary ?? op.description ?? '';
        content += `    /** ${doc} */\n`;
      }
      content += `    ${methodName}: fetcher.path('${op.path}').method('${op.method}').create(),\n`;
    }

    content += `  },\n\n`;
  }

  // Füge spezielle Gruppen hinzu
  for (const [groupName, resources] of specialGroups) {
    content += `  // ${groupName.charAt(0).toUpperCase() + groupName.slice(1)}\n`;
    content += `  ${groupName}: {\n`;

    for (const resource of resources) {
      const resourceMethods = groupedPaths.get(resource);
      if (resourceMethods) {
        for (const op of resourceMethods) {
          const methodName = getMethodName(op);
          // Füge JSDoc-Kommentar hinzu, wenn summary oder description vorhanden
          if (op.summary ?? op.description) {
            const doc = op.summary ?? op.description ?? '';
            content += `    /** ${doc} */\n`;
          }
          content += `    ${methodName}: fetcher.path('${op.path}').method('${op.method}').create(),\n`;
        }
      }
    }

    content += `  },\n\n`;
  }

  content += `};

export default apiClient;
`;

  // Erstelle das Ausgabeverzeichnis, falls es nicht existiert
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Schreibe die Datei
  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log('✅ API-Client erfolgreich generiert:', outputPath);
  console.log(`   - ${operations.length} Endpunkte`);
  console.log(`   - ${groupedPaths.size} Ressourcen-Gruppen`);
}

// Führe die Generierung aus
generateClient().catch((error) => {
  console.error('❌ Fehler beim Generieren des API-Clients:', error);
  process.exit(1);
});
