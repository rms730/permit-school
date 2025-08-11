import * as React from "react";
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
  Stack,
  Button,
} from "@mui/material";
import { getServerClient } from "@/lib/supabaseServer";
import AppBar from "@/components/AppBar";

export default async function AdminCertificatesPage() {
  const supabase = getServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="Admin - Certificates" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>You must sign in to view this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get certificates with user and course info
  const { data: certificates, error: certificatesError } = await supabase
    .from("certificates")
    .select(`
      id,
      student_id,
      course_id,
      status,
      passed_at,
      created_at,
      courses(title, code),
      jurisdictions(name, code)
    `)
    .order("created_at", { ascending: false });

  if (certificatesError) {
    return (
      <>
        <AppBar title="Admin - Certificates" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load certificates.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Get user emails for display
  const userIds = certificates?.map(c => c.student_id) || [];
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  const userMap = new Map();
  if (!usersError && users) {
    users.users.forEach(user => {
      userMap.set(user.id, user.email);
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'ready': return 'success';
      case 'queued': return 'info';
      case 'mailed': return 'success';
      case 'void': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <AppBar title="Admin - Certificates" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">
              Certificates
            </Typography>
            <Button
              variant="outlined"
              component="a"
              href="/api/admin/certificates/export"
              download="certificates.csv"
            >
              Export CSV
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Passed</TableCell>
                  <TableCell>Issued</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certificates?.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      {userMap.get(cert.student_id) || cert.student_id}
                    </TableCell>
                    <TableCell>
                      {(cert.courses as any)?.title || (cert.courses as any)?.code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {(cert.jurisdictions as any)?.name || (cert.jurisdictions as any)?.code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={cert.status}
                        color={getStatusColor(cert.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {cert.passed_at 
                        ? new Date(cert.passed_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(cert.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!certificates || certificates.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No certificates found.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
