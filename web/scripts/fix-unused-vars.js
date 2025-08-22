#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to match unused variables
const patterns = [
  // Import statements
  { regex: /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g, type: 'import' },
  // Variable declarations
  { regex: /const\s+(\w+)\s*=\s*[^;]+;/g, type: 'const' },
  { regex: /let\s+(\w+)\s*=\s*[^;]+;/g, type: 'let' },
  { regex: /var\s+(\w+)\s*=\s*[^;]+;/g, type: 'var' },
  // Function parameters
  { regex: /function\s+\w+\s*\(([^)]*)\)/g, type: 'function' },
  { regex: /\(([^)]*)\)\s*=>/g, type: 'arrow' },
  // Destructuring
  { regex: /const\s*{([^}]+)}\s*=\s*[^;]+;/g, type: 'destructure' },
  { regex: /let\s*{([^}]+)}\s*=\s*[^;]+;/g, type: 'destructure' }
];

function fixUnusedVars(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Common unused variable names that should be prefixed
  const unusedVars = [
    'React', 'theme', 'isMobile', 'CheckCircle', 'Divider', 'scoreColor',
    'Container', 'Stack', 'Typography', 'Button', 'Link', 'Avatar', 'Chip',
    'Paper', 'FormControl', 'InputLabel', 'Select', 'MenuItem', 'IconButton',
    'TextField', 'ListItemSecondaryAction', 'userIds', 'TablePagination',
    'Tooltip', 'Box', 'Grid', 'loading', 'Dialog', 'DialogTitle', 'DialogContent',
    'DialogActions', 'FilterList', 'err', 'DeleteIcon', 'EditIcon', 'SchoolIcon',
    'UnitEditDialog', 'UnitMappingDialog', 'WarningIcon', 'error', 'Security',
    'PersonIcon', 'LanguageIcon', 'ThemeIcon', 'NotificationsIcon', 'SettingsIcon',
    'profile', 'user', 'request', 'req', 'section', 'index', 'page', 'testkit',
    'testUser', 'pathname', 'e', 'response', 'Slide', 'mobileOpen', 'setMobileOpen',
    'Fade', 'showProgress', 'setShowProgress', 'UpIcon', 'DownIcon', 'useRef',
    'invoiceUrl', 'SUPPORTED_LOCALES', 'newMinutes', 'periodFilter', 'manifestJson',
    'expiresIn', 'uploadData', 'NextRequest', 'createRouteHandlerClient', 'cookies',
    'createReadStream', 'createWriteStream', 'Readable', 'pipeline', 'priceError',
    'getSupabaseAdmin', 'progressError', 'seatTimeError', 'useEffect', 'redirect',
    'Unit', 'UnitProgress', 'ListItemText', 'formatDate', 'newPage'
  ];

  // Fix import statements
  content = content.replace(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g, (match, imports) => {
    const fixedImports = imports.split(',').map(imp => {
      const trimmed = imp.trim();
      const name = trimmed.split(' as ')[0].trim();
      if (unusedVars.includes(name)) {
        return trimmed.replace(name, `_${name}`);
      }
      return trimmed;
    }).join(', ');
    return match.replace(imports, fixedImports);
  });

  // Fix variable declarations
  unusedVars.forEach(varName => {
    const varRegex = new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g');
    content = content.replace(varRegex, `$1 _${varName}`);
    modified = true;
  });

  // Fix function parameters
  unusedVars.forEach(varName => {
    const paramRegex = new RegExp(`\\b${varName}\\b(?=\\s*,|\\s*\\))`, 'g');
    content = content.replace(paramRegex, `_${varName}`);
    modified = true;
  });

  // Fix destructuring
  unusedVars.forEach(varName => {
    const destructureRegex = new RegExp(`\\b${varName}\\b(?=\\s*,|\\s*})`, 'g');
    content = content.replace(destructureRegex, `_${varName}`);
    modified = true;
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
