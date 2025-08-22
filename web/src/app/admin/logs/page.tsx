import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import * as React from "react";

import { getServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const supabase = getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography>You must sign in to view this page.</Typography>
        </Paper>
      </Container>
    );
  }

  // With RLS, only admins can read tutor_logs (policy already checks app_metadata.role = 'admin')
  const { data, error } = await supabase
    .from("tutor_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="error">
            {String(error.message || error)}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tutor Logs (latest 50)
        </Typography>
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
                  <TableCell>
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{r.j_code}</TableCell>
                  <TableCell>{r.query}</TableCell>
                  <TableCell>{r.top_k}</TableCell>
                  <TableCell>{r.latency_ms}</TableCell>
                  <TableCell>{r.model || "-"}</TableCell>
                  <TableCell>
                    {r.error ? <Chip label="error" /> : <Chip label="ok" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
