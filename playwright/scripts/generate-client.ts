/**
 * Script zum automatischen Generieren des API-Clients aus der OpenAPI-Spezifikation
 * Extrahiert alle Pfade und Methoden aus types.ts und generiert client.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiTypesPath = path.join(__dirname, '../src/generated/types/types.ts');
const outputPath = path.join(__dirname, '../src/generated/types/client.ts');

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

interface PathMethod {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  operationId?: string;
}

// Extrahiere Pfade und Methoden aus types.ts
function extractPathsAndMethods(content: string): PathMethod[] {
  const pathsSection = content.match(/export interface paths \{([\s\S]*?)\n\}/);

  if (!pathsSection) {
    console.warn('Keine Pfade gefunden in types.ts');
    return [];
  }

  const pathMethods: PathMethod[] = [];
  const pathContent = pathsSection[1];
  const pathBlocks = pathContent.split(/^\s*"(\/[^"]+)":\s*\{/gm).filter(Boolean);

  for (let i = 0; i < pathBlocks.length; i += 2) {
    const currentPath = pathBlocks[i];
    const blockContent = pathBlocks[i + 1];

    if (!blockContent) continue;

    // Extrahiere Methoden mit operationId aus dem Block
    const methodRegex = /(\w+):\s*operations\["([^"]+)"\]/g;
    let match;
    while ((match = methodRegex.exec(blockContent)) !== null) {
      pathMethods.push({
        path: currentPath,
        method: match[1] as any,
        operationId: match[2],
      });
    }
  }

  return pathMethods;
}

// Gruppiere Pfade nach Ressourcen basierend auf dem Pfad-Segment
function groupPathsByResource(pathMethods: PathMethod[]): Map<string, PathMethod[]> {
  const groups = new Map<string, PathMethod[]>();

  for (const pm of pathMethods) {
    // Extrahiere Ressourcenname aus dem Pfad
    // z.B. /api/v1/todos -> todos, /api/v1/categories -> categories
    const pathSegments = pm.path.split('/').filter(Boolean);
    // Für /api/v1/todos oder /api/v1/todos/{id} -> nimm das 3. Segment (Index 2)
    // Für andere Pfade ohne /api/v1 Präfix -> nimm das erste nicht-parametrisierte Segment
    let resource = 'general';

    if (pathSegments.length >= 3 && pathSegments[0] === 'api' && pathSegments[1] === 'v1') {
      // Standard API-Pfad: /api/v1/resource
      resource = pathSegments[2];
    } else {
      // Fallback: Nimm das erste nicht-parametrisierte Segment
      resource = pathSegments.find(seg => !seg.startsWith('{')) || 'general';
    }

    if (!groups.has(resource)) {
      groups.set(resource, []);
    }
    groups.get(resource)!.push(pm);
  }

  return groups;
}

// Diese Funktion wird nicht mehr benötigt, da wir operationId verwenden
// function getMethodName(method: string, path: string): string { ... }

// Extract paths and methods
const pathMethods = extractPathsAndMethods(apiTypesContent);

if (pathMethods.length === 0) {
  console.error('❌ Error: No API endpoints found in types.ts');
  console.error('   The OpenAPI specification might be invalid or empty');
  process.exit(1);
}

const groupedPaths = groupPathsByResource(pathMethods);

if (groupedPaths.size === 0) {
  console.error('❌ Error: No resource groups could be created');
  console.error('   Check if the API paths follow the expected format');
  process.exit(1);
}

console.log(`🔗 ${pathMethods.length} API-Endpunkte gefunden`);
console.log(`📁 ${groupedPaths.size} Ressourcen-Gruppen: [${Array.from(groupedPaths.keys()).join(', ')}]`);

// Header für die generierte Datei
const header = `/**
 * This file was auto-generated from OpenAPI types.
 * Do not make direct changes to the file.
 *
 * Run 'npm run update:api' to regenerate.
 */

import { Fetcher } from 'openapi-typescript-fetch';
import type { paths } from './types';

// Basis-URL aus Umgebungsvariablen oder Standard
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

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

// Generiere Client-Code für jede Ressource
for (const [resource, methods] of groupedPaths) {
  content += `  // ${resource.charAt(0).toUpperCase() + resource.slice(1)}\n`;
  content += `  ${resource}: {\n`;

  for (const pm of methods) {
    if (!pm.operationId) {
      console.warn(`⚠️  Keine operationId für ${pm.method.toUpperCase()} ${pm.path} - wird übersprungen`);
      continue;
    }
    content += `    ${pm.operationId}: fetcher.path('${pm.path}').method('${pm.method}').create(),\n`;
  }

  content += `  },\n\n`;
}

content += `};

export default apiClient;
`;

/**
 * Write the generated content to the output file
 */
function writeOutputFile(content: string): void {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log('✅ API-Client erfolgreich generiert:', outputPath);
    console.log(`   - ${pathMethods.length} Endpunkte`);
    console.log(`   - ${groupedPaths.size} Ressourcen-Gruppen`);
  } catch (error) {
    console.error(`❌ Error writing file ${outputPath}:`, error);
    process.exit(1);
  }
}

writeOutputFile(content);
