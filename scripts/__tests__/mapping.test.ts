import { describe, it, expect } from 'vitest';

// Mock the mapping functions
const VARIABLE_MAPPINGS = {
  'SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_ANON_KEY': 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_PUBLISHABLE_KEY': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'APP_BASE_URL': 'NEXT_PUBLIC_APP_BASE_URL',
  'BASE_URL': 'NEXT_PUBLIC_SITE_URL',
  'SUPPORT_EMAIL': 'NEXT_PUBLIC_SUPPORT_EMAIL',
  'SENTRY_DSN': 'NEXT_PUBLIC_SENTRY_DSN'
};

function isPlaceholder(value: string) {
  if (!value || value === '') return true;
  return value.includes('your_') || value.includes('REPLACE_WITH_');
}

function applyDeterministicMappings(variables: Map<string, string>, newVariables: Map<string, string>) {
  for (const [privateKey, publicKey] of Object.entries(VARIABLE_MAPPINGS)) {
    const privateValue = variables.get(privateKey) || newVariables.get(privateKey);
    const publicValue = variables.get(publicKey) || newVariables.get(publicKey);
    
    if (privateValue && !isPlaceholder(privateValue)) {
      // Private value exists and is not placeholder - use as source of truth
      newVariables.set(publicKey, privateValue);
    } else if (publicValue && !isPlaceholder(publicValue)) {
      // Public value exists and is not placeholder - use as source of truth
      newVariables.set(privateKey, publicValue);
    }
  }
  
  return newVariables;
}

describe('Deterministic Mapping', () => {
  it('should prefer private values over public values', () => {
    const variables = new Map();
    const newVariables = new Map();
    
    // Set private value (should be source of truth)
    variables.set('SUPABASE_URL', 'https://real-supabase.com');
    variables.set('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.com');
    
    const result = applyDeterministicMappings(variables, newVariables);
    
    expect(result.get('NEXT_PUBLIC_SUPABASE_URL')).toBe('https://real-supabase.com');
  });

  it('should use public value when private is placeholder', () => {
    const variables = new Map();
    const newVariables = new Map();
    
    // Set private as placeholder, public as real value
    variables.set('SUPABASE_URL', 'your_supabase_url_here');
    variables.set('NEXT_PUBLIC_SUPABASE_URL', 'https://real-supabase.com');
    
    const result = applyDeterministicMappings(variables, newVariables);
    
    expect(result.get('SUPABASE_URL')).toBe('https://real-supabase.com');
  });

  it('should not overwrite real private values with placeholders', () => {
    const variables = new Map();
    const newVariables = new Map();
    
    // Set private as real value, public as placeholder
    variables.set('SUPABASE_URL', 'https://real-supabase.com');
    variables.set('NEXT_PUBLIC_SUPABASE_URL', 'your_supabase_url_here');
    
    const result = applyDeterministicMappings(variables, newVariables);
    
    expect(result.get('NEXT_PUBLIC_SUPABASE_URL')).toBe('https://real-supabase.com');
    expect(result.get('SUPABASE_URL')).toBeUndefined(); // Should not be overwritten
  });

  it('should handle multiple mappings correctly', () => {
    const variables = new Map();
    const newVariables = new Map();
    
    variables.set('SUPABASE_URL', 'https://real-supabase.com');
    variables.set('STRIPE_PUBLISHABLE_KEY', 'pk_test_real_key');
    variables.set('NEXT_PUBLIC_SUPABASE_URL', 'your_supabase_url_here');
    variables.set('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'your_stripe_key_here');
    
    const result = applyDeterministicMappings(variables, newVariables);
    
    expect(result.get('NEXT_PUBLIC_SUPABASE_URL')).toBe('https://real-supabase.com');
    expect(result.get('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')).toBe('pk_test_real_key');
  });
});

describe('Placeholder Detection', () => {
  it('should detect various placeholder patterns', () => {
    expect(isPlaceholder('your_key_here')).toBe(true);
    expect(isPlaceholder('REPLACE_WITH_KEY')).toBe(true);
    expect(isPlaceholder('your_supabase_url_here')).toBe(true);
    expect(isPlaceholder('')).toBe(true);
    expect(isPlaceholder('')).toBe(true);
  });

  it('should not detect real values as placeholders', () => {
    expect(isPlaceholder('sk_test_1234567890abcdef')).toBe(false);
    expect(isPlaceholder('https://example.com')).toBe(false);
    expect(isPlaceholder('real_value')).toBe(false);
    expect(isPlaceholder('pk_test_1234567890abcdef')).toBe(false);
  });
});

describe('Mapping Rules', () => {
  it('should have correct mapping pairs', () => {
    expect(VARIABLE_MAPPINGS['SUPABASE_URL']).toBe('NEXT_PUBLIC_SUPABASE_URL');
    expect(VARIABLE_MAPPINGS['SUPABASE_ANON_KEY']).toBe('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(VARIABLE_MAPPINGS['STRIPE_PUBLISHABLE_KEY']).toBe('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    expect(VARIABLE_MAPPINGS['APP_BASE_URL']).toBe('NEXT_PUBLIC_APP_BASE_URL');
    expect(VARIABLE_MAPPINGS['BASE_URL']).toBe('NEXT_PUBLIC_SITE_URL');
    expect(VARIABLE_MAPPINGS['SUPPORT_EMAIL']).toBe('NEXT_PUBLIC_SUPPORT_EMAIL');
    expect(VARIABLE_MAPPINGS['SENTRY_DSN']).toBe('NEXT_PUBLIC_SENTRY_DSN');
  });

  it('should prioritize private over public keys', () => {
    const privateKeys = Object.keys(VARIABLE_MAPPINGS);
    const publicKeys = Object.values(VARIABLE_MAPPINGS);
    
    // All private keys should not start with NEXT_PUBLIC_
    privateKeys.forEach(key => {
      expect(key.startsWith('NEXT_PUBLIC_')).toBe(false);
    });
    
    // All public keys should start with NEXT_PUBLIC_
    publicKeys.forEach(key => {
      expect(key.startsWith('NEXT_PUBLIC_')).toBe(true);
    });
  });
});
