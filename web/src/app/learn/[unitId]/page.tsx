import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Box,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";

import AppBar from "@/components/AppBar";
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

interface PageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function LessonPlayerPage({ params }: PageProps) {
  const { unitId } = await params;
  const supabase = await getServerClient();
  const locale = await getLocaleFromRequest();

  // Get unit details including unit_no
  const { data: unit, error: unitError } = await supabase
    .from("course_units")
    .select("id, title, unit_no, minutes_required")
    .eq("id", unitId)
    .single();

  if (unitError || !unit) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="error">Unit not found</Typography>
        </Paper>
      </Container>
    );
  }

  // Check entitlement for units beyond Unit 1
  if (unit.unit_no !== 1) {
    const { active: isEntitled } = await getEntitlementForUser('CA');
    
    if (!isEntitled) {
      return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Alert 
              severity="info" 
              action={
                <Button color="inherit" size="small" component={Link} href="/billing">
                  Upgrade
                </Button>
              }
            >
              This unit requires a subscription. Please upgrade to access all course content.
            </Alert>
          </Paper>
        </Container>
      );
    }
  }

  // Get unit chunks with locale-aware content
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
    `,
    )
    .eq("unit_id", unitId)
    .order("ord");

  if (chunksError || !chunksData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="error">Failed to load unit content</Typography>
        </Paper>
      </Container>
    );
  }

  // Filter chunks by locale, fallback to English
  const chunks: Chunk[] = chunksData
    .map((item) => ({
      id: (item.content_chunks as any).id,
      ord: item.ord,
      chunk: (item.content_chunks as any).chunk,
      section_ref: (item.content_chunks as any).section_ref,
      source_url: (item.content_chunks as any).source_url,
      lang: (item.content_chunks as any).lang,
    }))
    .filter((item) => item.lang === locale || item.lang === 'en')
    .reduce((acc, item) => {
      // If we already have a chunk for this ord with the preferred locale, skip
      const existing = acc.find(c => c.ord === item.ord);
      if (existing && existing.lang === locale) {
        return acc;
      }
      if (existing && item.lang === 'en') {
        // Replace English with preferred locale if available
        const filtered = acc.filter(c => c.ord !== item.ord);
        return [...filtered, item];
      }
      if (!existing) {
        return [...acc, item];
      }
      return acc;
    }, [] as any[]);

  return (
    <>
      <AppBar title={`${unit.title} - Learning`} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with title */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">{unit.title}</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`Unit ${unit.unit_no}`} size="small" />
            <Typography variant="body2">
              {unit.minutes_required} minutes required
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ height: "70vh" }}>
        {/* Left sidebar - chunk navigation */}
        <Paper variant="outlined" sx={{ width: 300, p: 2, overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Content Sections
          </Typography>
          <List dense>
            {chunks.map((chunk, index) => (
              <Box
                key={chunk.id}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: "transparent",
                }}
              >
                <Typography variant="body2">
                  Section {chunk.ord}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {chunk.section_ref || "No section reference"}
                </Typography>
              </Box>
            ))}
          </List>
        </Paper>

        {/* Main content area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Paper variant="outlined" sx={{ flex: 1, p: 3, overflow: "auto" }}>
            {chunks.length > 0 ? (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">
                    Section {chunks[0].ord}
                  </Typography>
                  {chunks[0].section_ref && (
                    <Chip label={chunks[0].section_ref} size="small" />
                  )}
                </Stack>

                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        fontSize: "1rem",
                      }}
                    >
                      {chunks[0].chunk}
                    </Typography>
                  </CardContent>
                </Card>

                {chunks[0].source_url && (
                  <Typography variant="caption" color="text.secondary">
                    Source: {chunks[0].source_url}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography>No content available</Typography>
            )}
          </Paper>

          {/* Navigation info */}
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">
                {chunks.length} sections available
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
    </>
  );
}
