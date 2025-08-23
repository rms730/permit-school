import fs from 'fs';
import path from 'path';

import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import * as React from 'react';

export function generateStaticParams() {
  return ['en', 'es'].map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  let messages: Record<string, unknown>;
  try {
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const messagesContent = fs.readFileSync(messagesPath, 'utf8');
    messages = JSON.parse(messagesContent);
  } catch (error) {
    console.error('Failed to load messages for locale:', locale, error);
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}


