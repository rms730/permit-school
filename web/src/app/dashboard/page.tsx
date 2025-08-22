"use client";

import {
  School,
  TrendingUp,
  Receipt,
  Person,
  ArrowForward,
} from '@mui/icons-material';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import AppShell from '@/components/layout/AppShell';

interface ProfileData {
  first_name: string;
  last_name: string;
  is_profile_complete: boolean;
}

interface EnrollmentData {
  id: string;
  course_id: string;
  status: string;
  started_at: string;
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

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [seatTime, setSeatTime] = useState<SeatTimeData | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profileResponse = await fetch("/api/profile");
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Load enrollments
      const enrollmentsResponse = await fetch("/api/enrollments");
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        setEnrollments(enrollmentsData);
      }

      // Load seat time
      const seatTimeResponse = await fetch("/api/progress/seat-time");
      if (seatTimeResponse.ok) {
        const seatTimeData = await seatTimeResponse.json();
        setSeatTime(seatTimeData);
      }

      // Load exam eligibility
      const eligibilityResponse = await fetch("/api/exam/eligibility");
      if (eligibilityResponse.ok) {
        const eligibilityData = await eligibilityResponse.json();
        setEligibility(eligibilityData);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityStatus = () => {
    if (!eligibility) return { status: "info", text: "Loading..." };
    
    if (eligibility.eligible) {
      return { status: "success", text: "Eligible for Exam" };
    }
    
    switch (eligibility.reason) {
      case "profile_incomplete":
        return { status: "warning", text: "Profile Incomplete" };
      case "guardian_consent_required":
        return { status: "warning", text: "Guardian Consent Required" };
      case "seat-time":
        return { status: "info", text: "More Seat Time Required" };
      case "entitlement":
        return { status: "error", text: "No Active Subscription" };
      default:
        return { status: "error", text: "Not Eligible" };
    }
  };

  const getEligibilityColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "warning": return "warning";
      case "info": return "info";
      case "error": return "error";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Ready to continue your learning journey?
          </Typography>
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Completion Banner */}
      {profile && !profile.is_profile_complete && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => router.push("/onboarding")}>
              Complete Profile
            </Button>
          }
        >
          Please complete your profile to access exams and certificates.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Progress Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Your Progress
                </Typography>
              </Box>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Enrollments
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {enrollments.filter(e => e.status === "active").length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Seat Time
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {seatTime ? Math.round(seatTime.minutes_total) : 0} min
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => router.push("/courses")}
                  endIcon={<ArrowForward />}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  Continue Learning
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Exam Eligibility */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <School sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Exam Eligibility
                </Typography>
              </Box>
              <Stack spacing={3}>
                <Box>
                  <Chip 
                    label={getEligibilityStatus().text}
                    color={getEligibilityColor(getEligibilityStatus().status) as any}
                    sx={{ mb: 2, fontSize: '1rem', py: 1 }}
                  />
                  {eligibility?.reason === "seat-time" && (
                    <Typography variant="body2" color="text.secondary">
                      {eligibility.minutesTotal} / {eligibility.minutesRequired} minutes required
                    </Typography>
                  )}
                  {eligibility?.reason === "profile_incomplete" && eligibility.missing_fields && (
                    <Typography variant="body2" color="text.secondary">
                      Missing: {eligibility.missing_fields.join(", ")}
                    </Typography>
                  )}
                </Box>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push("/exam")}
                  disabled={!eligibility?.eligible}
                  endIcon={<ArrowForward />}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  Take Exam
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => router.push("/courses")}
                    startIcon={<School />}
                    sx={{ py: 2 }}
                  >
                    Browse Courses
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => router.push("/profile")}
                    startIcon={<Person />}
                    sx={{ py: 2 }}
                  >
                    Edit Profile
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => router.push("/billing")}
                    startIcon={<Receipt />}
                    sx={{ py: 2 }}
                  >
                    Manage Billing
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => router.push("/exam")}
                    startIcon={<School />}
                    sx={{ py: 2 }}
                  >
                    Take Exam
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
    </AppShell>
  );
}
