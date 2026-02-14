import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Typography,
  Button,
  Alert,
  Box,
  Card,
  CardContent,

} from "@mui/material";
import Grid from '@mui/material/Grid';
import Link from "next/link";

import { Container as ContainerComponent } from "@/components/Container";
import { SimpleHeader } from "@/components/SimpleHeader";

export default function PracticePage() {
  return (
    <>
      <SimpleHeader />
      <ContainerComponent>
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 2,
              }}
            >
              Start Your Practice Journey
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
              }}
            >
              Create an account or sign in to continue with full course practice and exam prep.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            <Grid
              xs={12}
              md={5}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                      Create Your Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Start with guided onboarding
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                    Set up your profile and unlock your course, study progress, and exam preparation tools.
                  </Typography>
                  
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<SchoolIcon />}
                  >
                    Create Account
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              xs={12}
              md={5}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                      Already Have an Account?
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to continue
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                    Sign in to access your saved progress and continue where you left off.
                  </Typography>
                  
                  <Button
                    component={Link}
                    href="/login"
                    variant="outlined"
                    size="large"
                    fullWidth
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2">
                <strong>Need access?</strong> Create an account to start learning and billing-ready practice flows.
              </Typography>
            </Alert>
          </Box>
        </Box>
      </ContainerComponent>
    </>
  );
}
