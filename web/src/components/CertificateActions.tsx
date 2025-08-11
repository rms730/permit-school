"use client";

import * as React from "react";
import { useState } from "react";
import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";

interface CertificateActionsProps {
  certificateId: string;
  status: string;
  number?: string;
}

export default function CertificateActions({ certificateId, status, number }: CertificateActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  const handleIssue = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificate_id: certificateId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to issue certificate");
        return;
      }

      // Reload the page to show updated status
      window.location.reload();
    } catch (err) {
      console.error("Issue certificate error:", err);
      setError("Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/certificates/void", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          certificate_id: certificateId,
          reason: voidReason 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to void certificate");
        return;
      }

      setShowVoidDialog(false);
      setVoidReason("");
      // Reload the page to show updated status
      window.location.reload();
    } catch (err) {
      console.error("Void certificate error:", err);
      setError("Failed to void certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        {status === "draft" && (
          <Button
            variant="contained"
            size="small"
            onClick={handleIssue}
            disabled={loading}
          >
            Issue PDF
          </Button>
        )}
        
        {status === "issued" && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowVoidDialog(true)}
            disabled={loading}
            color="error"
          >
            Void
          </Button>
        )}

        {status === "issued" && number && (
          <Button
            variant="outlined"
            size="small"
            component="a"
            href={`/api/certificates/${number}`}
            target="_blank"
          >
            PDF
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Dialog open={showVoidDialog} onClose={() => setShowVoidDialog(false)}>
        <DialogTitle>Void Certificate</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Reason for voiding"
            fullWidth
            variant="outlined"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVoidDialog(false)}>Cancel</Button>
          <Button onClick={handleVoid} color="error" disabled={loading}>
            Void Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
