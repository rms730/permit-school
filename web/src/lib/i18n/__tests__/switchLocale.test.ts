import { describe, it, expect } from 'vitest';
import { getPathWithoutLocale, buildLocaleHref } from '../switchLocale';

describe('switchLocale', () => {
  describe('getPathWithoutLocale', () => {
    it('removes locale from path with supported locale', () => {
      expect(getPathWithoutLocale('/en/dashboard')).toBe('/dashboard');
      expect(getPathWithoutLocale('/es/profile')).toBe('/profile');
      expect(getPathWithoutLocale('/en/courses/123')).toBe('/courses/123');
      expect(getPathWithoutLocale('/es/admin/users')).toBe('/admin/users');
    });

    it('returns path unchanged when no locale prefix', () => {
      expect(getPathWithoutLocale('/dashboard')).toBe('/dashboard');
      expect(getPathWithoutLocale('/profile')).toBe('/profile');
      expect(getPathWithoutLocale('/courses/123')).toBe('/courses/123');
      expect(getPathWithoutLocale('/admin/users')).toBe('/admin/users');
    });

    it('returns path unchanged when first segment is not a locale', () => {
      expect(getPathWithoutLocale('/fr/dashboard')).toBe('/fr/dashboard');
      expect(getPathWithoutLocale('/de/profile')).toBe('/de/profile');
      expect(getPathWithoutLocale('/api/health')).toBe('/api/health');
      expect(getPathWithoutLocale('/_next/static')).toBe('/_next/static');
    });

    it('handles root path', () => {
      expect(getPathWithoutLocale('/en')).toBe('/');
      expect(getPathWithoutLocale('/es')).toBe('/');
      expect(getPathWithoutLocale('/')).toBe('/');
    });

    it('handles empty pathname', () => {
      expect(getPathWithoutLocale('')).toBe('/');
      expect(getPathWithoutLocale(null as any)).toBe('/');
      expect(getPathWithoutLocale(undefined as any)).toBe('/');
    });

    it('handles paths with query parameters', () => {
      expect(getPathWithoutLocale('/en/dashboard?tab=settings')).toBe('/dashboard?tab=settings');
      expect(getPathWithoutLocale('/es/profile?edit=true')).toBe('/profile?edit=true');
    });

    it('handles paths with hash fragments', () => {
      expect(getPathWithoutLocale('/en/dashboard#section1')).toBe('/dashboard#section1');
      expect(getPathWithoutLocale('/es/profile#contact')).toBe('/profile#contact');
    });

    it('handles paths with both query and hash', () => {
      expect(getPathWithoutLocale('/en/dashboard?tab=settings#section1')).toBe('/dashboard?tab=settings#section1');
      expect(getPathWithoutLocale('/es/profile?edit=true#contact')).toBe('/profile?edit=true#contact');
    });

    it('handles deep nested paths', () => {
      expect(getPathWithoutLocale('/en/admin/users/123/edit')).toBe('/admin/users/123/edit');
      expect(getPathWithoutLocale('/es/courses/456/lessons/789')).toBe('/courses/456/lessons/789');
    });

    it('handles paths with trailing slash', () => {
      expect(getPathWithoutLocale('/en/dashboard/')).toBe('/dashboard/');
      expect(getPathWithoutLocale('/es/profile/')).toBe('/profile/');
    });

    it('handles paths with multiple slashes', () => {
      expect(getPathWithoutLocale('/en//dashboard')).toBe('//dashboard');
      expect(getPathWithoutLocale('/es///profile')).toBe('///profile');
    });

    it('works with custom locales array', () => {
      const customLocales = ['fr', 'de', 'it'];
      expect(getPathWithoutLocale('/fr/dashboard', customLocales)).toBe('/dashboard');
      expect(getPathWithoutLocale('/de/profile', customLocales)).toBe('/profile');
      expect(getPathWithoutLocale('/en/dashboard', customLocales)).toBe('/en/dashboard');
    });

    it('handles edge cases', () => {
      expect(getPathWithoutLocale('/en/')).toBe('/');
      expect(getPathWithoutLocale('/es/')).toBe('/');
      expect(getPathWithoutLocale('/en//')).toBe('//');
      expect(getPathWithoutLocale('/es///')).toBe('///');
    });
  });

  describe('buildLocaleHref', () => {
    it('builds correct href with English locale', () => {
      expect(buildLocaleHref('en', '/dashboard')).toBe('/en/dashboard');
      expect(buildLocaleHref('en', '/profile')).toBe('/en/profile');
      expect(buildLocaleHref('en', '/courses/123')).toBe('/en/courses/123');
    });

    it('builds correct href with Spanish locale', () => {
      expect(buildLocaleHref('es', '/dashboard')).toBe('/es/dashboard');
      expect(buildLocaleHref('es', '/profile')).toBe('/es/profile');
      expect(buildLocaleHref('es', '/courses/123')).toBe('/es/courses/123');
    });

    it('removes existing locale from pathname', () => {
      expect(buildLocaleHref('en', '/es/dashboard')).toBe('/en/dashboard');
      expect(buildLocaleHref('es', '/en/profile')).toBe('/es/profile');
      expect(buildLocaleHref('en', '/es/courses/123')).toBe('/en/courses/123');
    });

    it('handles root path', () => {
      expect(buildLocaleHref('en', '/')).toBe('/en/');
      expect(buildLocaleHref('es', '/')).toBe('/es/');
    });

    it('handles paths without leading slash', () => {
      expect(buildLocaleHref('en', 'dashboard')).toBe('/en/dashboard');
      expect(buildLocaleHref('es', 'profile')).toBe('/es/profile');
      expect(buildLocaleHref('en', 'courses/123')).toBe('/en/courses/123');
    });

    it('includes search parameters', () => {
      expect(buildLocaleHref('en', '/dashboard', '?tab=settings')).toBe('/en/dashboard?tab=settings');
      expect(buildLocaleHref('es', '/profile', '?edit=true')).toBe('/es/profile?edit=true');
      expect(buildLocaleHref('en', '/courses/123', '?filter=active')).toBe('/en/courses/123?filter=active');
    });

    it('handles empty search parameter', () => {
      expect(buildLocaleHref('en', '/dashboard', '')).toBe('/en/dashboard');
      expect(buildLocaleHref('es', '/profile', '')).toBe('/es/profile');
    });

    it('handles paths with existing query parameters', () => {
      expect(buildLocaleHref('en', '/dashboard?tab=settings')).toBe('/en/dashboard?tab=settings');
      expect(buildLocaleHref('es', '/profile?edit=true')).toBe('/es/profile?edit=true');
    });

    it('handles paths with hash fragments', () => {
      expect(buildLocaleHref('en', '/dashboard#section1')).toBe('/en/dashboard#section1');
      expect(buildLocaleHref('es', '/profile#contact')).toBe('/es/profile#contact');
    });

    it('handles paths with both query and hash', () => {
      expect(buildLocaleHref('en', '/dashboard?tab=settings#section1')).toBe('/en/dashboard?tab=settings#section1');
      expect(buildLocaleHref('es', '/profile?edit=true#contact')).toBe('/es/profile?edit=true#contact');
    });

    it('handles deep nested paths', () => {
      expect(buildLocaleHref('en', '/admin/users/123/edit')).toBe('/en/admin/users/123/edit');
      expect(buildLocaleHref('es', '/courses/456/lessons/789')).toBe('/es/courses/456/lessons/789');
    });

    it('handles paths with trailing slash', () => {
      expect(buildLocaleHref('en', '/dashboard/')).toBe('/en/dashboard/');
      expect(buildLocaleHref('es', '/profile/')).toBe('/es/profile/');
    });

    it('handles paths with multiple slashes', () => {
      expect(buildLocaleHref('en', '//dashboard')).toBe('/en//dashboard');
      expect(buildLocaleHref('es', '///profile')).toBe('/es///profile');
    });

    it('handles edge cases', () => {
      expect(buildLocaleHref('en', '')).toBe('/en/');
      expect(buildLocaleHref('es', '')).toBe('/es/');
      expect(buildLocaleHref('en', '/')).toBe('/en/');
      expect(buildLocaleHref('es', '/')).toBe('/es/');
    });

    it('works with complex paths', () => {
      expect(buildLocaleHref('en', '/admin/users/123/edit?mode=advanced#permissions')).toBe('/en/admin/users/123/edit?mode=advanced#permissions');
      expect(buildLocaleHref('es', '/courses/456/lessons/789?autoplay=true#video')).toBe('/es/courses/456/lessons/789?autoplay=true#video');
    });

    it('normalizes paths correctly', () => {
      expect(buildLocaleHref('en', 'dashboard')).toBe('/en/dashboard');
      expect(buildLocaleHref('es', 'profile')).toBe('/es/profile');
      expect(buildLocaleHref('en', 'courses/123')).toBe('/en/courses/123');
    });
  });

  describe('integration', () => {
    it('getPathWithoutLocale and buildLocaleHref work together', () => {
      const originalPath = '/es/dashboard?tab=settings#section1';
      const pathWithoutLocale = getPathWithoutLocale(originalPath);
      const newHref = buildLocaleHref('en', pathWithoutLocale);
      
      expect(pathWithoutLocale).toBe('/dashboard?tab=settings#section1');
      expect(newHref).toBe('/en/dashboard?tab=settings#section1');
    });

    it('switching between locales preserves path structure', () => {
      const path = '/admin/users/123/edit';
      
      const enHref = buildLocaleHref('en', path);
      const esHref = buildLocaleHref('es', path);
      
      expect(enHref).toBe('/en/admin/users/123/edit');
      expect(esHref).toBe('/es/admin/users/123/edit');
    });

    it('handles locale switching with existing locale in path', () => {
      const pathWithLocale = '/en/dashboard';
      const pathWithoutLocale = getPathWithoutLocale(pathWithLocale);
      const newHref = buildLocaleHref('es', pathWithoutLocale);
      
      expect(pathWithoutLocale).toBe('/dashboard');
      expect(newHref).toBe('/es/dashboard');
    });
  });
});
