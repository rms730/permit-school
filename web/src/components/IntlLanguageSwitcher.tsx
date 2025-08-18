"use client";

import * as React from 'react';
import {FormControl, InputLabel, Select, MenuItem, SelectChangeEvent} from '@mui/material';
import {usePathname} from 'next/navigation';
import {useLocale} from 'next-intl';
import Link from 'next/link';
import {locales, type Locale} from '../../i18n/request';

export default function IntlLanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const handleChange = (e: SelectChangeEvent<string>) => {};

  return (
    <FormControl size="small" variant="outlined">
      <InputLabel id="lang-label">Lang</InputLabel>
      <Select labelId="lang-label" label="Lang" value={locale} onChange={handleChange}>
        {locales.map((l) => (
          <MenuItem key={l} value={l}>
            <Link href={`/${l}`}>
              {l.toUpperCase()}
            </Link>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}


