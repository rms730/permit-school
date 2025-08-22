#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixUnusedVars(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Common unused variable names that should be prefixed
  const unusedVars = [
    'theme', 'isMobile', 'scoreColor', 'userIds', 'loading', 'err', 'error', 
    'profile', 'user', 'request', 'req', 'section', 'index', 'page', 'testkit',
    'testUser', 'pathname', 'e', 'response', 'mobileOpen', 'setMobileOpen',
    'showProgress', 'setShowProgress', 'invoiceUrl', 'newMinutes', 'periodFilter', 
    'manifestJson', 'expiresIn', 'uploadData', 'priceError', 'progressError', 
    'seatTimeError', 'formatDate', 'newPage'
  ];

  // Fix variable declarations (const/let/var)
  unusedVars.forEach(varName => {
    const varRegex = new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g');
    if (content.match(varRegex)) {
      content = content.replace(varRegex, `$1 _${varName}`);
      modified = true;
    }
  });

  // Fix function parameters
  unusedVars.forEach(varName => {
    const paramRegex = new RegExp(`\\b${varName}\\b(?=\\s*,|\\s*\\))`, 'g');
    if (content.match(paramRegex)) {
      content = content.replace(paramRegex, `_${varName}`);
      modified = true;
    }
  });

  // Fix destructuring assignments
  unusedVars.forEach(varName => {
    const destructureRegex = new RegExp(`\\b${varName}\\b(?=\\s*,|\\s*})`, 'g');
    if (content.match(destructureRegex)) {
      content = content.replace(destructureRegex, `_${varName}`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed unused variables in ${filePath}`);
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
      fixUnusedVars(filePath);
    }
  });
}

// Start from src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
  console.log('Finished fixing unused variables');
} else {
  console.error('src directory not found');
  process.exit(1);
}
