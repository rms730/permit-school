"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import { useSeatTime } from "../useSeatTime";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

interface Chunk {
  id: number;
  ord: number;
  chunk: string;
  section_ref?: string;
  source_url?: string;
}

interface Unit {
  id: string;
  title: string;
  minutes_required: number;
}

interface PageProps {
  params: {
    unitId: string;
  };
}

export default function LessonPlayerPage({ params }: PageProps) {
  const { unitId } = params;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createPagesBrowserClient();

  // Seat time tracking
  const { timeMs, isTracking } = useSeatTime({
    unitId,
    onTimeUpdate: (time) => {
      // Optional: Update UI when time changes
    },
  });

  useEffect(() => {
    async function loadUnit() {
      try {
        // Get unit details
        const { data: unitData, error: unitError } = await supabase
          .from("course_units")
          .select("id, title, minutes_required")
          .eq("id", unitId)
          .single();

        if (unitError || !unitData) {
          setError("Unit not found");
          return;
        }

        setUnit(unitData);

        // Get unit chunks
        const { data: chunksData, error: chunksError } = await supabase
          .from("unit_chunks")
          .select(
            `
            ord,
            content_chunks (
              id,
              chunk,
              section_ref,
              source_url
            )
          `,
          )
          .eq("unit_id", unitId)
          .order("ord");

        if (chunksError || !chunksData) {
          setError("Failed to load unit content");
          return;
        }

        const formattedChunks: Chunk[] = chunksData.map((item) => ({
          id: (item.content_chunks as any).id,
          ord: item.ord,
          chunk: (item.content_chunks as any).chunk,
          section_ref: (item.content_chunks as any).section_ref,
          source_url: (item.content_chunks as any).source_url,
        }));

        setChunks(formattedChunks);
      } catch (err) {
        console.error("Error loading unit:", err);
        setError("Failed to load unit");
      } finally {
        setLoading(false);
      }
    }

    loadUnit();
  }, [unitId, supabase]);

  const currentChunk = chunks[currentChunkIndex];
  const progressPercent = unit
    ? Math.min((timeMs / (unit.minutes_required * 60000)) * 100, 100)
    : 0;
  const timeMinutes = Math.floor(timeMs / 60000);
  const requiredMinutes = unit?.minutes_required || 0;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography>Loading lesson...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error || !unit) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="error">{error || "Unit not found"}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with title and seat time */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">{unit.title}</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={isTracking ? "Active" : "Inactive"}
              color={isTracking ? "success" : "default"}
              size="small"
            />
            <Typography variant="body2">
              {timeMinutes} / {requiredMinutes} minutes
            </Typography>
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ mt: 1 }}
        />
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
                onClick={() => setCurrentChunkIndex(index)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  cursor: "pointer",
                  bgcolor:
                    index === currentChunkIndex
                      ? "primary.light"
                      : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={index === currentChunkIndex ? "bold" : "normal"}
                >
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
            {currentChunk ? (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">
                    Section {currentChunk.ord}
                  </Typography>
                  {currentChunk.section_ref && (
                    <Chip label={currentChunk.section_ref} size="small" />
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
                      {currentChunk.chunk}
                    </Typography>
                  </CardContent>
                </Card>

                {currentChunk.source_url && (
                  <Typography variant="caption" color="text.secondary">
                    Source: {currentChunk.source_url}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography>No content available</Typography>
            )}
          </Paper>

          {/* Navigation buttons */}
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="outlined"
                disabled={currentChunkIndex === 0}
                onClick={() =>
                  setCurrentChunkIndex((prev) => Math.max(0, prev - 1))
                }
              >
                Previous
              </Button>

              <Typography variant="body2">
                {currentChunkIndex + 1} of {chunks.length}
              </Typography>

              <Button
                variant="outlined"
                disabled={currentChunkIndex === chunks.length - 1}
                onClick={() =>
                  setCurrentChunkIndex((prev) =>
                    Math.min(chunks.length - 1, prev + 1),
                  )
                }
              >
                Next
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
