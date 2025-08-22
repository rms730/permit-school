import {
  Container,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import Link from "next/link";
import * as React from "react";

import AppBar from "@/components/AppBar";
import CertificateActions from "@/components/CertificateActions";
import { getServerClient } from "@/lib/supabaseServer";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { id } = params;
  const supabase = getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Certificate Detail" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>You must sign in to view this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get certificate with all related data
  const { data: certificate, error: certError } = await supabase
    .from("certificates")
    .select(`
      id,
      student_id,
      course_id,
      jurisdiction_id,
      status,
      number,
      passed_at,
      issued_at,
      voided_at,
      void_reason,
      created_at,
      profiles!certificates_student_id_fkey(full_name, email),
      courses(title, code),
      jurisdictions(name, code)
    `)
    .eq("id", id)
    .single();

  if (certError || !certificate) {
    return (
      <>
        <AppBar title="Certificate Detail" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Certificate not found.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "warning";
      case "issued":
        return "success";
      case "void":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <AppBar title="Certificate Detail" />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Certificate Details</Typography>
              <Button variant="outlined" component={Link} href="/admin/certificates">
                Back to List
              </Button>
            </Stack>

            <Divider />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Certificate Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Certificate Number
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {certificate.number || "Not assigned"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={certificate.status}
                        color={getStatusColor(certificate.status) as any}
                        size="small"
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Course
                      </Typography>
                      <Typography variant="body1">
                        {(certificate.courses as any)?.title || (certificate.courses as any)?.code || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Jurisdiction
                      </Typography>
                      <Typography variant="body1">
                        {(certificate.jurisdictions as any)?.name || (certificate.jurisdictions as any)?.code || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Student Name
                      </Typography>
                      <Typography variant="body1">
                        {(certificate.profiles as any)?.full_name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Student Email
                      </Typography>
                      <Typography variant="body1">
                        {(certificate.profiles as any)?.email || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Student ID
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {certificate.student_id}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(certificate.created_at).toLocaleString()}
                  </Typography>
                </Box>

                {certificate.passed_at && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Passed
                    </Typography>
                    <Typography variant="body1">
                      {new Date(certificate.passed_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {certificate.issued_at && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Issued
                    </Typography>
                    <Typography variant="body1">
                      {new Date(certificate.issued_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {certificate.voided_at && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Voided
                    </Typography>
                    <Typography variant="body1">
                      {new Date(certificate.voided_at).toLocaleString()}
                    </Typography>
                    {certificate.void_reason && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Reason: {certificate.void_reason}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <CertificateActions
                  certificateId={certificate.id}
                  status={certificate.status}
                  number={certificate.number}
                />

                {certificate.status === "issued" && certificate.number && (
                  <>
                    <Button
                      variant="outlined"
                      component="a"
                      href={`/api/certificates/${certificate.number}`}
                      target="_blank"
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="outlined"
                      component="a"
                      href={`/verify/${certificate.number}`}
                      target="_blank"
                    >
                      View Verification Page
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
