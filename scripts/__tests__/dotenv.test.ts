import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock the functions we're testing
function parseEnvFileWithComments(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return { variables: new Map(), lines: [], comments: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const variables = new Map();
  const parsedLines = [];
  const comments = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('#')) {
      comments.push({ line: i, content: line });
      parsedLines.push({ type: 'comment', content: line, original: line });
    } else if (trimmed && trimmed.includes('=')) {
      const equalIndex = trimmed.indexOf('=');
      const key = trimmed.substring(0, equalIndex);
      const value = trimmed.substring(equalIndex + 1);
      
      variables.set(key, value);
      parsedLines.push({ type: 'variable', key, value, original: line });
    } else {
      parsedLines.push({ type: 'empty', content: line, original: line });
    }
  }
  
  return { variables, lines: parsedLines, comments };
}

function stringifyEnvWithComments(parsed: any) {
  return parsed.lines.map((line: any) => line.original).join('\n');
}

function isPlaceholder(value: string) {
  if (!value || value === '') return true;
  return value.includes('your_') || value.includes('REPLACE_WITH_');
}

describe('Dotenv Parser', () => {
  it('should parse empty file', () => {
    const tempFile = path.join(__dirname, 'temp-empty.env');
    fs.writeFileSync(tempFile, '');
    
    const result = parseEnvFileWithComments(tempFile);
    expect(result.variables.size).toBe(0);
    expect(result.lines).toEqual([]);
    
    fs.unlinkSync(tempFile);
  });

  it('should parse variables correctly', () => {
    const content = `# Comment
KEY=value
ANOTHER_KEY=another_value
# Another comment
EMPTY_KEY=
`;
    const tempFile = path.join(__dirname, 'temp-vars.env');
    fs.writeFileSync(tempFile, content);
    
    const result = parseEnvFileWithComments(tempFile);
    expect(result.variables.get('KEY')).toBe('value');
    expect(result.variables.get('ANOTHER_KEY')).toBe('another_value');
    expect(result.variables.get('EMPTY_KEY')).toBe('');
    expect(result.variables.size).toBe(3);
    
    fs.unlinkSync(tempFile);
  });

  it('should preserve comments and structure', () => {
    const content = `# Header comment
KEY=value
# Middle comment
ANOTHER_KEY=another_value
# Footer comment
`;
    const tempFile = path.join(__dirname, 'temp-structure.env');
    fs.writeFileSync(tempFile, content);
    
    const result = parseEnvFileWithComments(tempFile);
    expect(result.comments).toHaveLength(3);
    expect(result.lines).toHaveLength(5);
    
    const stringified = stringifyEnvWithComments(result);
    expect(stringified).toBe(content);
    
    fs.unlinkSync(tempFile);
  });

  it('should handle values with equals signs', () => {
    const content = `KEY=value=with=equals
ANOTHER=normal_value
`;
    const tempFile = path.join(__dirname, 'temp-equals.env');
    fs.writeFileSync(tempFile, content);
    
    const result = parseEnvFileWithComments(tempFile);
    expect(result.variables.get('KEY')).toBe('value=with=equals');
    expect(result.variables.get('ANOTHER')).toBe('normal_value');
    
    fs.unlinkSync(tempFile);
  });
});

describe('Placeholder Detection', () => {
  it('should detect placeholder values', () => {
    expect(isPlaceholder('your_key_here')).toBe(true);
    expect(isPlaceholder('REPLACE_WITH_KEY')).toBe(true);
    expect(isPlaceholder('')).toBe(true);
    expect(isPlaceholder('')).toBe(true);
  });

  it('should not detect real values as placeholders', () => {
    expect(isPlaceholder('sk_test_123456')).toBe(false);
    expect(isPlaceholder('https://example.com')).toBe(false);
    expect(isPlaceholder('real_value')).toBe(false);
  });
});
