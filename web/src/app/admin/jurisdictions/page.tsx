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
  Button,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import * as React from "react";

import JurisdictionConfigDialog from "./JurisdictionConfigDialog";
import AppBar from "@/components/AppBar";
import { getServerClient } from "@/lib/supabaseServer";


export default async function JurisdictionsPage() {
  const supabase = getServerClient();

  // Get jurisdictions with their configs
  const { data: jurisdictions, error: jurisdictionsError } = await supabase
    .from("jurisdictions")
    .select(`
      id,
      code,
      name,
      jurisdiction_configs (
        final_exam_questions,
        final_exam_pass_pct,
        seat_time_required_minutes,
        certificate_prefix,
        certificate_issuer_name,
        certificate_issuer_license,
        disclaimer,
        support_email,
        support_phone,
        terms_url,
        privacy_url,
        regulatory_signing_secret,
        fulfillment_low_stock_threshold
      )
    `)
    .order("code", { ascending: true });

  if (jurisdictionsError) {
    return (
      <>
        <AppBar title="Jurisdiction Management" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load jurisdictions.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title="Jurisdiction Management" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">
              Jurisdiction Management
            </Typography>
            <Button
              variant="outlined"
              href="/admin"
            >
              Back to Admin
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Config Status</TableCell>
                  <TableCell>Exam Questions</TableCell>
                  <TableCell>Pass %</TableCell>
                  <TableCell>Seat Time (min)</TableCell>
                  <TableCell>Certificate Prefix</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jurisdictions?.map((jurisdiction) => {
                  const config = jurisdiction.jurisdiction_configs?.[0] || null;
                  return (
                    <TableRow key={jurisdiction.id}>
                      <TableCell>
                        <Chip 
                          label={jurisdiction.code} 
                          color="primary" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {jurisdiction.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {config ? (
                          <Chip 
                            label="Configured" 
                            color="success" 
                            size="small"
                          />
                        ) : (
                          <Chip 
                            label="Not Configured" 
                            color="warning" 
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {config?.final_exam_questions || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {config?.final_exam_pass_pct ? `${(config.final_exam_pass_pct * 100).toFixed(0)}%` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {config?.seat_time_required_minutes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {config?.certificate_prefix || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <JurisdictionConfigDialog 
                          jurisdiction={jurisdiction}
                          config={config}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {(!jurisdictions || jurisdictions.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No jurisdictions found.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
