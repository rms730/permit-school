#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Command Validation Tool
 * 
 * Validates that all npm scripts and commands referenced in documentation
 * actually exist in package.json files.
 */

class CommandValidator {
  constructor() {
    this.rootScripts = new Set();
    this.webScripts = new Set();
    this.referencedCommands = new Set();
    this.errors = [];
    this.warnings = [];
  }

  async loadPackageScripts() {
    try {
      // Load root package.json
      const rootPkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      Object.keys(rootPkg.scripts || {}).forEach(script => {
        this.rootScripts.add(script);
      });

      // Load web package.json
      const webPkg = JSON.parse(await fs.readFile('web/package.json', 'utf-8'));
      Object.keys(webPkg.scripts || {}).forEach(script => {
        this.webScripts.add(script);
      });

      console.log(`📦 Loaded ${this.rootScripts.size} root scripts and ${this.webScripts.size} web scripts`);
    } catch (error) {
      console.error('❌ Error loading package.json files:', error.message);
      throw error;
    }
  }

  async scanDocumentation() {
    const { globby } = await import('globby');
    
    const mdFiles = await globby('**/*.md', {
      ignore: ['node_modules/**', '.next/**', 'playwright-report/**', 'web/test-results/**', 'artifacts/**', 'web/node_modules/**'],
      gitignore: true
    });

    console.log(`🔍 Scanning ${mdFiles.length} markdown files for commands...`);

    for (const filePath of mdFiles) {
      try {
        await this.processFile(filePath);
      } catch (error) {
        this.errors.push({ file: filePath, error: error.message });
      }
    }
  }

  async processFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract npm run commands (avoid flags)
    const npmMatches = content.matchAll(/npm\s+(?:run\s+)?([a-zA-Z0-9:_-]+)(?:\s|$)/g);
    for (const match of npmMatches) {
      const scriptName = match[1];
      
      // Skip npm flags and common non-script patterns
      if (scriptName.startsWith('-') || ['install', 'ci', 'packages', 'dependencies', 'run', 'version', 'list', 'ls'].includes(scriptName)) {
        continue;
      }
      
      this.referencedCommands.add(`npm run ${scriptName}`);
      
      // Check if script exists
      if (!this.rootScripts.has(scriptName) && !this.webScripts.has(scriptName)) {
        this.errors.push({
          file: filePath,
          type: 'missing_script',
          command: `npm run ${scriptName}`,
          message: `Script '${scriptName}' not found in package.json files`
        });
      }
    }

    // Extract npx commands
    const npxMatches = content.matchAll(/npx\s+([a-zA-Z0-9@._-]+)/g);
    for (const match of npxMatches) {
      const packageName = match[1];
      this.referencedCommands.add(`npx ${packageName}`);
      
      // For npx commands, we'll just track them but not validate existence
      // since they could be global packages or not yet installed
    }

    // Extract tsx commands
    const tsxMatches = content.matchAll(/tsx\s+([a-zA-Z0-9/._-]+)/g);
    for (const match of tsxMatches) {
      const scriptPath = match[1];
      
      // Skip invalid patterns
      if (scriptPath === '--' || scriptPath === 'import') {
        continue;
      }
      
      this.referencedCommands.add(`tsx ${scriptPath}`);
      
      // Check if the file exists
      try {
        await fs.access(scriptPath);
      } catch (error) {
        this.errors.push({
          file: filePath,
          type: 'missing_file',
          command: `tsx ${scriptPath}`,
          message: `File '${scriptPath}' not found`
        });
      }
    }
  }

  generateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRootScripts: this.rootScripts.size,
        totalWebScripts: this.webScripts.size,
        totalReferencedCommands: this.referencedCommands.size,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      rootScripts: Array.from(this.rootScripts).sort(),
      webScripts: Array.from(this.webScripts).sort(),
      referencedCommands: Array.from(this.referencedCommands).sort(),
      errors: this.errors,
      warnings: this.warnings
    };

    return report;
  }
}

async function main() {
  try {
    const validator = new CommandValidator();
    
    console.log('🔍 Command Validation Tool\n');
    
    // Load package.json scripts
    await validator.loadPackageScripts();
    
    // Scan documentation
    await validator.scanDocumentation();
    
    // Generate report
    const report = validator.generateReport();
    
    // Write JSON report
    const jsonPath = 'artifacts/docs/cmd-report.json';
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    console.log(`📄 Command report written to ${jsonPath}`);
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Root scripts: ${report.summary.totalRootScripts}`);
    console.log(`- Web scripts: ${report.summary.totalWebScripts}`);
    console.log(`- Referenced commands: ${report.summary.totalReferencedCommands}`);
    console.log(`- Errors: ${report.summary.errors}`);
    console.log(`- Warnings: ${report.summary.warnings}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.message}`);
        console.log(`    Command: ${error.command}`);
      });
    }
    
    if (report.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      report.warnings.forEach(warning => {
        console.log(`  - ${warning.file}: ${warning.message}`);
      });
    }
    
    // Exit with error code if there are errors
    if (report.errors.length > 0) {
      console.log('\n❌ Command validation failed');
      process.exit(1);
    } else {
      console.log('\n✅ All referenced commands are valid');
    }
    
  } catch (error) {
    console.error('❌ Error during command validation:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
