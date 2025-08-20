#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface EnvKey {
  key: string;
  nextPublic: boolean;
  scope: 'root' | 'web' | 'both';
  paths: string[];
  usageCount: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class EnvironmentValidator {
  private inventory: EnvKey[];
  private mode: 'local' | 'development' | 'production';

  constructor(mode: 'local' | 'development' | 'production') {
    this.mode = mode;
    this.inventory = this.loadInventory();
  }

  private loadInventory(): EnvKey[] {
    try {
      return JSON.parse(fs.readFileSync('artifacts/env/keys.json', 'utf8'));
    } catch (error) {
      console.error('Failed to load inventory:', error);
      process.exit(1);
    }
  }

  private loadEnvFile(filePath: string): Record<string, string> {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const env: Record<string, string> = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && key.match(/^[A-Z_][A-Z0-9_]*$/)) {
          env[key] = valueParts.join('=');
        }
      }
    }

    return env;
  }

  private validateRootEnvironment(): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    // Determine which root file to check based on mode
    let rootFile: string;
    switch (this.mode) {
      case 'local':
        rootFile = '.env.local';
        break;
      case 'development':
        rootFile = '.env.dev';
        break;
      case 'production':
        rootFile = '.env.prod';
        break;
    }

    const rootEnv = this.loadEnvFile(rootFile);
    
    // Check for NEXT_PUBLIC_ variables in root environment (should not be there)
    const nextPublicInRoot = Object.keys(rootEnv).filter(key => key.startsWith('NEXT_PUBLIC_'));
    if (nextPublicInRoot.length > 0) {
      result.isValid = false;
      result.errors.push(`❌ Root environment (${rootFile}) contains client-exposed variables: ${nextPublicInRoot.join(', ')}`);
      result.errors.push(`   These should be moved to web environment files`);
    }

    // Check for missing required root variables
    const requiredRootVars = this.inventory.filter(key => 
      !key.nextPublic && (key.scope === 'root' || key.scope === 'both')
    );

    for (const requiredVar of requiredRootVars) {
      if (!(requiredVar.key in rootEnv)) {
        result.warnings.push(`⚠️  Missing root variable: ${requiredVar.key} (used in ${requiredVar.paths.length} files)`);
      }
    }

    return result;
  }

  private validateWebEnvironment(): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    // Determine which web file to check based on mode
    let webFile: string;
    switch (this.mode) {
      case 'local':
        webFile = 'web/.env.local';
        break;
      case 'development':
        webFile = 'web/.env.development';
        break;
      case 'production':
        webFile = 'web/.env.production';
        break;
    }

    const webEnv = this.loadEnvFile(webFile);
    
    // Check for server-only secrets in web environment without NEXT_PUBLIC_ prefix
    const serverOnlyInWeb = Object.keys(webEnv).filter(key => {
      if (key.startsWith('NEXT_PUBLIC_')) return false;
      const inventoryKey = this.inventory.find(k => k.key === key);
      return inventoryKey && !inventoryKey.nextPublic;
    });

    if (serverOnlyInWeb.length > 0) {
      result.isValid = false;
      result.errors.push(`❌ Web environment (${webFile}) contains server-only variables: ${serverOnlyInWeb.join(', ')}`);
      result.errors.push(`   These should be moved to root environment files or prefixed with NEXT_PUBLIC_ if client-safe`);
    }

    // Check for missing required web variables
    const requiredWebVars = this.inventory.filter(key => 
      key.scope === 'web' || key.scope === 'both'
    );

    for (const requiredVar of requiredWebVars) {
      if (!(requiredVar.key in webEnv)) {
        result.warnings.push(`⚠️  Missing web variable: ${requiredVar.key} (used in ${requiredVar.paths.length} files)`);
      }
    }

    return result;
  }

  private validateEnvironmentTier(): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    // Check for environment-specific requirements
    if (this.mode === 'production') {
      // Production should use HTTPS URLs
      const rootFile = '.env.prod';
      const webFile = 'web/.env.production';
      
      const rootEnv = this.loadEnvFile(rootFile);
      const webEnv = this.loadEnvFile(webFile);
      
      const urlVars = ['BASE_URL', 'APP_BASE_URL', 'NEXT_PUBLIC_SITE_URL'];
      for (const varName of urlVars) {
        const value = rootEnv[varName] || webEnv[varName];
        if (value && !value.startsWith('https://')) {
          result.errors.push(`❌ Production environment requires HTTPS URLs: ${varName}=${value}`);
        }
      }
      
      // Production should not use test keys
      const testKeyPatterns = ['sk_test_', 'pk_test_', 're_test_', 'whsec_test_'];
      const allEnv = { ...rootEnv, ...webEnv };
      
      for (const [key, value] of Object.entries(allEnv)) {
        for (const pattern of testKeyPatterns) {
          if (value.includes(pattern)) {
            result.errors.push(`❌ Production environment should not use test keys: ${key}`);
          }
        }
      }
    }

    return result;
  }

  public validate(): ValidationResult {
    console.log(`🔍 Validating ${this.mode} environment...\n`);
    
    const rootResult = this.validateRootEnvironment();
    const webResult = this.validateWebEnvironment();
    const tierResult = this.validateEnvironmentTier();
    
    const combinedResult: ValidationResult = {
      isValid: rootResult.isValid && webResult.isValid && tierResult.isValid,
      errors: [...rootResult.errors, ...webResult.errors, ...tierResult.errors],
      warnings: [...rootResult.warnings, ...webResult.warnings, ...tierResult.warnings]
    };

    return combinedResult;
  }

  public printSummary(): void {
    console.log(`📊 Environment Validation Summary (${this.mode})`);
    console.log(`   Total variables in inventory: ${this.inventory.length}`);
    console.log(`   Client-exposed variables: ${this.inventory.filter(k => k.nextPublic).length}`);
    console.log(`   Server-only variables: ${this.inventory.filter(k => !k.nextPublic).length}`);
    console.log(`   Root scope: ${this.inventory.filter(k => k.scope === 'root').length}`);
    console.log(`   Web scope: ${this.inventory.filter(k => k.scope === 'web').length}`);
    console.log(`   Both scopes: ${this.inventory.filter(k => k.scope === 'both').length}`);
  }
}

function main() {
  const mode = process.argv[2] as 'local' | 'development' | 'production';
  
  if (!mode || !['local', 'development', 'production'].includes(mode)) {
    console.error('Usage: node tools/env/validate.ts <local|development|production>');
    process.exit(1);
  }

  const validator = new EnvironmentValidator(mode);
  validator.printSummary();
  console.log('');
  
  const result = validator.validate();
  
  if (result.errors.length > 0) {
    console.log('❌ Validation Errors:');
    result.errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  Validation Warnings:');
    result.warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }
  
  if (result.isValid) {
    console.log('✅ Environment validation passed!');
    process.exit(0);
  } else {
    console.log('❌ Environment validation failed!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Fix the errors above');
    console.log('   2. Review warnings for missing variables');
    console.log('   3. Run validation again');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
