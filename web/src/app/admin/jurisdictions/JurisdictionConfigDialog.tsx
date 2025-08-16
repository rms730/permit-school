"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { useState } from "react";

interface JurisdictionConfig {
  final_exam_questions: number;
  final_exam_pass_pct: number;
  seat_time_required_minutes: number;
  certificate_prefix: string;
  certificate_issuer_name?: string;
  certificate_issuer_license?: string;
  disclaimer?: string;
  support_email?: string;
  support_phone?: string;
  terms_url?: string;
  privacy_url?: string;
  regulatory_signing_secret?: string;
  fulfillment_low_stock_threshold?: number;
}

interface Jurisdiction {
  id: string;
  code: string;
  name: string;
}

interface Props {
  jurisdiction: Jurisdiction;
  config: JurisdictionConfig | null;
}

export default function JurisdictionConfigDialog({ jurisdiction, config }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<JurisdictionConfig>({
    final_exam_questions: config?.final_exam_questions || 30,
    final_exam_pass_pct: config?.final_exam_pass_pct || 0.8,
    seat_time_required_minutes: config?.seat_time_required_minutes || 150,
    certificate_prefix: config?.certificate_prefix || jurisdiction.code,
    certificate_issuer_name: config?.certificate_issuer_name || "",
    certificate_issuer_license: config?.certificate_issuer_license || "",
    disclaimer: config?.disclaimer || "",
    support_email: config?.support_email || "",
    support_phone: config?.support_phone || "",
    terms_url: config?.terms_url || "",
    privacy_url: config?.privacy_url || "",
    regulatory_signing_secret: config?.regulatory_signing_secret || "",
    fulfillment_low_stock_threshold: config?.fulfillment_low_stock_threshold || 200,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/jconfig/${jurisdiction.code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      handleClose();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof JurisdictionConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
      >
        {config ? "Edit Config" : "Add Config"}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Configure {jurisdiction.name} ({jurisdiction.code})
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                label="Final Exam Questions"
                type="number"
                value={formData.final_exam_questions}
                onChange={(e) => handleInputChange("final_exam_questions", parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 1, max: 100 }}
              />
              <TextField
                label="Pass Percentage"
                type="number"
                value={formData.final_exam_pass_pct}
                onChange={(e) => handleInputChange("final_exam_pass_pct", parseFloat(e.target.value))}
                fullWidth
                inputProps={{ min: 0.1, max: 1, step: 0.1 }}
                helperText="Enter as decimal (e.g., 0.8 for 80%)"
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Required Seat Time (minutes)"
                type="number"
                value={formData.seat_time_required_minutes}
                onChange={(e) => handleInputChange("seat_time_required_minutes", parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Certificate Prefix"
                value={formData.certificate_prefix}
                onChange={(e) => handleInputChange("certificate_prefix", e.target.value)}
                fullWidth
                helperText="Used in certificate numbering"
              />
            </Stack>

            <TextField
              label="Disclaimer"
              value={formData.disclaimer}
              onChange={(e) => handleInputChange("disclaimer", e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Support Email"
                type="email"
                value={formData.support_email}
                onChange={(e) => handleInputChange("support_email", e.target.value)}
                fullWidth
              />
              <TextField
                label="Terms URL"
                value={formData.terms_url}
                onChange={(e) => handleInputChange("terms_url", e.target.value)}
                fullWidth
                helperText="Relative path (e.g., /terms)"
              />
            </Stack>

            <TextField
              label="Privacy URL"
              value={formData.privacy_url}
              onChange={(e) => handleInputChange("privacy_url", e.target.value)}
              fullWidth
              helperText="Relative path (e.g., /privacy)"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Certificate Issuer Name"
                value={formData.certificate_issuer_name}
                onChange={(e) => handleInputChange("certificate_issuer_name", e.target.value)}
                fullWidth
                helperText="e.g., Acme Driving Academy"
              />
              <TextField
                label="Certificate Issuer License"
                value={formData.certificate_issuer_license}
                onChange={(e) => handleInputChange("certificate_issuer_license", e.target.value)}
                fullWidth
                helperText="e.g., CA-INS-000123"
              />
            </Stack>

            <TextField
              label="Support Phone"
              value={formData.support_phone}
              onChange={(e) => handleInputChange("support_phone", e.target.value)}
              fullWidth
              helperText="e.g., 1-800-PERMIT"
            />

            <TextField
              label="Regulatory Signing Secret"
              value={formData.regulatory_signing_secret}
              onChange={(e) => handleInputChange("regulatory_signing_secret", e.target.value)}
              type="password"
              fullWidth
              helperText="Secret key for signing regulatory reports"
            />

            <TextField
              label="Fulfillment Low Stock Threshold"
              type="number"
              value={formData.fulfillment_low_stock_threshold}
              onChange={(e) => handleInputChange("fulfillment_low_stock_threshold", parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
              helperText="Alert threshold for certificate inventory"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
