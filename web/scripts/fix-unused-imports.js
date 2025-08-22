#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixUnusedImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Common unused import names that should be prefixed
  const unusedImports = [
    'React', 'CheckCircle', 'Divider', 'Container', 'Stack', 'Typography', 
    'Button', 'Link', 'Avatar', 'Chip', 'Paper', 'FormControl', 'InputLabel', 
    'Select', 'MenuItem', 'IconButton', 'TextField', 'ListItemSecondaryAction',
    'TablePagination', 'Tooltip', 'Box', 'Grid', 'Dialog', 'DialogTitle', 
    'DialogContent', 'DialogActions', 'FilterList', 'DeleteIcon', 'EditIcon', 
    'SchoolIcon', 'UnitEditDialog', 'UnitMappingDialog', 'WarningIcon', 
    'Security', 'PersonIcon', 'LanguageIcon', 'ThemeIcon', 'NotificationsIcon', 
    'SettingsIcon', 'Slide', 'Fade', 'ListItemText', 'UpIcon', 'DownIcon', 
    'useRef', 'useEffect', 'redirect', 'Unit', 'UnitProgress', 'ListItem'
  ];

  // Fix import statements
  unusedImports.forEach(importName => {
    // Match import statements with the specific import name
    const importRegex = new RegExp(`import\\s+{[^}]*\\b${importName}\\b[^}]*}\\s+from\\s+['"][^'"]+['"]`, 'g');
    if (content.match(importRegex)) {
      content = content.replace(new RegExp(`\\b${importName}\\b`, 'g'), `_${importName}`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed unused imports in ${filePath}`);
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
      fixUnusedImports(filePath);
    }
  });
}

// Start from src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
  console.log('Finished fixing unused imports');
} else {
  console.error('src directory not found');
  process.exit(1);
}
