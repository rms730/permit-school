"use client";

import { Button, Stack, TextField, Alert, Box } from "@mui/material";
import * as React from "react";
import { useState } from "react";

import { useDialog } from "@/app/providers/DialogProvider";
import { useSnack } from "@/app/providers/SnackbarProvider";

interface CertificateActionsProps {
  certificateId: string;
  status: string;
  number?: string;
}

export default function CertificateActions({ certificateId, status, number }: CertificateActionsProps) {
  const [loading, setLoading] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const { confirm } = useDialog();
  const { success, error: showError } = useSnack();

  const handleIssue = async () => {
    const confirmed = await confirm({
      title: "Issue Certificate",
      message: "Are you sure you want to issue this certificate? This action cannot be undone.",
      confirmText: "Issue Certificate",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificate_id: certificateId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to issue certificate");
      }

      success("Certificate issued successfully");
      // Reload the page to show updated status
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to issue certificate";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      showError("Please provide a reason for voiding the certificate");
      return;
    }

    const confirmed = await confirm({
      title: "Void Certificate",
      message: `Are you sure you want to void this certificate? This action cannot be undone.\n\nReason: ${voidReason}`,
      confirmText: "Void Certificate",
      cancelText: "Cancel",
      destructive: true,
    });

    if (!confirmed) return;

    setLoading(true);

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
        throw new Error(data.error || "Failed to void certificate");
      }

      setVoidReason("");
      success("Certificate voided successfully");
      // Reload the page to show updated status
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to void certificate";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidClick = async () => {
    // For now, we'll use a simple prompt for the reason
    // In a more sophisticated implementation, you might want a custom dialog
    const reason = window.prompt("Please enter a reason for voiding the certificate:");
    if (reason) {
      setVoidReason(reason);
      await handleVoid();
    }
  };

  return (
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
          onClick={handleVoidClick}
          disabled={loading}
          color="error"
        >
          Void Certificate
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
  );
}
