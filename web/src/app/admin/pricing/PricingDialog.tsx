"use client";

import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";

interface BillingPrice {
  id: string;
  stripe_price_id: string;
  active: boolean;
  created_at: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  jurisdictions?: {
    code: string;
    name: string;
  }[];
}

interface Props {
  course: Course;
  prices: BillingPrice[];
}

export default function PricingDialog({ course, prices }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPriceId, setNewPriceId] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setNewPriceId("");
  };

  const handleAddPrice = async () => {
    if (!newPriceId.trim()) {
      setError("Please enter a Stripe price ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pricing/${course.id}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripe_price_id: newPriceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add price");
      }

      setNewPriceId("");
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrice = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pricing/${course.id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price_id: priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle price");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
      >
        Manage Pricing
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Pricing for {course.title} ({course.code})
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add New Price
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Stripe Price ID"
                  value={newPriceId}
                  onChange={(e) => setNewPriceId(e.target.value)}
                  placeholder="price_..."
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleAddPrice}
                  disabled={loading || !newPriceId.trim()}
                >
                  Add Price
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Existing Prices
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Price ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prices.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                            {price.stripe_price_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={price.active ? "Active" : "Inactive"} 
                            color={price.active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontSize="0.75rem">
                            {new Date(price.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleTogglePrice(price.id)}
                            disabled={loading}
                          >
                            {price.active ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {prices.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No prices configured for this course.
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
