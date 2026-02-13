"use client";

import {
  ArrowForward,
  AutoStories,
  CheckCircle,
  FactCheck,
  Person,
  Receipt,
  School,
  TrendingUp,
  WarningAmber,
  WorkspacePremium,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import React from 'react';

import AppShell from '@/components/layout/AppShell';

type CourseInfo = {
  title?: string | null;
  code?: string | null;
};

interface ProfileData {
  first_name?: string;
  is_profile_complete?: boolean;
}

interface EnrollmentData {
  id: string;
  course_id: string;
  status: string;
  started_at: string;
  completed_at?: string | null;
  courses?: CourseInfo | null;
}

interface SeatTimeData {
  minutes_total: number;
}

interface EligibilityData {
  eligible: boolean;
  reason?: string;
  minutesTotal?: number;
  minutesRequired?: number;
  missing_fields?: string[];
}

interface DashboardState {
  profile: ProfileData | null;
  enrollments: EnrollmentData[];
  seatTime: SeatTimeData | null;
  eligibility: EligibilityData | null;
}

interface ActionPlan {
  cta: string;
  description: string;
  href: string;
  title: string;
}

const INITIAL_STATE: DashboardState = {
  profile: null,
  enrollments: [],
  seatTime: null,
  eligibility: null,
};

function formatDate(input?: string | null): string {
  if (!input) return 'N/A';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.valueOf())) return 'N/A';
  return parsed.toLocaleDateString();
}

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = React.useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileResponse, enrollmentsResponse, seatTimeResponse, eligibilityResponse] =
        await Promise.all([
          fetch('/api/profile', { cache: 'no-store' }),
          fetch('/api/enrollments', { cache: 'no-store' }),
          fetch('/api/progress/seat-time', { cache: 'no-store' }),
          fetch('/api/exam/eligibility', { cache: 'no-store' }),
        ]);

      if (!profileResponse.ok || !enrollmentsResponse.ok || !eligibilityResponse.ok) {
        throw new Error('Unable to load dashboard resources.');
      }

      const [profile, enrollments, seatTime, eligibility] = await Promise.all([
        profileResponse.json(),
        enrollmentsResponse.json(),
        seatTimeResponse.ok ? seatTimeResponse.json() : Promise.resolve(null),
        eligibilityResponse.json(),
      ]);

      setData({
        profile: profile ?? null,
        enrollments: Array.isArray(enrollments) ? enrollments : [],
        seatTime: seatTime ?? null,
        eligibility: eligibility ?? null,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const enrollmentFeed = React.useMemo(
    () =>
      [...data.enrollments].sort(
        (a, b) => new Date(b.started_at).valueOf() - new Date(a.started_at).valueOf()
      ),
    [data.enrollments]
  );

  const activeEnrollments = enrollmentFeed.filter(enrollment => enrollment.status === 'active');
  const completedEnrollments = enrollmentFeed.filter(enrollment => enrollment.status === 'completed');
  const latestEnrollment = enrollmentFeed[0] ?? null;
  const totalMinutes = Math.round(data.seatTime?.minutes_total ?? 0);
  const minutesTarget = Math.max(data.eligibility?.minutesRequired ?? 0, 1);
  const minutesProgress = Math.min(100, Math.round((totalMinutes / minutesTarget) * 100));

  const eligibilityStatus = React.useMemo(() => {
    if (!data.eligibility) {
      return {
        color: 'default' as const,
        helper: 'Checking your profile, seat-time, and subscription.',
        icon: <TrendingUp sx={{ fontSize: 18 }} />,
        label: 'Loading status',
      };
    }

    if (data.eligibility.eligible) {
      return {
        color: 'success' as const,
        helper: 'You can start the exam whenever you are ready.',
        icon: <CheckCircle sx={{ fontSize: 18 }} />,
        label: 'Eligible for final exam',
      };
    }

    switch (data.eligibility.reason) {
      case 'profile_incomplete':
        return {
          color: 'warning' as const,
          helper: data.eligibility.missing_fields?.length
            ? `Missing fields: ${data.eligibility.missing_fields.join(', ')}`
            : 'Finish profile fields and policy acceptance.',
          icon: <WarningAmber sx={{ fontSize: 18 }} />,
          label: 'Profile incomplete',
        };
      case 'guardian_consent_required':
        return {
          color: 'warning' as const,
          helper: 'Guardian verification is required before final exam access.',
          icon: <WarningAmber sx={{ fontSize: 18 }} />,
          label: 'Guardian consent required',
        };
      case 'seat-time':
        return {
          color: 'info' as const,
          helper: `${Math.round(data.eligibility.minutesTotal ?? 0)} / ${Math.round(
            data.eligibility.minutesRequired ?? 0
          )} minutes complete`,
          icon: <TrendingUp sx={{ fontSize: 18 }} />,
          label: 'Seat-time still required',
        };
      case 'entitlement':
        return {
          color: 'error' as const,
          helper: 'Activate a subscription to unlock exam and premium flow.',
          icon: <WorkspacePremium sx={{ fontSize: 18 }} />,
          label: 'Subscription required',
        };
      default:
        return {
          color: 'default' as const,
          helper: 'Complete required steps and check back.',
          icon: <WarningAmber sx={{ fontSize: 18 }} />,
          label: 'Not eligible yet',
        };
    }
  }, [data.eligibility]);

  const actionPlan = React.useMemo<ActionPlan>(() => {
    if (!data.profile?.is_profile_complete) {
      return {
        cta: 'Finish profile',
        description: 'Complete required profile fields so your progress and exam eligibility update correctly.',
        href: '/onboarding',
        title: 'Complete onboarding',
      };
    }

    if (data.eligibility?.reason === 'entitlement') {
      return {
        cta: 'Open billing',
        description: 'Your learning tools are active, but exam and premium access need an active plan.',
        href: '/billing',
        title: 'Activate plan access',
      };
    }

    if (data.eligibility?.reason === 'seat-time') {
      return {
        cta: 'Continue lessons',
        description: 'You are close. Continue reading sections and quizzes to finish remaining seat-time.',
        href: '/courses',
        title: 'Finish seat-time requirement',
      };
    }

    if (data.eligibility?.eligible) {
      return {
        cta: 'Start final exam',
        description: 'You have unlocked the final exam. Take it now while your momentum is high.',
        href: '/exam/start',
        title: 'Ready for final exam',
      };
    }

    return {
      cta: 'Review eligibility',
      description: 'Check the readiness checklist to see exactly what is still required.',
      href: '/exam',
      title: 'Review readiness checklist',
    };
  }, [data.eligibility, data.profile?.is_profile_complete]);

  if (loading) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack spacing={3} alignItems="center" justifyContent="center" minHeight="60vh">
            <CircularProgress />
            <Typography color="text.secondary">Loading your dashboard...</Typography>
          </Stack>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Card
          sx={{
            mb: 3,
            background:
              'linear-gradient(145deg, rgba(12,46,79,0.95) 0%, rgba(15,110,207,0.88) 58%, rgba(23,134,111,0.9) 100%)',
            color: 'common.white',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.2}>
              <Typography variant="h3" sx={{ color: 'common.white' }}>
                Welcome back{data.profile?.first_name ? `, ${data.profile.first_name}` : ''}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.92)' }}>
                Your learning hub is up to date. Pick the next best action and keep moving toward exam
                readiness.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button
                  variant="contained"
                  onClick={() => router.push('/courses')}
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#0a4f95',
                    '&:hover': { backgroundColor: '#ecf4ff' },
                  }}
                >
                  Continue learning
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/exam')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'common.white',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Open eligibility checklist
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => void loadDashboardData()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        {data.profile && !data.profile.is_profile_complete ? (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => router.push('/onboarding')}>
                Complete profile
              </Button>
            }
          >
            Complete profile details to unlock exams and certificate workflows.
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid xs={12} sm={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.2}>
                  <AutoStories color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Active enrollments
                  </Typography>
                  <Typography variant="h3">{activeEnrollments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {completedEnrollments.length} completed
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.2}>
                  <TrendingUp color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Total seat-time
                  </Typography>
                  <Typography variant="h3">{totalMinutes} min</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {minutesProgress}% of current requirement
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.2}>
                  <FactCheck color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Final exam status
                  </Typography>
                  <Chip
                    icon={eligibilityStatus.icon}
                    label={eligibilityStatus.label}
                    color={eligibilityStatus.color}
                    sx={{ width: 'fit-content' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {eligibilityStatus.helper}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.2}>
                  <Person color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Profile status
                  </Typography>
                  <Chip
                    label={data.profile?.is_profile_complete ? 'Complete' : 'Needs updates'}
                    color={data.profile?.is_profile_complete ? 'success' : 'warning'}
                    sx={{ width: 'fit-content' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Keep account data current for compliance and communication.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid xs={12} lg={7}>
            <Stack spacing={2.5}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5">Current enrollment activity</Typography>
                    <Divider />

                    {enrollmentFeed.length === 0 ? (
                      <Alert severity="info">
                        No enrollments found yet. Browse available courses to begin.
                      </Alert>
                    ) : (
                      <Stack spacing={1.3}>
                        {enrollmentFeed.slice(0, 4).map(enrollment => (
                          <Box
                            key={enrollment.id}
                            sx={{
                              p: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                            }}
                          >
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1.2}
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              justifyContent="space-between"
                            >
                              <Box>
                                <Typography fontWeight={600}>
                                  {enrollment.courses?.title ?? 'Driver Education Course'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {enrollment.courses?.code ?? enrollment.course_id} • Started{' '}
                                  {formatDate(enrollment.started_at)}
                                </Typography>
                              </Box>
                              <Chip
                                label={enrollment.status}
                                color={enrollment.status === 'active' ? 'primary' : 'default'}
                                size="small"
                              />
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                      <Button variant="contained" startIcon={<School />} onClick={() => router.push('/courses')}>
                        Browse courses
                      </Button>
                      <Button variant="outlined" startIcon={<Receipt />} onClick={() => router.push('/billing')}>
                        Manage billing
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Seat-time momentum</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {totalMinutes} of {minutesTarget} minutes tracked toward eligibility.
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={minutesProgress}
                      sx={{ height: 10, borderRadius: 999 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Keep reading lessons and completing section quizzes to close this gap quickly.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid xs={12} lg={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h5">Recommended next step</Typography>
                  <Divider />

                  <Box
                    sx={{
                      p: 1.6,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      backgroundColor: 'rgba(15,110,207,0.04)',
                    }}
                  >
                    <Typography fontWeight={700} sx={{ mb: 0.4 }}>
                      {actionPlan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {actionPlan.description}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push(actionPlan.href)}
                      sx={{ mt: 1.5 }}
                    >
                      {actionPlan.cta}
                    </Button>
                  </Box>

                  <Typography variant="h6">Quick actions</Typography>
                  <Stack spacing={1.1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/courses')}
                      startIcon={<School />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Continue learning
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/exam')}
                      startIcon={<WorkspacePremium />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Review exam status
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/profile')}
                      startIcon={<Person />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Edit profile
                    </Button>
                  </Stack>

                  {latestEnrollment ? (
                    <Box
                      sx={{
                        p: 1.4,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
                        Latest enrollment
                      </Typography>
                      <Typography fontWeight={600}>
                        {latestEnrollment.courses?.title ?? 'Driver Education Course'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Started {formatDate(latestEnrollment.started_at)}
                      </Typography>
                    </Box>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppShell>
  );
}
