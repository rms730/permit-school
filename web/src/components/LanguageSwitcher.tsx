'use client';

import CheckIcon from '@mui/icons-material/Check';
import TranslateIcon from '@mui/icons-material/Translate';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Tooltip } from '@mui/material';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { buildLocaleHref } from '@/lib/i18n/switchLocale';

type Locale = 'en' | 'es';

const languages: { code: Locale; label: string; emoji: string }[] = [
  { code: 'en', label: 'English',  emoji: '🇺🇸' },
  { code: 'es', label: 'Español',  emoji: '🇲🇽' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale = (params?.locale as Locale) || 'en';
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const onClose = () => setAnchorEl(null);

  const switchTo = (nextLocale: Locale) => {
    const search = searchParams?.toString() ?? '';
    const href = buildLocaleHref(nextLocale, pathname || '/', search ? `?${search}` : '');
    // Persist preference for 1 year
    document.cookie = `ps_locale=${nextLocale}; Max-Age=31536000; Path=/`;
    router.replace(href);
    onClose();
  };

  return (
    <>
      <Tooltip title={currentLocale === 'en' ? 'Language: English' : 'Idioma: Español'}>
        <IconButton
          aria-label="Change language"
          aria-haspopup="menu"
          aria-controls={open ? 'lang-menu' : undefined}
          aria-expanded={open ? 'true' : 'false'}
          onClick={onOpen}
          size="large"
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      <Menu id="lang-menu" anchorEl={anchorEl} open={open} onClose={onClose}>
        {languages.map((lang) => (
          <MenuItem key={lang.code} onClick={() => switchTo(lang.code)} selected={lang.code === currentLocale}>
            <ListItemIcon>
              <Avatar sx={{ width: 20, height: 20, fontSize: 14 }}>{lang.emoji}</Avatar>
            </ListItemIcon>
            <ListItemText primary={lang.label} secondary={lang.code.toUpperCase()} />
            {lang.code === currentLocale ? <CheckIcon fontSize="small" /> : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
