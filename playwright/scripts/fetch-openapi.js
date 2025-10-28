#!/usr/bin/env node

const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
const openapiUrl = `${apiBaseUrl}/v3/api-docs`;
const outputFile = path.join(__dirname, '../openapi.json');

console.log(`📡 Fetching OpenAPI spec from ${openapiUrl}...`);

try {
  execSync(`curl ${openapiUrl} -o ${outputFile}`, { stdio: 'inherit' });
  console.log('✅ OpenAPI spec downloaded successfully');
} catch (error) {
  console.error('❌ Failed to fetch OpenAPI spec:', error.message);
  process.exit(1);
}
