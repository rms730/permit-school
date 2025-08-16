# Design System — Permit School

## Overview

The Permit School design system is built for **teen-friendly UX** with a focus on accessibility, engagement, and modern design principles. This document outlines our design tokens, component anatomy, and implementation guidelines.

## Design Philosophy

### Core Principles

- **Teen-Friendly**: Engaging, energetic, yet professional
- **Accessible**: WCAG 2.2 AA compliance
- **Mobile-First**: Touch-friendly, responsive design
- **Inclusive**: Clear, readable, and supportive

### Target Audience

- **Primary**: 13-17 year olds preparing for permit tests
- **Secondary**: Parents/guardians monitoring progress
- **Tertiary**: Educators and administrators

## Color Palette

### Primary Colors

```css
/* Teal/Cyan - Energetic yet professional */
primary: {
  main: "#00BCD4",    /* Primary brand color */
  light: "#4DD0E1",   /* Hover states, highlights */
  dark: "#0097A7",    /* Active states, emphasis */
  contrastText: "#ffffff"
}

/* Violet - Modern and engaging */
secondary: {
  main: "#7C4DFF",    /* Secondary actions */
  light: "#B388FF",   /* Subtle accents */
  dark: "#512DA8",    /* Strong emphasis */
  contrastText: "#ffffff"
}
```

### Semantic Colors

```css
success: {
  main: "#4CAF50",    /* Success states, completions */
  light: "#81C784",
  dark: "#388E3C"
}

warning: {
  main: "#FF9800",    /* Warnings, attention */
  light: "#FFB74D",
  dark: "#F57C00"
}

error: {
  main: "#F44336",    /* Errors, failures */
  light: "#E57373",
  dark: "#D32F2F"
}
```

### Neutral Colors

```css
text: {
  primary: "#1A1A1A",     /* Main text */
  secondary: "#666666"    /* Secondary text */
}

background: {
  default: "#FAFAFA",     /* Page background */
  paper: "#FFFFFF"        /* Card/surface background */
}

divider: "#E0E0E0"        /* Borders, separators */
```

### Accessibility

- **Contrast ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color independence**: No information conveyed by color alone
- **Focus indicators**: Clear, visible focus outlines

## Typography

### Font Stack

```css
/* Google Fonts via next/font */
fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'

/* Headings */
h1-h6: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif'
```

### Type Scale

```css
h1: {
  fontSize: '2.5rem',
  fontWeight: 700,
  lineHeight: 1.2
}

h2: {
  fontSize: '2rem',
  fontWeight: 600,
  lineHeight: 1.3
}

h3: {
  fontSize: '1.75rem',
  fontWeight: 600,
  lineHeight: 1.3
}

h4: {
  fontSize: '1.5rem',
  fontWeight: 600,
  lineHeight: 1.4
}

h5: {
  fontSize: '1.25rem',
  fontWeight: 600,
  lineHeight: 1.4
}

h6: {
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.4
}

body1: {
  fontSize: '1rem',
  lineHeight: 1.6
}

body2: {
  fontSize: '0.875rem',
  lineHeight: 1.6
}

button: {
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.875rem'
}
```

## Spacing System

### Base Unit

- **8px** base spacing unit
- All spacing values are multiples of 8px

### Common Spacing Values

```css
xs: 4px    /* 0.5 * base */
sm: 8px    /* 1 * base */
md: 16px   /* 2 * base */
lg: 24px   /* 3 * base */
xl: 32px   /* 4 * base */
xxl: 48px  /* 6 * base */
```

### Component Spacing

```css
/* Card padding */
cardPadding: 24px

/* Button padding */
buttonPadding: '12px 24px'

/* Form field spacing */
formSpacing: 16px

/* Section spacing */
sectionSpacing: 48px
```

## Border Radius

### Values

```css
xs: 4px     /* Small elements */
sm: 8px     /* Buttons, inputs */
md: 12px    /* Cards, containers */
lg: 16px    /* Large containers */
xl: 20px    /* Hero sections */
```

### Usage Guidelines

- **Buttons**: 12px radius for modern feel
- **Cards**: 16px radius for soft appearance
- **Inputs**: 12px radius for consistency
- **Hero sections**: 20px radius for impact

## Shadows

### Elevation Levels

```css
/* Level 1 - Subtle elevation */
shadow1: '0 2px 8px rgba(0, 0, 0, 0.1)'

/* Level 2 - Medium elevation */
shadow2: '0 4px 20px rgba(0, 0, 0, 0.08)'

/* Level 3 - High elevation */
shadow3: '0 8px 30px rgba(0, 0, 0, 0.12)'

/* Level 4 - Maximum elevation */
shadow4: '0 12px 40px rgba(0, 0, 0, 0.15)'
```

### Usage Guidelines

- **Cards**: Level 2 shadow by default, Level 3 on hover
- **Buttons**: Level 1 shadow, Level 2 on hover
- **Modals**: Level 4 shadow
- **AppBar**: Level 1 shadow with backdrop blur

## Component Anatomy

### Buttons

#### Primary Button

```css
/* Default state */
background: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)'
borderRadius: 12px
padding: '12px 24px'
minHeight: 44px
fontWeight: 600
textTransform: 'none'

/* Hover state */
background: 'linear-gradient(135deg, #0097A7 0%, #00BCD4 100%)'
boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
transform: 'translateY(-1px)'

/* Focus state */
outline: '3px solid #00BCD4'
outlineOffset: '2px'
```

#### Secondary Button

```css
/* Default state */
border: '2px solid #00BCD4'
color: '#00BCD4'
borderRadius: 12px
padding: '12px 24px'
minHeight: 44px

/* Hover state */
backgroundColor: 'rgba(0, 188, 212, 0.1)'
borderColor: '#0097A7'
```

### Cards

#### Standard Card

```css
/* Default state */
borderRadius: 16px
boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
border: '1px solid #F0F0F0'
transition: 'all 0.2s ease-in-out'

/* Hover state */
boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
transform: 'translateY(-2px)'
```

### Input Fields

#### Text Input

```css
/* Container */
borderRadius: 12px

/* Focus state */
borderColor: '#00BCD4'
borderWidth: '2px'

/* Hover state */
borderColor: '#4DD0E1'
```

### AppBar

#### Modern AppBar

```css
/* Background */
backgroundColor: 'rgba(255, 255, 255, 0.95)'
backdropFilter: 'blur(10px)'
boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
borderBottom: '1px solid #E0E0E0'
```

## Responsive Design

### Breakpoints

```css
xs: 0px      /* Mobile portrait */
sm: 600px    /* Mobile landscape */
md: 900px    /* Tablet */
lg: 1200px   /* Desktop */
xl: 1536px   /* Large desktop */
```

### Mobile-First Guidelines

- **Touch targets**: Minimum 44px for all interactive elements
- **Spacing**: Increase spacing on mobile for better touch interaction
- **Typography**: Maintain readability across all screen sizes
- **Navigation**: Collapsible drawer for mobile navigation

### Responsive Patterns

```css
/* Stack on mobile, row on desktop */
direction: { xs: 'column', md: 'row' }

/* Full width on mobile, contained on desktop */
maxWidth: { xs: '100%', md: 400 }

/* Smaller text on mobile */
fontSize: { xs: '1rem', md: '1.25rem' }
```

## Animation & Transitions

### Duration

```css
fast: '0.15s'    /* Quick feedback */
normal: '0.2s'   /* Standard transitions */
slow: '0.3s'     /* Complex animations */
```

### Easing

```css
easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
```

### Common Animations

```css
/* Button hover */
transition: 'all 0.2s ease-in-out'

/* Card hover */
transition: 'all 0.3s ease'

/* Page transitions */
transition: 'opacity 0.2s ease-in-out'
```

## Accessibility Guidelines

### Focus Management

- **Visible focus**: Clear focus indicators on all interactive elements
- **Focus order**: Logical tab order following visual layout
- **Skip links**: Provide skip navigation for keyboard users

### Color & Contrast

- **Minimum contrast**: 4.5:1 for normal text, 3:1 for large text
- **Color independence**: Never rely solely on color to convey information
- **High contrast mode**: Support system high contrast preferences

### Screen Reader Support

- **Semantic HTML**: Use proper heading hierarchy and landmarks
- **ARIA labels**: Provide descriptive labels for complex interactions
- **Alt text**: Meaningful alt text for all images

### Keyboard Navigation

- **Full keyboard access**: All functionality accessible via keyboard
- **Logical tab order**: Tab order follows visual layout
- **Keyboard shortcuts**: Provide shortcuts for common actions

## Implementation Guidelines

### MUI Integration

- Use MUI's `sx` prop for custom styling
- Leverage MUI's theme system for consistency
- Override component styles through theme customization

### CSS-in-JS Best Practices

- Use theme tokens for all values
- Maintain consistent naming conventions
- Keep styles close to components

### Performance Considerations

- Minimize CSS bundle size
- Use CSS-in-JS efficiently
- Optimize for critical rendering path

## Future Considerations

### Dark Mode

- Prepare color tokens for dark mode
- Consider contrast ratios in both themes
- Plan for system preference detection

### Internationalization

- Support for right-to-left languages
- Consider text length variations
- Plan for cultural color preferences

### Advanced Interactions

- Micro-interactions for engagement
- Loading states and skeleton screens
- Progressive disclosure patterns
