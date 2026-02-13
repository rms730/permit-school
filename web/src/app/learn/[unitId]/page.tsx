import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import Link from "next/link";

import AppShell from "@/components/layout/AppShell";
import { getEntitlementForUser } from "@/lib/entitlements";
import { getLocaleFromRequest } from "@/lib/i18n/server";
import { getServerClient } from "@/lib/supabaseServer";

interface Chunk {
  id: number;
  ord: number;
  chunk: string;
  section_ref?: string;
  source_url?: string;
  lang?: string;
}

interface Unit {
  id: string;
  title: string;
  unit_no: number;
  minutes_required: number;
}

interface ContentChunkJoin {
  ord: number;
  content_chunks:
    | {
        id: number;
        chunk: string;
        section_ref?: string;
        source_url?: string;
        lang?: string;
      }
    | {
        id: number;
        chunk: string;
        section_ref?: string;
        source_url?: string;
        lang?: string;
      }[]
    | null;
}

interface PageProps {
  params: Promise<{ unitId: string }>;
  searchParams: Promise<{ section?: string }>;
}

function selectPreferredChunks(items: ContentChunkJoin[], locale: string): Chunk[] {
  const bySection = new Map<number, Chunk>();

  for (const item of items) {
    const content = Array.isArray(item.content_chunks)
      ? (item.content_chunks[0] ?? null)
      : item.content_chunks;
    if (!content) continue;

    const lang = content.lang ?? 'en';
    if (lang !== locale && lang !== 'en') continue;

    const candidate: Chunk = {
      id: content.id,
      ord: item.ord,
      chunk: content.chunk,
      section_ref: content.section_ref,
      source_url: content.source_url,
      lang,
    };

    const current = bySection.get(item.ord);
    if (!current) {
      bySection.set(item.ord, candidate);
      continue;
    }

    if (current.lang === 'en' && lang === locale) {
      bySection.set(item.ord, candidate);
    }
  }

  return Array.from(bySection.values()).sort((a, b) => a.ord - b.ord);
}

export default async function LessonPlayerPage({ params, searchParams }: PageProps) {
  const { unitId } = await params;
  const { section } = await searchParams;

  const supabase = await getServerClient();
  const locale = await getLocaleFromRequest();

  const { data: unit, error: unitError } = await supabase
    .from("course_units")
    .select("id, title, unit_no, minutes_required")
    .eq("id", unitId)
    .single<Unit>();

  if (unitError || !unit) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Unit not found.</Alert>
        </Container>
      </AppShell>
    );
  }

  if (unit.unit_no !== 1) {
    const { active: isEntitled } = await getEntitlementForUser('CA');

    if (!isEntitled) {
      return (
        <AppShell>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" component={Link} href="/billing">
                  Upgrade
                </Button>
              }
            >
              This unit requires an active subscription.
            </Alert>
          </Container>
        </AppShell>
      );
    }
  }

  const { data: chunksData, error: chunksError } = await supabase
    .from("unit_chunks")
    .select(
      `
      ord,
      content_chunks (
        id,
        chunk,
        section_ref,
        source_url,
        lang
      )
    `
    )
    .eq("unit_id", unitId)
    .order("ord");

  if (chunksError || !chunksData) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Failed to load unit content.</Alert>
        </Container>
      </AppShell>
    );
  }

  const chunks = selectPreferredChunks(chunksData as ContentChunkJoin[], locale);

  if (chunks.length === 0) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="info">No content is available for this unit yet.</Alert>
        </Container>
      </AppShell>
    );
  }

  const requestedSection = Number.parseInt(section ?? '', 10);
  const selectedOrd = Number.isFinite(requestedSection)
    ? requestedSection
    : chunks[0].ord;

  const selectedIndex = Math.max(
    0,
    chunks.findIndex(chunk => chunk.ord === selectedOrd)
  );

  const currentChunk = chunks[selectedIndex] ?? chunks[0];
  const previousChunk = selectedIndex > 0 ? chunks[selectedIndex - 1] : null;
  const nextChunk = selectedIndex < chunks.length - 1 ? chunks[selectedIndex + 1] : null;

  const completionPercent = Math.round(((selectedIndex + 1) / chunks.length) * 100);

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, mb: 8 }}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 2.5,
            background:
              'linear-gradient(145deg, rgba(12,46,79,0.95) 0%, rgba(15,110,207,0.88) 58%, rgba(23,134,111,0.9) 100%)',
            color: 'common.white',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Chip label={`Unit ${unit.unit_no}`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'common.white' }} />
              <Chip
                label={`${completionPercent}% through this unit`}
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'common.white' }}
              />
            </Stack>
            <Typography variant="h3" sx={{ color: 'common.white' }}>
              {unit.title}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {unit.minutes_required} required minutes • {chunks.length} sections
            </Typography>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          }}
        >
          <Paper sx={{ p: 2, alignSelf: 'start', position: { md: 'sticky' }, top: { md: 88 } }}>
            <Typography variant="h6" sx={{ mb: 1.4 }}>
              Sections
            </Typography>
            <Stack spacing={0.9}>
              {chunks.map((chunk, index) => {
                const selected = chunk.ord === currentChunk.ord;
                return (
                  <Button
                    key={chunk.id}
                    component={Link}
                    href={`/learn/${unit.id}?section=${chunk.ord}`}
                    variant={selected ? 'contained' : 'text'}
                    sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.1, borderRadius: 2 }}
                  >
                    <Stack alignItems="flex-start" spacing={0.2}>
                      <Typography fontWeight={selected ? 700 : 500}>Section {chunk.ord}</Typography>
                      <Typography variant="caption" sx={{ opacity: selected ? 0.95 : 0.7 }}>
                        {chunk.section_ref ?? `Content block ${index + 1}`}
                      </Typography>
                    </Stack>
                  </Button>
                );
              })}
            </Stack>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="h5">Section {currentChunk.ord}</Typography>
                  <Typography color="text.secondary">
                    {currentChunk.section_ref ?? 'Study this section and continue to the next one.'}
                  </Typography>
                </Box>
                <Chip label={`Section ${selectedIndex + 1} of ${chunks.length}`} sx={{ width: 'fit-content' }} />
              </Stack>

              <Divider />

              <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                {currentChunk.chunk}
              </Typography>

              {currentChunk.source_url ? (
                <Typography variant="caption" color="text.secondary">
                  Source: {currentChunk.source_url}
                </Typography>
              ) : null}

              <Divider />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                justifyContent="space-between"
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                  <Button
                    component={Link}
                    href={previousChunk ? `/learn/${unit.id}?section=${previousChunk.ord}` : '#'}
                    variant="outlined"
                    disabled={!previousChunk}
                  >
                    Previous section
                  </Button>
                  <Button
                    component={Link}
                    href={nextChunk ? `/learn/${unit.id}?section=${nextChunk.ord}` : '#'}
                    variant="contained"
                    disabled={!nextChunk}
                  >
                    Next section
                  </Button>
                </Stack>

                <Button component={Link} href={`/quiz/start/${unit.id}`} variant="text">
                  Take unit quiz
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </AppShell>
  );
}
