# Triage: Next.js + MUI theme serialization error

**Root cause:** A MUI theme (which contains functions like `breakpoints.up/down`) was crossing the Server→Client boundary (or used inside `metadata`/`viewport`). Next.js RSC must serialize props, and functions are not serializable.

**Fix applied:**

- Created `app/providers/MuiProvider.tsx` (client) that calls `createTheme()` inside a client boundary.
- Wrapped App Router `app/layout.tsx` with the provider.
- Audited and removed any `theme` props passed across boundaries; replaced with `useTheme()` in client components.
- Ensured `metadata`/`viewport` are plain JSON.
- Where Server Components used `theme.breakpoints.*` only for CSS, replaced with literal `@media (...)` queries.

**Verification:**

- `next build` succeeds; `next start` smoke started without the "Functions cannot be passed…" runtime error.
