---
title: "Accessibility"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/testing/STRATEGY.md>
  - </docs/DESIGN_SYSTEM.md>
---

# Accessibility

**Purpose & Outcome**  
This document outlines our commitment to WCAG 2.2 AA compliance, providing guidelines for creating accessible experiences for all users, including those with disabilities.

## Accessibility Standards

### WCAG 2.2 AA Compliance

We strive to meet **WCAG 2.2 AA** standards across all user interfaces:

- **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
- **Operable**: UI components and navigation must be operable
- **Understandable**: Information and operation of UI must be understandable
- **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents

### Key Requirements

| Principle | Requirement | Implementation |
|-----------|-------------|----------------|
| **Perceivable** | Text alternatives for non-text content | Alt text for images, captions for videos |
| **Perceivable** | Adaptable content | Responsive design, semantic HTML |
| **Perceivable** | Distinguishable content | Color contrast, text sizing |
| **Operable** | Keyboard accessible | All functionality available via keyboard |
| **Operable** | Enough time | No time limits, or adjustable time limits |
| **Operable** | Seizure and physical reaction | No flashing content |
| **Operable** | Navigable | Clear navigation, skip links |
| **Understandable** | Readable | Clear language, pronunciation |
| **Understandable** | Predictable | Consistent navigation, no unexpected changes |
| **Understandable** | Input assistance | Error identification, labels |
| **Robust** | Compatible | Valid HTML, ARIA support |

## Testing Strategy

### Automated Testing

#### ESLint Accessibility Rules

```javascript
// web/.eslintrc.json
{
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/no-access-key": "error",
    "jsx-a11y/no-autofocus": "error",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/no-noninteractive-tabindex": "error",
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/scope": "error",
    "jsx-a11y/tabindex-no-positive": "error"
  }
}
```

#### Playwright Accessibility Testing

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test('homepage accessibility', async ({ page }) => {
  await page.goto('/');
  
  // Run axe-core accessibility audit
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      axe.run((err, results) => {
        resolve(results);
      });
    });
  });
  
  expect(results.violations).toHaveLength(0);
});

test('all pages meet accessibility standards', async ({ page }) => {
  const pages = ['/', '/courses', '/signin', '/dashboard'];
  
  for (const pagePath of pages) {
    await page.goto(pagePath);
    const results = await page.evaluate(() => axe.run());
    expect(results.violations).toHaveLength(0);
  }
});
```

#### axe-core CLI Testing

```bash
# Run accessibility tests
npm --prefix web run axe:ci

# Test specific URLs
npx axe http://localhost:3000/ http://localhost:3000/courses

# Generate detailed report
npx axe http://localhost:3000 --verbose
```

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] **Tab Navigation**: All interactive elements reachable via Tab key
- [ ] **Focus Indicators**: Visible focus indicators on all focusable elements
- [ ] **Skip Links**: Skip to main content links work properly
- [ ] **No Keyboard Traps**: Users can navigate away from all components
- [ ] **Logical Tab Order**: Tab order follows logical reading order

#### Screen Reader Testing

- [ ] **Heading Structure**: Proper heading hierarchy (h1, h2, h3, etc.)
- [ ] **Alt Text**: All images have descriptive alt text
- [ ] **ARIA Labels**: Custom components have appropriate ARIA labels
- [ ] **Form Labels**: All form controls have associated labels
- [ ] **Landmarks**: Proper use of semantic landmarks (main, nav, aside, etc.)

#### Visual Design

- [ ] **Color Contrast**: Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] **Text Sizing**: Text can be resized to 200% without loss of functionality
- [ ] **Color Independence**: Information not conveyed by color alone
- [ ] **Focus Indicators**: Clear focus indicators visible in high contrast mode

## Implementation Guidelines

### Semantic HTML

#### Proper Heading Structure

```tsx
// ✅ Good - Proper heading hierarchy
<main>
  <h1>Course Dashboard</h1>
  <section>
    <h2>Current Progress</h2>
    <h3>Unit 1: Traffic Laws</h3>
  </section>
  <section>
    <h2>Available Courses</h2>
    <h3>California Driver Education</h3>
  </section>
</main>

// ❌ Bad - Missing or incorrect heading structure
<div>
  <div>Course Dashboard</div>
  <div>Current Progress</div>
  <div>Unit 1: Traffic Laws</div>
</div>
```

#### Form Accessibility

```tsx
// ✅ Good - Proper form labels and associations
<form>
  <label htmlFor="email">Email Address</label>
  <input 
    id="email" 
    type="email" 
    name="email" 
    required 
    aria-describedby="email-help"
  />
  <div id="email-help">Enter your email address to receive updates</div>
  
  <fieldset>
    <legend>Course Preferences</legend>
    <label>
      <input type="checkbox" name="notifications" />
      Receive email notifications
    </label>
  </fieldset>
</form>

// ❌ Bad - Missing labels and associations
<form>
  <input type="email" placeholder="Email" />
  <input type="checkbox" />
  Receive notifications
</form>
```

### ARIA Implementation

#### Custom Components

```tsx
// ✅ Good - Proper ARIA implementation
const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      hidden={!isOpen}
    >
      <h2 id="modal-title">{title}</h2>
      <div id="modal-description">{children}</div>
      <button onClick={onClose} aria-label="Close modal">×</button>
    </div>
  );
};

// ❌ Bad - Missing ARIA attributes
const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <div hidden={!isOpen}>
      <h2>{title}</h2>
      <div>{children}</div>
      <button onClick={onClose}>×</button>
    </div>
  );
};
```

#### Interactive Elements

```tsx
// ✅ Good - Proper button implementation
<button 
  onClick={handleClick}
  aria-expanded={isExpanded}
  aria-controls="dropdown-menu"
>
  {isExpanded ? 'Close Menu' : 'Open Menu'}
</button>

// ❌ Bad - Using div for interactive element
<div onClick={handleClick} className="button">
  {isExpanded ? 'Close Menu' : 'Open Menu'}
</div>
```

### Color and Contrast

#### Color Contrast Requirements

| Text Type | Contrast Ratio | Example |
|-----------|----------------|---------|
| **Normal Text** | 4.5:1 minimum | Body text, labels |
| **Large Text** | 3:1 minimum | Headings, large buttons |
| **UI Components** | 3:1 minimum | Icons, borders |

#### Color Independence

```tsx
// ✅ Good - Information not conveyed by color alone
<div className="status">
  <span className="status-icon" aria-hidden="true">●</span>
  <span className="status-text">Error: Invalid email address</span>
</div>

// ❌ Bad - Information conveyed only by color
<div className="status error">Invalid email address</div>
```

### Focus Management

#### Skip Links

```tsx
// Skip to main content link
<a 
  href="#main-content" 
  className="skip-link"
  style={{
    position: 'absolute',
    top: '-40px',
    left: '6px',
    zIndex: 1000,
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    ':focus': {
      top: '6px',
    }
  }}
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

#### Focus Trapping

```tsx
// Modal focus trap
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Trap focus in modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
};
```

## Component Accessibility

### Button Components

```tsx
// Accessible button component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props 
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`button button--${variant} button--${size}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Form Components

```tsx
// Accessible form field component
interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = ({ 
  label, 
  id, 
  error, 
  helpText, 
  required = false,
  children 
}: FormFieldProps) => {
  return (
    <div className="form-field">
      <label 
        htmlFor={id} 
        className={`form-label ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      
      {children}
      
      {helpText && (
        <div id={`${id}-help`} className="help-text">
          {helpText}
        </div>
      )}
      
      {error && (
        <div 
          id={`${id}-error`} 
          className="error-text" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
```

### Navigation Components

```tsx
// Accessible navigation component
const Navigation = ({ items }: { items: NavItem[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <nav aria-label="Main navigation">
      <button
        aria-expanded={isExpanded}
        aria-controls="nav-menu"
        aria-label="Toggle navigation menu"
        onClick={() => setIsExpanded(!isExpanded)}
        className="nav-toggle"
      >
        <span className="sr-only">Menu</span>
        <span aria-hidden="true">☰</span>
      </button>
      
      <ul 
        id="nav-menu" 
        className={`nav-menu ${isExpanded ? 'expanded' : ''}`}
        role="menubar"
      >
        {items.map((item) => (
          <li key={item.id} role="none">
            <a 
              href={item.href}
              role="menuitem"
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

## Testing and Validation

### Automated Testing Commands

```bash
# Run ESLint accessibility rules
npm --prefix web run lint:a11y

# Run axe-core tests
npm --prefix web run axe:ci

# Run Playwright accessibility tests
npm --prefix web run test:e2e --grep "accessibility"

# Test specific pages
npx axe http://localhost:3000/ --exit 1
```

### Manual Testing Tools

#### Screen Reader Testing

- **NVDA** (Windows) - Free screen reader
- **JAWS** (Windows) - Commercial screen reader
- **VoiceOver** (macOS) - Built-in screen reader
- **TalkBack** (Android) - Built-in screen reader

#### Keyboard Navigation Testing

1. **Tab Navigation**: Use Tab to navigate through all interactive elements
2. **Arrow Keys**: Test arrow key navigation in custom components
3. **Enter/Space**: Test activation of buttons and links
4. **Escape**: Test closing of modals and dropdowns

#### Color Contrast Testing

- **WebAIM Contrast Checker**: Online tool for checking contrast ratios
- **Chrome DevTools**: Built-in contrast checking
- **axe DevTools**: Browser extension with contrast checking

### Testing Checklist

#### Page-Level Testing

- [ ] **Page Title**: Descriptive and unique page titles
- [ ] **Language Declaration**: Proper `lang` attribute on HTML element
- [ ] **Skip Links**: Skip to main content links work
- [ ] **Heading Structure**: Logical heading hierarchy
- [ ] **Landmarks**: Proper use of semantic landmarks

#### Form Testing

- [ ] **Labels**: All form controls have associated labels
- [ ] **Error Messages**: Clear error messages with proper ARIA attributes
- [ ] **Required Fields**: Required fields are clearly marked
- [ ] **Validation**: Real-time validation with accessible feedback

#### Interactive Components

- [ ] **Buttons**: All buttons have accessible names
- [ ] **Links**: Links have descriptive text
- [ ] **Images**: All images have appropriate alt text
- [ ] **Custom Controls**: Custom controls have proper ARIA attributes

## Common Issues and Solutions

### Missing Alt Text

```tsx
// ❌ Bad - Missing alt text
<img src="/logo.png" />

// ✅ Good - Descriptive alt text
<img src="/logo.png" alt="Permit School Logo" />

// ✅ Good - Decorative image
<img src="/decoration.png" alt="" role="presentation" />
```

### Color-Only Information

```tsx
// ❌ Bad - Information conveyed only by color
<div className="status success">Operation completed successfully</div>

// ✅ Good - Multiple ways to convey information
<div className="status success" role="status">
  <span aria-hidden="true">✓</span>
  <span>Operation completed successfully</span>
</div>
```

### Missing Focus Indicators

```css
/* ✅ Good - Clear focus indicators */
button:focus,
a:focus,
input:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* For custom components */
.custom-button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

### Improper Heading Structure

```tsx
// ❌ Bad - Skipping heading levels
<h1>Page Title</h1>
<h3>Section Title</h3> {/* Missing h2 */}

// ✅ Good - Proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

## Resources and References

### WCAG Guidelines

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG 2.2 Success Criteria](https://www.w3.org/WAI/WCAG22/quickref/#success-criteria)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)

### Testing Tools

- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing library
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Accessibility auditing

### Screen Readers

- [NVDA](https://www.nvaccess.org/) - Free Windows screen reader
- [VoiceOver](https://www.apple.com/accessibility/vision/) - macOS built-in screen reader
- [TalkBack](https://support.google.com/accessibility/android/answer/6283673) - Android screen reader

### ARIA Resources

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA Labels and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/labels-and-descriptions/)
- [ARIA States and Properties](https://www.w3.org/WAI/ARIA/apg/practices/states-and-properties/)

---

**Next**: [Performance](PERFORMANCE.md) - Performance monitoring and optimization strategies
