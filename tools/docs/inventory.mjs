#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';
import matter from 'gray-matter';

/**
 * Documentation Inventory Tool
 * 
 * Scans all markdown files in the repository and extracts:
 * - File metadata (path, title, last modified)
 * - Heading structure
 * - Outbound links (internal and external)
 * - Referenced npm scripts and commands
 * - Referenced environment variables
 * - Referenced file paths
 */

// Configuration
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'playwright-report/**',
  'web/test-results/**',
  'artifacts/**',
  '.git/**'
];

const ENV_VAR_PATTERN = /\b[A-Z][A-Z0-9_]*\b/g;
const NPM_SCRIPT_PATTERN = /npm\s+(?:run\s+)?([a-zA-Z0-9:_-]+)/g;
const NPX_PATTERN = /npx\s+([a-zA-Z0-9@._-]+)/g;
const TSX_PATTERN = /tsx\s+([a-zA-Z0-9/._-]+)/g;
const FILE_PATH_PATTERN = /`([^`]+\.(?:ts|tsx|js|jsx|json|md|sql|yml|yaml))`/g;
const INTERNAL_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

class DocInventory {
  constructor() {
    this.files = [];
    this.errors = [];
    this.stats = {
      totalFiles: 0,
      totalLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      brokenLinks: 0,
      referencedScripts: new Set(),
      referencedEnvVars: new Set(),
      referencedFiles: new Set()
    };
  }

  async scan() {
    console.log('🔍 Scanning markdown files...');
    
    const mdFiles = await globby('**/*.md', {
      ignore: EXCLUDE_PATTERNS,
      gitignore: true
    });

    this.stats.totalFiles = mdFiles.length;
    console.log(`Found ${mdFiles.length} markdown files`);

    for (const filePath of mdFiles) {
      try {
        await this.processFile(filePath);
      } catch (error) {
        this.errors.push({ file: filePath, error: error.message });
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }

    return this.generateReport();
  }

  async processFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    
    // Parse frontmatter
    const { data: frontmatter, content: markdown } = matter(content);
    
    // Extract title from first H1
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');
    
    // Extract headings
    const headings = this.extractHeadings(markdown);
    
    // Extract links
    const links = this.extractLinks(markdown, filePath);
    
    // Extract referenced commands
    const commands = this.extractCommands(markdown);
    
    // Extract environment variables
    const envVars = this.extractEnvVars(markdown);
    
    // Extract file paths
    const filePaths = this.extractFilePaths(markdown);
    
    // Update stats
    this.stats.totalLinks += links.length;
    this.stats.internalLinks += links.filter(l => l.type === 'internal').length;
    this.stats.externalLinks += links.filter(l => l.type === 'external').length;
    
    commands.forEach(cmd => this.stats.referencedScripts.add(cmd));
    envVars.forEach(env => this.stats.referencedEnvVars.add(env));
    filePaths.forEach(fp => this.stats.referencedFiles.add(fp));

    this.files.push({
      path: filePath,
      title,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
      headings,
      links,
      commands,
      envVars,
      filePaths,
      frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : null
    });
  }

  extractHeadings(markdown) {
    const headingMatches = markdown.matchAll(/^(#{1,6})\s+(.+)$/gm);
    const headings = [];
    
    for (const match of headingMatches) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      headings.push({ level, text, id });
    }
    
    return headings;
  }

  extractLinks(markdown, filePath) {
    const links = [];
    const matches = markdown.matchAll(INTERNAL_LINK_PATTERN);
    
    for (const match of matches) {
      const text = match[1];
      const url = match[2];
      
      let type = 'external';
      let target = url;
      
      // Check if it's an internal link
      if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/') || !url.includes('://')) {
        type = 'internal';
        target = url;
      }
      
      links.push({ text, url, type, target });
    }
    
    return links;
  }

  extractCommands(markdown) {
    const commands = new Set();
    
    // Extract npm run commands
    const npmMatches = markdown.matchAll(NPM_SCRIPT_PATTERN);
    for (const match of npmMatches) {
      commands.add(`npm run ${match[1]}`);
    }
    
    // Extract npx commands
    const npxMatches = markdown.matchAll(NPX_PATTERN);
    for (const match of npxMatches) {
      commands.add(`npx ${match[1]}`);
    }
    
    // Extract tsx commands
    const tsxMatches = markdown.matchAll(TSX_PATTERN);
    for (const match of tsxMatches) {
      commands.add(`tsx ${match[1]}`);
    }
    
    return Array.from(commands);
  }

  extractEnvVars(markdown) {
    const envVars = new Set();
    const matches = markdown.matchAll(ENV_VAR_PATTERN);
    
    for (const match of matches) {
      const envVar = match[0];
      // Filter out common non-env patterns
      if (envVar.length > 2 && !['HTTP', 'HTTPS', 'GET', 'POST', 'PUT', 'DELETE'].includes(envVar)) {
        envVars.add(envVar);
      }
    }
    
    return Array.from(envVars);
  }

  extractFilePaths(markdown) {
    const filePaths = new Set();
    const matches = markdown.matchAll(FILE_PATH_PATTERN);
    
    for (const match of matches) {
      filePaths.add(match[1]);
    }
    
    return Array.from(filePaths);
  }

  generateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      stats: this.stats,
      files: this.files,
      errors: this.errors,
      summary: {
        totalFiles: this.stats.totalFiles,
        totalLinks: this.stats.totalLinks,
        internalLinks: this.stats.internalLinks,
        externalLinks: this.stats.externalLinks,
        uniqueScripts: Array.from(this.stats.referencedScripts),
        uniqueEnvVars: Array.from(this.stats.referencedEnvVars),
        uniqueFilePaths: Array.from(this.stats.referencedFiles)
      }
    };

    return report;
  }
}

async function main() {
  try {
    const inventory = new DocInventory();
    const report = await inventory.scan();
    
    // Write JSON report
    const jsonPath = 'artifacts/docs/inventory.json';
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    console.log(`📄 JSON report written to ${jsonPath}`);
    
    // Write Markdown report
    const mdPath = 'artifacts/docs/inventory.md';
    const mdReport = generateMarkdownReport(report);
    await fs.writeFile(mdPath, mdReport);
    console.log(`📄 Markdown report written to ${mdPath}`);
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Total files: ${report.stats.totalFiles}`);
    console.log(`- Total links: ${report.stats.totalLinks}`);
    console.log(`- Internal links: ${report.stats.internalLinks}`);
    console.log(`- External links: ${report.stats.externalLinks}`);
    console.log(`- Unique scripts: ${report.summary.uniqueScripts.length}`);
    console.log(`- Unique env vars: ${report.summary.uniqueEnvVars.length}`);
    console.log(`- Unique file paths: ${report.summary.uniqueFilePaths.length}`);
    
    if (report.errors.length > 0) {
      console.log(`\n❌ Errors: ${report.errors.length}`);
      report.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating inventory:', error);
    process.exit(1);
  }
}

function generateMarkdownReport(report) {
  let md = `# Documentation Inventory Report

Generated: ${report.generatedAt}

## Summary

- **Total Files**: ${report.stats.totalFiles}
- **Total Links**: ${report.stats.totalLinks}
- **Internal Links**: ${report.stats.internalLinks}
- **External Links**: ${report.stats.externalLinks}
- **Unique Scripts**: ${report.summary.uniqueScripts.length}
- **Unique Environment Variables**: ${report.summary.uniqueEnvVars.length}
- **Unique File Paths**: ${report.summary.uniqueFilePaths.length}

## Files

`;

  // Group files by directory
  const filesByDir = {};
  report.files.forEach(file => {
    const dir = path.dirname(file.path);
    if (!filesByDir[dir]) filesByDir[dir] = [];
    filesByDir[dir].push(file);
  });

  Object.keys(filesByDir).sort().forEach(dir => {
    md += `### ${dir}\n\n`;
    
    filesByDir[dir].forEach(file => {
      md += `#### [${file.title}](${file.path})\n`;
      md += `- **Path**: \`${file.path}\`\n`;
      md += `- **Last Modified**: ${file.lastModified}\n`;
      md += `- **Size**: ${file.size} bytes\n`;
      
      if (file.headings.length > 0) {
        md += `- **Headings**: ${file.headings.length}\n`;
      }
      
      if (file.links.length > 0) {
        md += `- **Links**: ${file.links.length}\n`;
      }
      
      if (file.commands.length > 0) {
        md += `- **Commands**: ${file.commands.join(', ')}\n`;
      }
      
      if (file.envVars.length > 0) {
        md += `- **Env Vars**: ${file.envVars.slice(0, 5).join(', ')}${file.envVars.length > 5 ? '...' : ''}\n`;
      }
      
      md += '\n';
    });
  });

  // Add referenced scripts
  if (report.summary.uniqueScripts.length > 0) {
    md += `## Referenced Scripts\n\n`;
    report.summary.uniqueScripts.sort().forEach(script => {
      md += `- \`${script}\`\n`;
    });
    md += '\n';
  }

  // Add referenced environment variables
  if (report.summary.uniqueEnvVars.length > 0) {
    md += `## Referenced Environment Variables\n\n`;
    report.summary.uniqueEnvVars.sort().forEach(envVar => {
      md += `- \`${envVar}\`\n`;
    });
    md += '\n';
  }

  // Add errors if any
  if (report.errors.length > 0) {
    md += `## Errors\n\n`;
    report.errors.forEach(error => {
      md += `- **${error.file}**: ${error.error}\n`;
    });
  }

  return md;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
