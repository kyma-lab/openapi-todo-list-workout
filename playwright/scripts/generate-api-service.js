#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OPENAPI_FILE = path.join(__dirname, '../openapi.json');
const OUTPUT_FILE = path.join(__dirname, '../src/api/todo-api.testservice.ts');

/**
 * Parse OpenAPI specification and generate TypeScript API service
 */
function generateApiService() {
  // Read OpenAPI spec
  const openapi = JSON.parse(fs.readFileSync(OPENAPI_FILE, 'utf8'));

  // Extract base path
  const servers = openapi.servers || [];
  const basePath = extractBasePath(openapi.paths);

  // Parse operations
  const operations = parseOperations(openapi.paths);

  // Generate TypeScript code
  const code = generateServiceClass(operations, basePath);

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, code, 'utf8');

  console.log('✅ Generated API service:', OUTPUT_FILE);
  console.log(`   ${operations.length} operations generated`);
}

/**
 * Extract base path from API paths - returns empty string since paths already include full path
 */
function extractBasePath(paths) {
  // Paths already include /api/v1, so we return empty string
  return '';
}

/**
 * Parse all operations from OpenAPI paths
 */
function parseOperations(paths) {
  const operations = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        operations.push({
          operationId: operation.operationId,
          method: method.toUpperCase(),
          path,
          summary: operation.summary,
          description: operation.description,
          parameters: operation.parameters || [],
          requestBody: operation.requestBody,
          responses: operation.responses,
        });
      }
    }
  }

  return operations;
}

/**
 * Generate method name from operationId or path
 */
function getMethodName(operation) {
  const { operationId, method, path } = operation;

  // Map of operationId to preferred method names
  const nameMap = {
    'create': 'create',
    'list': 'getAll',
    'findById': 'getById',
    'update': 'update',
    'patchTodo': 'patch',
    'delete': 'delete',
    'getAllCategories': 'getCategories',
    'createCategory': 'createCategory',
    'getTodaysTodos': 'getTodaysTodos',
  };

  // Try to use mapped name
  if (operationId && nameMap[operationId]) {
    // Determine resource type from path
    if (path.includes('/todos')) {
      return nameMap[operationId] === 'getAll' ? 'getTodos' :
             nameMap[operationId] === 'create' ? 'createTodo' :
             nameMap[operationId] === 'getById' ? 'getTodoById' :
             nameMap[operationId] === 'update' ? 'updateTodo' :
             nameMap[operationId] === 'patch' ? 'patchTodo' :
             nameMap[operationId] === 'delete' ? 'deleteTodo' :
             nameMap[operationId];
    } else if (path.includes('/categories')) {
      return nameMap[operationId];
    }
  }

  // Fallback
  return operationId || `${method.toLowerCase()}${path.split('/').pop()}`;
}

/**
 * Get return type from operation responses
 */
function getReturnType(operation) {
  const { responses, path } = operation;
  const successResponse = responses['200'] || responses['201'];

  if (!successResponse || !successResponse.content) {
    return 'void';
  }

  const jsonContent = successResponse.content['application/json'];
  if (!jsonContent || !jsonContent.schema) {
    return 'void';
  }

  const schema = jsonContent.schema;

  // Determine type from schema reference
  if (schema.$ref) {
    const typeName = schema.$ref.split('/').pop();

    // List endpoints return arrays
    if (operation.operationId === 'list' || operation.operationId === 'getAllCategories' || operation.operationId === 'getTodaysTodos') {
      return `${typeName}[]`;
    }

    return typeName;
  }

  return 'any';
}

/**
 * Get request body type
 */
function getRequestBodyType(operation) {
  const { requestBody } = operation;

  if (!requestBody || !requestBody.content) {
    return null;
  }

  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent || !jsonContent.schema) {
    return null;
  }

  const schema = jsonContent.schema;
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }

  return null;
}

/**
 * Generate method signature and body
 */
function generateMethod(operation) {
  const methodName = getMethodName(operation);
  const returnType = getReturnType(operation);
  const requestBodyType = getRequestBodyType(operation);

  // Extract path parameters
  const pathParams = operation.parameters.filter(p => p.in === 'path');
  const queryParams = operation.parameters.filter(p => p.in === 'query');

  // Build parameter list
  const params = [];

  // Add path parameters
  pathParams.forEach(p => {
    params.push(`${p.name}: ${p.schema.type === 'integer' ? 'number' : 'string'}`);
  });

  // Add request body
  if (requestBodyType) {
    params.push(`${methodName === 'patchTodo' ? 'updates' : getResourceName(operation)}: ${requestBodyType}`);
  }

  // Add query parameters (optional)
  if (queryParams.length > 0 && operation.operationId === 'list') {
    params.push('params?: TodoFilterParams');
  } else if (operation.operationId === 'getTodaysTodos') {
    params.push('completed?: boolean');
  }

  const paramString = params.join(', ');

  // Generate method body
  const urlPath = generateUrlPath(operation);
  const requestOptions = generateRequestOptions(operation);

  const lines = [
    `  /**`,
    `   * ${operation.summary || operation.description || methodName}`,
    `   */`,
    `  async ${methodName}(${paramString}): Promise<${returnType}> {`,
  ];

  // Add URL construction
  if (queryParams.length > 0) {
    lines.push(`    const url = new URL(\`\${this.baseURL}\${this.apiPath}${urlPath}\`);`);
    lines.push('');
    if (operation.operationId === 'list') {
      lines.push('    if (params) {');
      lines.push('      Object.entries(params).forEach(([key, value]) => {');
      lines.push('        if (value !== undefined) {');
      lines.push('          url.searchParams.append(key, String(value));');
      lines.push('        }');
      lines.push('      });');
      lines.push('    }');
    } else if (operation.operationId === 'getTodaysTodos') {
      lines.push('    if (completed !== undefined) {');
      lines.push('      url.searchParams.append(\'completed\', String(completed));');
      lines.push('    }');
    }
    lines.push('');
    lines.push(`    const response = await this.request.${operation.method.toLowerCase()}(url.toString()${requestOptions});`);
  } else {
    lines.push(`    const response = await this.request.${operation.method.toLowerCase()}(\`\${this.baseURL}\${this.apiPath}${urlPath}\`${requestOptions});`);
  }

  lines.push('');
  lines.push('    if (!response.ok()) {');
  lines.push(`      throw new Error(\`Failed to ${methodName}: \${response.status()} \${await response.text()}\`);`);
  lines.push('    }');

  if (returnType !== 'void') {
    lines.push('');
    lines.push('    return response.json();');
  }

  lines.push('  }');

  return lines.join('\n');
}

/**
 * Generate URL path with parameter interpolation
 */
function generateUrlPath(operation) {
  let path = operation.path;

  // Replace {id} with ${id}
  path = path.replace(/{(\w+)}/g, '${$1}');

  return path;
}

/**
 * Generate request options (data)
 */
function generateRequestOptions(operation) {
  if (!operation.requestBody) {
    return '';
  }

  const resourceName = operation.operationId === 'patchTodo' ? 'updates' : getResourceName(operation);
  return `, {\n      data: ${resourceName},\n    }`;
}

/**
 * Get resource name from operation
 */
function getResourceName(operation) {
  if (operation.path.includes('/todos')) {
    return 'todo';
  } else if (operation.path.includes('/categories')) {
    return 'category';
  }
  return 'data';
}

/**
 * Generate complete service class
 */
function generateServiceClass(operations, basePath) {
  const timestamp = new Date().toISOString();

  const lines = [
    `/**`,
    ` * This file was auto-generated from openapi.json`,
    ` * DO NOT MAKE DIRECT CHANGES - Use scripts/generate-api-service.js`,
    ` * Generated at: ${timestamp}`,
    ` */`,
    ``,
    `import { APIRequestContext } from '@playwright/test';`,
    `import { Todo, TodoUpdateRequest, Category, DeleteResponse, TodoFilterParams } from './types';`,
    ``,
    `/**`,
    ` * Service class for interacting with the Todo API`,
    ` * Encapsulates all API calls to the backend`,
    ` */`,
    `export class TodoApiTestservice {`,
    `  private baseURL: string;`,
    `  private apiPath = '${basePath}';`,
    ``,
    `  constructor(private request: APIRequestContext, baseURL: string = 'http://localhost:8080') {`,
    `    this.baseURL = baseURL;`,
    `  }`,
    ``,
  ];

  // Generate methods
  operations.forEach(op => {
    lines.push(generateMethod(op));
    lines.push('');
  });

  // Add closing brace
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// Run generator
try {
  generateApiService();
} catch (error) {
  console.error('❌ Failed to generate API service:', error.message);
  process.exit(1);
}
