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

import { APIRequestContext } from '@playwright/test';
import { SERVER_TS_NAME } from '../../support/server-name';
import { ICustomWorld } from '../../support/custom-world';

/**
 * API Client class that uses Playwright's APIRequestContext from custom-world
 */
export class ApiClient {
  constructor(private context: ICustomWorld) {}

  private get request(): APIRequestContext {
    const server = this.context.servers?.[SERVER_TS_NAME];
    if (!server) {
      throw new Error(\`Server '\${SERVER_TS_NAME}' not found in context.servers. Make sure to initialize the server in your hooks.\`);
    }
    return server;
  }

  private async fetch<T>(path: string, method: string, data?: Record<string, unknown>): Promise<{ data: T }> {
    const options: Record<string, unknown> = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      // Replace path parameters
      let finalPath = path;
      const pathParams = new Set<string>();

      // Collect all path parameters
      const pathParamMatches = path.matchAll(/\\{([^}]+)\\}/g);
      for (const match of pathParamMatches) {
        pathParams.add(match[1]);
      }

      // Replace path parameters with actual values
      for (const [key, value] of Object.entries(data)) {
        if (pathParams.has(key)) {
          finalPath = finalPath.replace(\`{\${key}}\`, String(value));
        }
      }

      // Prepare body data (exclude path parameters)
      const bodyData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (!pathParams.has(key)) {
          bodyData[key] = value;
        }
      }

      // Add body for POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && Object.keys(bodyData).length > 0) {
        options.data = bodyData;
      }

      path = finalPath;
    }

    const response = await this.request.fetch(path, options);

    if (!response.ok()) {
      throw new Error(\`API request failed: \${response.status()} \${response.statusText()}\`);
    }

    const responseData = await response.json();
    return { data: responseData as T };
  }
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

  // Generiere Client-Code für jede Ressource als Getter
  const processedResources = new Set<string>();

  // Generiere Getter für normale Ressourcen
  for (const [resource, methods] of groupedPaths) {
    // Überspringe, wenn bereits in einer speziellen Gruppe verarbeitet
    if (Array.from(specialGroups.values()).some(group => group.includes(resource))) {
      continue;
    }

    processedResources.add(resource);

    content += `\n  /** ${resource.charAt(0).toUpperCase() + resource.slice(1)} API methods */\n`;
    content += `  get ${resource}() {\n`;
    content += `    return {\n`;

    for (const op of methods) {
      const methodName = getMethodName(op);

      // Füge JSDoc-Kommentar hinzu
      if (op.summary ?? op.description) {
        content += `      /** ${op.summary ?? op.description} */\n`;
      }
      content += `      ${methodName}: async (data?: Record<string, unknown>) => {\n`;
      content += `        return this.fetch('${op.path}', '${op.method.toUpperCase()}', data);\n`;
      content += `      },\n`;
    }

    content += `    };\n`;
    content += `  }\n`;
  }

  // Füge spezielle Gruppen hinzu
  for (const [groupName, resources] of specialGroups) {
    content += `\n  /** ${groupName.charAt(0).toUpperCase() + groupName.slice(1)} API methods */\n`;
    content += `  get ${groupName}() {\n`;
    content += `    return {\n`;

    for (const resource of resources) {
      const resourceMethods = groupedPaths.get(resource);
      if (resourceMethods) {
        for (const op of resourceMethods) {
          const methodName = getMethodName(op);

          // Füge JSDoc-Kommentar hinzu
          if (op.summary ?? op.description) {
            content += `      /** ${op.summary ?? op.description} */\n`;
          }
          content += `      ${methodName}: async (data?: Record<string, unknown>) => {\n`;
          content += `        return this.fetch('${op.path}', '${op.method.toUpperCase()}', data);\n`;
          content += `      },\n`;
        }
      }
    }

    content += `    };\n`;
    content += `  }\n`;
  }

  content += `}\n`;
  content += `\n// Export factory function\n`;
  content += `export function createApiClient(context: ICustomWorld): ApiClient {\n`;
  content += `  return new ApiClient(context);\n`;
  content += `}\n`;
  content += `\n// Default export for backwards compatibility\n`;
  content += `export default ApiClient;\n`;

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
