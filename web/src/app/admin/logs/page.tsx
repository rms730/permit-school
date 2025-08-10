import * as React from 'react';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Stack
} from '@mui/material';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('tutor_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tutor Logs (latest 50)
        </Typography>
        {error && <Typography color="error">{String(error.message || error)}</Typography>}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Query</TableCell>
                <TableCell>TopK</TableCell>
                <TableCell>Latency (ms)</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data || []).map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>{r.j_code}</TableCell>
                  <TableCell>{r.query}</TableCell>
                  <TableCell>{r.top_k}</TableCell>
                  <TableCell>{r.latency_ms}</TableCell>
                  <TableCell>{r.model || '-'}</TableCell>
                  <TableCell>
                    {r.error ? <Chip label="error" /> : <Chip label="ok" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack sx={{ mt: 2 }}>
          <Typography variant="body2">
            Note: This page queries with the server service role in SSR. Add proper auth gating in the next sprint.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
