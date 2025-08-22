import { describe, it, expect } from 'vitest';

import { getPathWithoutLocale, buildLocaleHref } from '../i18n/switchLocale';

describe('switchLocale utilities', () => {
  describe('getPathWithoutLocale', () => {
    it('should remove locale prefix from path', () => {
      expect(getPathWithoutLocale('/en/home')).toBe('/home');
      expect(getPathWithoutLocale('/es/dashboard')).toBe('/dashboard');
      expect(getPathWithoutLocale('/en/practice?mode=quick')).toBe('/practice?mode=quick');
    });

    it('should return path unchanged if no locale prefix', () => {
      expect(getPathWithoutLocale('/home')).toBe('/home');
      expect(getPathWithoutLocale('/dashboard')).toBe('/dashboard');
      expect(getPathWithoutLocale('/')).toBe('/');
    });

    it('should handle empty path', () => {
      expect(getPathWithoutLocale('')).toBe('/');
      expect(getPathWithoutLocale(null as any)).toBe('/');
    });

    it('should handle custom locales array', () => {
      expect(getPathWithoutLocale('/fr/home', ['fr', 'de'])).toBe('/home');
      expect(getPathWithoutLocale('/en/home', ['fr', 'de'])).toBe('/en/home');
    });
  });

  describe('buildLocaleHref', () => {
    it('should build correct locale href', () => {
      expect(buildLocaleHref('es', '/en/home')).toBe('/es/home');
      expect(buildLocaleHref('en', '/es/dashboard')).toBe('/en/dashboard');
      expect(buildLocaleHref('es', '/en/practice', '?mode=quick')).toBe('/es/practice?mode=quick');
    });

    it('should handle paths without locale prefix', () => {
      expect(buildLocaleHref('es', '/home')).toBe('/es/home');
      expect(buildLocaleHref('en', '/dashboard')).toBe('/en/dashboard');
    });

    it('should handle root path', () => {
      expect(buildLocaleHref('es', '/')).toBe('/es/');
      expect(buildLocaleHref('en', '/')).toBe('/en/');
    });

    it('should handle empty search params', () => {
      expect(buildLocaleHref('es', '/en/home', '')).toBe('/es/home');
      expect(buildLocaleHref('en', '/es/dashboard')).toBe('/en/dashboard');
    });

    it('should preserve query parameters', () => {
      expect(buildLocaleHref('es', '/en/search', '?q=test&page=1')).toBe('/es/search?q=test&page=1');
      expect(buildLocaleHref('en', '/es/catalog', '?category=driving')).toBe('/en/catalog?category=driving');
    });
  });
});
