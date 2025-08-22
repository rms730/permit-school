#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function removeUnusedImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove specific unused imports
  const unusedImports = [
    'React', 'CheckCircle', 'Divider', 'Container', 'Stack', 'Typography', 
    'Button', 'Link', 'Avatar', 'Chip', 'Paper', 'FormControl', 'InputLabel', 
    'Select', 'MenuItem', 'IconButton', 'TextField', 'ListItemSecondaryAction',
    'TablePagination', 'Tooltip', 'Box', 'Grid', 'Dialog', 'DialogTitle', 
    'DialogContent', 'DialogActions', 'FilterList', 'DeleteIcon', 'EditIcon', 
    'SchoolIcon', 'UnitEditDialog', 'UnitMappingDialog', 'WarningIcon', 
    'Security', 'PersonIcon', 'LanguageIcon', 'ThemeIcon', 'NotificationsIcon', 
    'SettingsIcon', 'Slide', 'Fade', 'ListItemText', 'UpIcon', 'DownIcon', 
    'useRef', 'useEffect', 'redirect', 'Unit', 'UnitProgress', 'ListItem',
    'NextRequest', 'createRouteHandlerClient', 'cookies', 'createReadStream',
    'createWriteStream', 'Readable', 'pipeline', 'getSupabaseAdmin',
    'LinearProgress', 'SUPPORTED_LOCALES'
  ];

  // Remove React import if it's the only import
  if (content.includes('import React from "react"') && !content.includes('React.')) {
    content = content.replace(/import React from "react";?\n?/g, '');
    modified = true;
  }

  // Remove unused imports from destructured imports
  unusedImports.forEach(importName => {
    // Remove from destructured imports
    const destructuredRegex = new RegExp(`import\\s+{[^}]*\\b${importName}\\b[^}]*}\\s+from\\s+['"][^'"]+['"]`, 'g');
    const matches = content.match(destructuredRegex);
    
    if (matches) {
      matches.forEach(match => {
        // Extract the import list and remove the unused import
        const importListMatch = match.match(/import\s+{([^}]*)}\s+from\s+['"]([^'"]+)['"]/);
        if (importListMatch) {
          const importList = importListMatch[1];
          const fromPath = importListMatch[2];
          
          // Remove the unused import from the list
          const newImportList = importList
            .split(',')
            .map(imp => imp.trim())
            .filter(imp => !imp.includes(importName))
            .join(', ');
          
          if (newImportList.trim()) {
            const newImport = `import { ${newImportList} } from "${fromPath}"`;
            content = content.replace(match, newImport);
          } else {
            // If no imports left, remove the entire import statement
            content = content.replace(match + '\n', '');
          }
          modified = true;
        }
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Removed unused imports in ${filePath}`);
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
      removeUnusedImports(filePath);
    }
  });
}

// Start from src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
  console.log('Finished removing unused imports');
} else {
  console.error('src directory not found');
  process.exit(1);
}
