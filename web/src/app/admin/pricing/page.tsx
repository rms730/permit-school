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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import * as React from "react";

import PricingDialog from "./PricingDialog";
import AppBar from "@/components/AppBar";
import { getServerClient } from "@/lib/supabaseServer";


export default async function PricingPage() {
  const supabase = getServerClient();

  // Get courses with their pricing
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select(`
      id,
      code,
      title,
      jurisdictions!inner (
        code,
        name
      ),
      billing_prices (
        id,
        stripe_price_id,
        active,
        created_at
      )
    `)
    .order("jurisdictions.code", { ascending: true })
    .order("code", { ascending: true });

  if (coursesError) {
    return (
      <>
        <AppBar title="Pricing Management" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="error">Failed to load courses.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar title="Pricing Management" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">
              Pricing Management
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
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Active Prices</TableCell>
                  <TableCell>Latest Price ID</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses?.map((course) => {
                  const activePrices = course.billing_prices?.filter(p => p.active) || [];
                  const latestPrice = course.billing_prices?.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0];
                  const jurisdiction = course.jurisdictions?.[0];
                  
                  return (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Chip 
                          label={jurisdiction?.code || '-'} 
                          color="primary" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {course.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {course.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={activePrices.length} 
                          color={activePrices.length > 0 ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                          {latestPrice?.stripe_price_id || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <PricingDialog 
                          course={course}
                          prices={course.billing_prices || []}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {(!courses || courses.length === 0) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">
                No courses found.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
}
