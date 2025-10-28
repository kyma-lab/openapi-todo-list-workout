#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const typesFilePath = path.join(__dirname, '../src/api/types.ts');

const convenienceExports = `
// Convenience type exports for backward compatibility
export type Todo = components["schemas"]["Todo"];
export type Category = components["schemas"]["Category"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type DeleteResponse = components["schemas"]["DeleteResponse"];
export type TodoUpdateRequest = components["schemas"]["TodoUpdateRequest"];
export type TodoFilterParams = operations["list"]["parameters"]["query"];
`;

// Read the generated types file
let content = fs.readFileSync(typesFilePath, 'utf8');

// Check if convenience exports already exist
if (!content.includes('// Convenience type exports for backward compatibility')) {
  // Append convenience exports
  content += convenienceExports;

  // Write back to file
  fs.writeFileSync(typesFilePath, content, 'utf8');

  console.log('✅ Added convenience type exports to types.ts');
} else {
  console.log('ℹ️  Convenience type exports already exist in types.ts');
}
