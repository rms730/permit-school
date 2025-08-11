import * as React from "react";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { getServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import AppBar from "@/components/AppBar";

interface PageProps {
  params: {
    number: string;
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const { number } = params;
  const supabase = getServerClient();

  // Find certificate by number
  const { data: certificate, error: certError } = await supabase
    .from("certificates")
    .select(`
      id,
      number,
      status,
      passed_at,
      issued_at,
      voided_at,
      void_reason,
      profiles!certificates_student_id_fkey(full_name),
      courses(title, code),
      jurisdictions(name, code)
    `)
    .eq("number", number)
    .single();

  if (certError || !certificate) {
    return (
      <>
        <AppBar title="Certificate Verification" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" gutterBottom>
                Certificate Verification
              </Typography>
              <Alert severity="error" sx={{ width: "100%" }}>
                Certificate not found
              </Alert>
              <Typography variant="body1" textAlign="center">
                The certificate number &quot;{number}&quot; could not be found in our system.
              </Typography>
              <Button variant="outlined" component={Link} href="/">
                Go Home
              </Button>
            </Stack>
          </Paper>
        </Container>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued":
        return "success";
      case "draft":
        return "warning";
      case "void":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "issued":
        return "Valid";
      case "draft":
        return "Draft";
      case "void":
        return "Void";
      default:
        return status;
    }
  };

  // Mask student name for privacy
  const maskName = (name: string) => {
    if (!name) return "Student";
    const parts = name.split(" ");
    if (parts.length === 1) {
      return `${parts[0][0]}***`;
    }
    return `${parts[0][0]}*** ${parts[parts.length - 1]}`;
  };

  const studentName = maskName((certificate.profiles as any)?.full_name || "Student");

  return (
    <>
      <AppBar title="Certificate Verification" />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h4" gutterBottom textAlign="center">
              Certificate Verification
            </Typography>

            <Box sx={{ textAlign: "center" }}>
                             <Chip
                 label={getStatusText(certificate.status)}
                 color={getStatusColor(certificate.status) as any}
                 sx={{ fontSize: "1.2rem", p: 1 }}
               />
            </Box>

            <Stack spacing={2}>
              <Typography variant="h6">Certificate Details</Typography>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Certificate Number
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {certificate.number}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Student Name
                </Typography>
                <Typography variant="body1">
                  {studentName}
                </Typography>
              </Box>

                             <Box>
                 <Typography variant="body2" color="text.secondary">
                   Course
                 </Typography>
                 <Typography variant="body1">
                   {(certificate.courses as any)?.title || (certificate.courses as any)?.code || "Course"}
                 </Typography>
               </Box>

               <Box>
                 <Typography variant="body2" color="text.secondary">
                   Jurisdiction
                 </Typography>
                 <Typography variant="body1">
                   {(certificate.jurisdictions as any)?.name || (certificate.jurisdictions as any)?.code || "Jurisdiction"}
                 </Typography>
               </Box>

              {certificate.passed_at && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Passed Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(certificate.passed_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {certificate.issued_at && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Issued Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(certificate.issued_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {certificate.status === "void" && certificate.voided_at && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Voided Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(certificate.voided_at).toLocaleDateString()}
                  </Typography>
                  {certificate.void_reason && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Reason
                      </Typography>
                      <Typography variant="body1">
                        {certificate.void_reason}
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Stack>

            {certificate.status === "issued" && (
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  component={Link}
                  href={`/api/certificates/${certificate.number}`}
                  target="_blank"
                >
                  Download PDF
                </Button>
              </Stack>
            )}

            <Alert severity="info">
              <Typography variant="body2">
                This certificate was issued by our secure system. The QR code on the PDF 
                links directly to this verification page.
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
