"use client";

import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

interface ProfileData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  dob: string;
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Check if user is minor
        if (data.dob) {
          const dob = new Date(data.dob);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const isMinorUser = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());
          setIsMinor(isMinorUser);
        }
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Profile not found. Please complete your profile first.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push("/onboarding")}
          sx={{ mt: 2 }}
        >
          Complete Profile
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name *"
              value={profile.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name *"
              value={profile.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Middle Name"
              value={profile.middle_name || ""}
              onChange={(e) => handleInputChange("middle_name", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date of Birth *"
              value={profile.dob ? new Date(profile.dob) : null}
              onChange={(date: Date | null) => handleInputChange("dob", date ? date.toISOString().split("T")[0] : "")}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={profile.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Address
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 1 *"
              value={profile.address_line1}
              onChange={(e) => handleInputChange("address_line1", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={profile.address_line2 || ""}
              onChange={(e) => handleInputChange("address_line2", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City *"
              value={profile.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="State *"
              value={profile.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ZIP Code *"
              value={profile.postal_code}
              onChange={(e) => handleInputChange("postal_code", e.target.value)}
            />
          </Grid>

          {/* Guardian Information (if minor) */}
          {isMinor && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Guardian Information (Required for students under 18)
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Guardian Name *"
                  value={profile.guardian_name || ""}
                  onChange={(e) => handleInputChange("guardian_name", e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian Email *"
                  type="email"
                  value={profile.guardian_email || ""}
                  onChange={(e) => handleInputChange("guardian_email", e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian Phone *"
                  value={profile.guardian_phone || ""}
                  onChange={(e) => handleInputChange("guardian_phone", e.target.value)}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
