import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, type SupportedLocale } from '../locales';

describe('locales', () => {
  describe('SUPPORTED_LOCALES', () => {
    it('contains the expected locales', () => {
      expect(SUPPORTED_LOCALES).toEqual(['en', 'es']);
    });

    it('is a readonly array', () => {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });

    it('contains only string values', () => {
      SUPPORTED_LOCALES.forEach(locale => {
        expect(typeof locale).toBe('string');
      });
    });
  });

  describe('DEFAULT_LOCALE', () => {
    it('is set to English', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });

    it('is included in supported locales', () => {
      expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
    });

    it('is of type SupportedLocale', () => {
      const locale: SupportedLocale = DEFAULT_LOCALE;
      expect(locale).toBe('en');
    });
  });

  describe('isValidLocale', () => {
    it('returns true for valid locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('es')).toBe(true);
    });

    it('returns false for invalid locales', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('pt')).toBe(false);
      expect(isValidLocale('it')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidLocale('')).toBe(false);
    });

    it('returns false for case variations', () => {
      expect(isValidLocale('EN')).toBe(false);
      expect(isValidLocale('En')).toBe(false);
      expect(isValidLocale('eN')).toBe(false);
      expect(isValidLocale('ES')).toBe(false);
      expect(isValidLocale('Es')).toBe(false);
      expect(isValidLocale('eS')).toBe(false);
    });

    it('returns false for partial matches', () => {
      expect(isValidLocale('en-US')).toBe(false);
      expect(isValidLocale('es-MX')).toBe(false);
      expect(isValidLocale('en_')).toBe(false);
      expect(isValidLocale('_en')).toBe(false);
    });

    it('returns false for non-string inputs', () => {
      // @ts-expect-error - testing invalid input
      expect(isValidLocale(123)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidLocale(null)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidLocale(undefined)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidLocale({})).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidLocale([])).toBe(false);
    });

    it('returns false for whitespace strings', () => {
      expect(isValidLocale(' ')).toBe(false);
      expect(isValidLocale('  ')).toBe(false);
      expect(isValidLocale('\t')).toBe(false);
      expect(isValidLocale('\n')).toBe(false);
    });

    it('returns false for special characters', () => {
      expect(isValidLocale('en!')).toBe(false);
      expect(isValidLocale('es@')).toBe(false);
      expect(isValidLocale('en#')).toBe(false);
      expect(isValidLocale('es$')).toBe(false);
    });

    it('returns false for numbers', () => {
      expect(isValidLocale('1')).toBe(false);
      expect(isValidLocale('123')).toBe(false);
      expect(isValidLocale('0')).toBe(false);
    });

    it('returns false for mixed content', () => {
      expect(isValidLocale('en123')).toBe(false);
      expect(isValidLocale('123en')).toBe(false);
      expect(isValidLocale('es456')).toBe(false);
      expect(isValidLocale('456es')).toBe(false);
    });

    it('works as a type guard', () => {
      const testLocale = 'en';
      if (isValidLocale(testLocale)) {
        // TypeScript should know this is a SupportedLocale
        const locale: SupportedLocale = testLocale;
        expect(locale).toBe('en');
      } else {
        fail('Should not reach here');
      }
    });

    it('handles all supported locales', () => {
      SUPPORTED_LOCALES.forEach(locale => {
        expect(isValidLocale(locale)).toBe(true);
      });
    });
  });

  describe('SupportedLocale type', () => {
    it('accepts valid locales', () => {
      const locales: SupportedLocale[] = ['en', 'es'];
      expect(locales).toEqual(['en', 'es']);
    });

    it('can be used in function parameters', () => {
      function testFunction(locale: SupportedLocale) {
        return locale;
      }
      
      expect(testFunction('en')).toBe('en');
      expect(testFunction('es')).toBe('es');
    });

    it('can be used in object properties', () => {
      const config = {
        locale: 'en' as SupportedLocale,
        fallback: 'es' as SupportedLocale,
      };
      
      expect(config.locale).toBe('en');
      expect(config.fallback).toBe('es');
    });
  });

  describe('integration', () => {
    it('DEFAULT_LOCALE is a valid locale', () => {
      expect(isValidLocale(DEFAULT_LOCALE)).toBe(true);
    });

    it('all supported locales are valid', () => {
      SUPPORTED_LOCALES.forEach(locale => {
        expect(isValidLocale(locale)).toBe(true);
      });
    });

    it('constants are consistent', () => {
      expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    });
  });
});
