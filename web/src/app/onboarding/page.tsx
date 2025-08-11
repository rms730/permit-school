"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter } from "next/navigation";

interface ProfileData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  dob: Date | null;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
}

const steps = [
  "About You",
  "Address",
  "Guardian (if under 18)",
  "Agreements",
  "Review",
];

export default function OnboardingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    middle_name: "",
    dob: null,
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "CA",
    postal_code: "",
    guardian_name: "",
    guardian_email: "",
    guardian_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is minor based on DOB
    if (profileData.dob) {
      const today = new Date();
      const age = today.getFullYear() - profileData.dob.getFullYear();
      const monthDiff = today.getMonth() - profileData.dob.getMonth();
      const isMinorUser = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < profileData.dob.getDate());
      setIsMinor(isMinorUser);
    }
  }, [profileData.dob]);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save profile
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          dob: profileData.dob?.toISOString().split("T")[0],
          terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
          privacy_accepted_at: privacyAccepted ? new Date().toISOString() : null,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      // Record consents
      if (termsAccepted) {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent_type: "terms" }),
        });
      }

      if (privacyAccepted) {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent_type: "privacy" }),
        });
      }

      if (isMinor && profileData.guardian_name) {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            consent_type: "guardian",
            payload: {
              guardian_name: profileData.guardian_name,
              guardian_email: profileData.guardian_email,
              guardian_phone: profileData.guardian_phone,
            }
          }),
        });
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tell us about yourself
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <input
                type="text"
                placeholder="First Name *"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <input
                type="text"
                placeholder="Last Name *"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </Box>
            <input
              type="text"
              placeholder="Middle Name (optional)"
              value={profileData.middle_name}
              onChange={(e) => setProfileData({ ...profileData, middle_name: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
            />
            <DatePicker
              label="Date of Birth *"
              value={profileData.dob}
              onChange={(date) => setProfileData({ ...profileData, dob: date })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                },
              }}
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "16px" }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Address
            </Typography>
            <input
              type="text"
              placeholder="Address Line 1 *"
              value={profileData.address_line1}
              onChange={(e) => setProfileData({ ...profileData, address_line1: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
            />
            <input
              type="text"
              placeholder="Address Line 2 (optional)"
              value={profileData.address_line2}
              onChange={(e) => setProfileData({ ...profileData, address_line2: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
            />
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <input
                type="text"
                placeholder="City *"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <input
                type="text"
                placeholder="State *"
                value={profileData.state}
                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                style={{ width: "80px", padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <input
                type="text"
                placeholder="ZIP Code *"
                value={profileData.postal_code}
                onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })}
                style={{ width: "120px", padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </Box>
          </Box>
        );

      case 2:
        if (!isMinor) {
          return (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Guardian Information
              </Typography>
              <Typography color="text.secondary">
                You are 18 or older, so guardian information is not required.
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Guardian Information (Required for students under 18)
            </Typography>
            <input
              type="text"
              placeholder="Guardian Name *"
              value={profileData.guardian_name}
              onChange={(e) => setProfileData({ ...profileData, guardian_name: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
            />
            <input
              type="email"
              placeholder="Guardian Email *"
              value={profileData.guardian_email}
              onChange={(e) => setProfileData({ ...profileData, guardian_email: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }}
            />
            <input
              type="tel"
              placeholder="Guardian Phone *"
              value={profileData.guardian_phone}
              onChange={(e) => setProfileData({ ...profileData, guardian_phone: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Terms and Agreements
            </Typography>
            <Box sx={{ mb: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <Typography>
                  I accept the Terms of Service *
                </Typography>
              </label>
            </Box>
            <Box sx={{ mb: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                />
                <Typography>
                  I accept the Privacy Policy *
                </Typography>
              </label>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Name:</Typography>
              <Typography>
                {profileData.first_name} {profileData.middle_name} {profileData.last_name}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Date of Birth:</Typography>
              <Typography>
                {profileData.dob?.toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Address:</Typography>
              <Typography>
                {profileData.address_line1}
                {profileData.address_line2 && <br />}
                {profileData.address_line2}
                <br />
                {profileData.city}, {profileData.state} {profileData.postal_code}
              </Typography>
            </Box>
            {isMinor && profileData.guardian_name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Guardian:</Typography>
                <Typography>
                  {profileData.guardian_name}
                  <br />
                  {profileData.guardian_email}
                  <br />
                  {profileData.guardian_phone}
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return profileData.first_name && profileData.last_name && profileData.dob;
      case 1:
        return profileData.address_line1 && profileData.city && profileData.state && profileData.postal_code;
      case 2:
        return !isMinor || (profileData.guardian_name && profileData.guardian_email && profileData.guardian_phone);
      case 3:
        return termsAccepted && privacyAccepted;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Complete Your Profile
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : activeStep === steps.length - 1 ? (
              "Finish"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
