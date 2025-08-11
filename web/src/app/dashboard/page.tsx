"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useRouter } from "next/navigation";

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
    if (!eligibility) return "Loading...";
    
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}!
      </Typography>

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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Enrollments
                </Typography>
                <Typography variant="h4">
                  {enrollments.filter(e => e.status === "active").length}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Seat Time
                </Typography>
                <Typography variant="h4">
                  {seatTime ? Math.round(seatTime.minutes_total) : 0} min
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={() => router.push("/courses")}
                sx={{ mt: 2 }}
              >
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Exam Eligibility */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exam Eligibility
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={getEligibilityStatus().text}
                  color={getEligibilityColor(getEligibilityStatus().status) as any}
                  sx={{ mb: 1 }}
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
                sx={{ mt: 2 }}
              >
                Take Exam
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button 
                  variant="contained" 
                  onClick={() => router.push("/courses")}
                >
                  Browse Courses
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push("/profile")}
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push("/billing")}
                >
                  Manage Subscription
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
