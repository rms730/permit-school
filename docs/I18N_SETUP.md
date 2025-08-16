# Internationalization (i18n) Setup

This document describes the bilingual (English/Spanish) implementation for the permit-school project.

## Overview

The i18n system provides:

- **Locale detection**: Cookie-based with profile fallback
- **UI translations**: Complete Spanish translations for core UI elements
- **Content localization**: Locale-aware learning content and exam questions
- **Email templates**: Bilingual email templates for notifications

## Architecture

### Database Schema

```sql
-- Added to student_profiles table
ALTER TABLE public.student_profiles ADD COLUMN locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'es'));

-- New question_translations table
CREATE TABLE public.question_translations (
    question_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    lang text NOT NULL CHECK (lang IN ('en', 'es')),
    stem text NOT NULL,
    choices jsonb NOT NULL,
    explanation text,
    PRIMARY KEY (question_id, lang)
);
```

### File Structure

```
web/src/lib/i18n/
├── locales.ts              # Locale constants and validation
├── dictionaries/
│   ├── en.ts              # English translations
│   └── es.ts              # Spanish translations
├── index.ts               # Client-side utilities
├── server.ts              # Server-side utilities
└── I18nProvider.tsx       # React context provider
```

## Usage

### Server Components

```typescript
import { getLocaleFromRequest } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n';

export default async function MyPage() {
  const locale = await getLocaleFromRequest();
  const dict = getDictionary(locale);

  return <div>{dict.nav.home}</div>;
}
```

### Client Components

```typescript
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function MyComponent() {
  const { locale, dict } = useI18n();

  return <button>{dict.actions.start}</button>;
}
```

### API Routes

```typescript
import { getLocaleFromRequest } from "@/lib/i18n/server";

export async function POST(req: Request) {
  const locale = await getLocaleFromRequest();
  // Use locale for content filtering
}
```

## Locale Detection Priority

1. **Cookie**: `lang` cookie value
2. **Profile**: User's `student_profiles.locale` setting
3. **Accept-Language**: Browser's preferred language header
4. **Default**: English (`en`)

## Language Switcher

The `LanguageSwitcher` component in the AppBar allows users to toggle between English and Spanish. It:

- Sets the `lang` cookie
- Updates the user's profile locale (if signed in)
- Triggers a page refresh to apply changes

## Content Localization

### Learning Content

The learn page filters `content_chunks` by locale:

- Prefers chunks with `lang = current_locale`
- Falls back to English (`lang = 'en'`) if no localized content exists

### Exam Questions

Question translations are applied when creating exam attempts:

- Fetches translations from `question_translations` table
- Overrides `stem`, `choices`, and `explanation` fields
- Keeps answer keys unchanged (scoring is locale-independent)

### Tutor API

The tutor API accepts an optional `lang` parameter to prioritize localized content in RAG responses.

## Email Templates

Email functions accept a `locale` parameter:

```typescript
await sendWelcomeEmail({
  to: "user@example.com",
  name: "John",
  locale: "es",
});
```

## Adding New Translations

1. **UI Strings**: Add keys to both `en.ts` and `es.ts` dictionaries
2. **Questions**: Insert translations into `question_translations` table
3. **Content**: Add Spanish chunks to `content_chunks` with `lang = 'es'`
4. **Emails**: Add templates to the `emailTemplates` object

## Testing

### Manual Testing Checklist

- [ ] Toggle language switcher (EN/ES)
- [ ] Verify UI strings change language
- [ ] Check profile locale persistence
- [ ] Test learning content fallback
- [ ] Verify exam questions in Spanish
- [ ] Test email templates in both languages

### Database Testing

```sql
-- Check translation coverage
SELECT
  COUNT(*) as total_questions,
  COUNT(qt.question_id) as translated_questions,
  ROUND(COUNT(qt.question_id) * 100.0 / COUNT(*), 2) as coverage_percent
FROM public.question_bank qb
LEFT JOIN public.question_translations qt ON qb.id = qt.question_id AND qt.lang = 'es';
```

## Future Enhancements

- **URL locale prefixes**: `/es/course/...` routing
- **External TMS**: Integration with Phrase/Locize
- **Machine translation**: Automated translation jobs
- **More languages**: Support for additional locales
- **Admin UI**: Translation management interface

## Notes

- **CA First**: Implementation focuses on California Spanish-speaking users
- **Graceful fallback**: Always falls back to English if Spanish content unavailable
- **No URL changes**: Current implementation uses cookie/profile-based locale detection
- **MUI-only**: All UI components use Material-UI with no custom CSS
- **RLS maintained**: All database operations respect existing Row Level Security policies
