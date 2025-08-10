'use client';

import * as React from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper, Stack,
  TextField, Button, List, ListItem, ListItemText, Divider, Chip, Link,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

type Citation = {
  idx: number;
  id: number;
  section_ref?: string | null;
  source_url?: string | null;
  distance?: number;
  rank?: number;
};

type TutorResponse = {
  answer?: string;
  citations?: Citation[];
  error?: string;
  detail?: string;
};

const STATES = [
  { code: 'CA', label: 'California' },
  { code: 'TX', label: 'Texas' }
];

export default function HomePage() {
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [answer, setAnswer] = React.useState('');
  const [cites, setCites] = React.useState<Citation[]>([]);
  const [err, setErr] = React.useState('');
  const [jCode, setJCode] = React.useState('CA');

  async function ask() {
    setBusy(true);
    setAnswer('');
    setCites([]);
    setErr('');
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, j_code: jCode, top_k: 5 })
      });
      const data: TutorResponse = await res.json();
      if (!res.ok) {
        setErr(data.error || `HTTP ${res.status}`);
        return;
      }
      setAnswer(data.answer || '');
      setCites(data.citations || []);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Permit School — Tutor</Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/" underline="hover" color="inherit">Home</Link>
            <Link href="/admin/logs" underline="hover" color="inherit">Admin Logs</Link>
            <Link href="/signin" underline="hover" color="inherit">Sign In</Link>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Ask the Driver Handbook:</Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  label="State"
                  value={jCode}
                  onChange={(e) => setJCode(e.target.value)}
                >
                  {STATES.map((s) => (
                    <MenuItem key={s.code} value={s.code}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Your question"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
              />
              <Button variant="contained" onClick={ask} disabled={busy || !input.trim()}>
                {busy ? 'Thinking…' : 'Ask'}
              </Button>
            </Stack>

            {err && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography color="error">{err}</Typography>
              </Paper>
            )}

            {answer && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Answer</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{answer}</Typography>
              </Paper>
            )}

            {!!cites.length && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Citations</Typography>
                <List dense disablePadding>
                  {cites.map((c, i) => (
                    <React.Fragment key={`${c.id}-${i}`}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body1">Chunk #{c.id}</Typography>
                              {typeof c.rank === 'number' && (
                                <Chip label={`rank ${c.rank.toFixed(3)}`} size="small" />
                              )}
                              {typeof c.distance === 'number' && (
                                <Chip label={`dist ${c.distance.toFixed(3)}`} size="small" />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              {c.section_ref && <Typography variant="body2">Section: {c.section_ref}</Typography>}
                              {c.source_url && (
                                <Typography variant="body2">
                                  Source:{' '}
                                  <Link href={c.source_url} target="_blank" rel="noopener">
                                    {c.source_url}
                                  </Link>
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                      {i < cites.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
