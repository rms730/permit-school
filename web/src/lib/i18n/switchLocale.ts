export function getPathWithoutLocale(pathname: string, locales: string[] = ['en','es']): string {
  if (!pathname) return '/';
  const parts = pathname.split('/');
  const first = parts[1];
  if (locales.includes(first)) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

export function buildLocaleHref(nextLocale: 'en'|'es', pathname: string, search: string = ''): string {
  const bare = getPathWithoutLocale(pathname);
  // Ensure single leading slash
  const normalized = bare.startsWith('/') ? bare : `/${bare}`;
  return `/${nextLocale}${normalized}${search}`;
}
