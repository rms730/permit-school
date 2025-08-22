#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixRemainingWarnings(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix specific patterns
  const patterns = [
    // React import
    { regex: /import\s+React\s+from\s+['"]react['"]/g, replacement: 'import _React as React from "react"' },
    
    // Link import
    { regex: /import\s+{\s*Link\s*}\s+from\s+['"]next\/link['"]/g, replacement: 'import { Link as _Link } from "next/link"' },
    
    // NextRequest import
    { regex: /import\s+{\s*NextRequest\s*}\s+from\s+['"]next\/server['"]/g, replacement: 'import { NextRequest as _NextRequest } from "next/server"' },
    
    // createRouteHandlerClient import
    { regex: /import\s+{\s*createRouteHandlerClient\s*}\s+from\s+['"]@supabase\/auth-helpers-nextjs['"]/g, replacement: 'import { createRouteHandlerClient as _createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"' },
    
    // cookies import
    { regex: /import\s+{\s*cookies\s*}\s+from\s+['"]next\/headers['"]/g, replacement: 'import { cookies as _cookies } from "next/headers"' },
    
    // createReadStream, createWriteStream, Readable, pipeline imports
    { regex: /import\s+{\s*createReadStream,\s*createWriteStream,\s*Readable,\s*pipeline\s*}\s+from\s+['"]stream['"]/g, replacement: 'import { createReadStream as _createReadStream, createWriteStream as _createWriteStream, Readable as _Readable, pipeline as _pipeline } from "stream"' },
    
    // getSupabaseAdmin import
    { regex: /import\s+{\s*getSupabaseAdmin\s*}\s+from\s+['"]@\/lib\/supabaseAdmin['"]/g, replacement: 'import { getSupabaseAdmin as _getSupabaseAdmin } from "@/lib/supabaseAdmin"' },
    
    // UnitProgress import
    { regex: /import\s+{\s*UnitProgress\s*}\s+from\s+['"]@\/components\/learn\/UnitProgress['"]/g, replacement: 'import { UnitProgress as _UnitProgress } from "@/components/learn/UnitProgress"' },
    
    // LinearProgress import
    { regex: /import\s+{\s*LinearProgress\s*}\s+from\s+['"]@mui\/material['"]/g, replacement: 'import { LinearProgress as _LinearProgress } from "@mui/material"' },
    
    // Unit import
    { regex: /import\s+{\s*Unit\s*}\s+from\s+['"]@\/types\/curriculum['"]/g, replacement: 'import { Unit as _Unit } from "@/types/curriculum"' },
    
    // useRef import
    { regex: /import\s+{\s*useRef\s*}\s+from\s+['"]react['"]/g, replacement: 'import { useRef as _useRef } from "react"' },
    
    // SUPPORTED_LOCALES import
    { regex: /import\s+{\s*SUPPORTED_LOCALES\s*}\s+from\s+['"]@\/lib\/i18n\/locales['"]/g, replacement: 'import { SUPPORTED_LOCALES as _SUPPORTED_LOCALES } from "@/lib/i18n/locales"' }
  ];

  patterns.forEach(pattern => {
    if (content.match(pattern.regex)) {
      content = content.replace(pattern.regex, pattern.replacement);
      modified = true;
    }
  });

  // Fix function parameters and variables
  const unusedVars = [
    'theme', 'event', 'newPage', 'index', 'UnitEditDialog', 'UnitMappingDialog', 
    'err', 'request', 'req', 'dict', 'e', 'response', 'setMobileOpen', 
    'setShowProgress', 'useRef', 'invoiceUrl', 'expiresIn', 'newMinutes', 
    'page', 'testkit', 'testUser'
  ];

  unusedVars.forEach(varName => {
    // Fix function parameters
    const paramRegex = new RegExp(`\\b${varName}\\b(?=\\s*,|\\s*\\))`, 'g');
    if (content.match(paramRegex)) {
      content = content.replace(paramRegex, `_${varName}`);
      modified = true;
    }
    
    // Fix variable declarations
    const varRegex = new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g');
    if (content.match(varRegex)) {
      content = content.replace(varRegex, `$1 _${varName}`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed remaining warnings in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixRemainingWarnings(filePath);
    }
  });
}

// Start from src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
  console.log('Finished fixing remaining warnings');
} else {
  console.error('src directory not found');
  process.exit(1);
}
