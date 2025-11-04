/**
 * OpenAPI Parser Utility
 * Parses OpenAPI specifications directly instead of parsing generated TypeScript files
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';

export interface ParsedOperation {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses?: OpenAPIV3.ResponsesObject;
}

export interface ParsedSchema {
  name: string;
  schema: OpenAPIV3.SchemaObject;
  description?: string;
}

/**
 * Parser for OpenAPI specifications
 * Provides methods to extract operations, schemas, and other metadata
 */
export class OpenAPIParser {
  private spec: OpenAPIV3.Document | null = null;

  /**
   * Parse and validate an OpenAPI specification file
   * @param specPath Path to the OpenAPI spec file (YAML or JSON)
   */
  async parse(specPath: string): Promise<void> {
    this.spec = (await SwaggerParser.validate(specPath)) as OpenAPIV3.Document;
  }

  /**
   * Get all operations from the spec
   * @returns Array of parsed operations
   */
  getOperations(): ParsedOperation[] {
    if (!this.spec?.paths) return [];

    const operations: ParsedOperation[] = [];

    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      if (!pathItem) continue;

      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

      for (const method of methods) {
        const operation = pathItem[method];
        if (!operation) continue;

        operations.push({
          path,
          method,
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          tags: operation.tags,
          parameters: operation.parameters as OpenAPIV3.ParameterObject[],
          requestBody: operation.requestBody as OpenAPIV3.RequestBodyObject,
          responses: operation.responses
        });
      }
    }

    return operations;
  }

  /**
   * Get all schemas from the spec
   * @returns Array of parsed schemas
   */
  getSchemas(): ParsedSchema[] {
    if (!this.spec?.components?.schemas) return [];

    return Object.entries(this.spec.components.schemas).map(([name, schema]) => ({
      name,
      schema: schema as OpenAPIV3.SchemaObject,
      description: (schema as OpenAPIV3.SchemaObject).description
    }));
  }

  /**
   * Get operations grouped by tag
   * @returns Map of tag name to operations
   */
  getOperationsByTag(): Map<string, ParsedOperation[]> {
    const operations = this.getOperations();
    const byTag = new Map<string, ParsedOperation[]>();

    for (const op of operations) {
      const tags = op.tags ?? ['default'];
      for (const tag of tags) {
        if (!byTag.has(tag)) {
          byTag.set(tag, []);
        }
        byTag.get(tag)!.push(op);
      }
    }

    return byTag;
  }

  /**
   * Get operations grouped by path resource (first path segment)
   * @returns Map of resource name to operations
   */
  getOperationsByResource(): Map<string, ParsedOperation[]> {
    const operations = this.getOperations();
    const byResource = new Map<string, ParsedOperation[]>();

    for (const op of operations) {
      // Extract resource name from path (e.g., /satzart/... -> satzart)
      const match = /^\/([^\/\{]+)/.exec(op.path);
      const resource = match ? match[1] : 'default';

      if (!byResource.has(resource)) {
        byResource.set(resource, []);
      }
      byResource.get(resource)!.push(op);
    }

    return byResource;
  }

  /**
   * Get the full OpenAPI spec
   * @returns The parsed OpenAPI document
   */
  getSpec(): OpenAPIV3.Document | null {
    return this.spec;
  }

  /**
   * Get operation by operationId
   * @param operationId The operation ID to find
   * @returns The parsed operation or undefined
   */
  getOperationById(operationId: string): ParsedOperation | undefined {
    return this.getOperations().find(op => op.operationId === operationId);
  }

  /**
   * Get schema by name
   * @param schemaName The schema name to find
   * @returns The parsed schema or undefined
   */
  getSchemaByName(schemaName: string): ParsedSchema | undefined {
    return this.getSchemas().find(schema => schema.name === schemaName);
  }
}
