"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import * as React from "react";

interface UnitEditDialogProps {
  open: boolean;
  onClose: () => void;
  unit: {
    id: string;
    title: string;
    minutes_required: number;
    objectives: string | null;
    is_published: boolean;
  } | null;
  onSave: (unitId: string, data: {
    title: string;
    minutes_required: number;
    objectives: string;
    is_published: boolean;
  }) => Promise<void>;
}

export default function UnitEditDialog({
  open,
  onClose,
  unit,
  onSave,
}: UnitEditDialogProps) {
  const [title, setTitle] = React.useState("");
  const [minutesRequired, setMinutesRequired] = React.useState(30);
  const [objectives, setObjectives] = React.useState("");
  const [isPublished, setIsPublished] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (unit) {
      setTitle(unit.title);
      setMinutesRequired(unit.minutes_required);
      setObjectives(unit.objectives || "");
      setIsPublished(unit.is_published);
    }
  }, [unit]);

  const handleSave = async () => {
    if (!unit) return;
    
    setIsLoading(true);
    try {
      await onSave(unit.id, {
        title,
        minutes_required: minutesRequired,
        objectives,
        is_published: isPublished,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save unit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {unit ? "Edit Unit" : "New Unit"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Unit Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          
          <TextField
            label="Minutes Required"
            type="number"
            value={minutesRequired}
            onChange={(e) => setMinutesRequired(parseInt(e.target.value) || 30)}
            fullWidth
            required
            inputProps={{ min: 5, max: 240 }}
            helperText="Between 5 and 240 minutes"
          />
          
          <TextField
            label="Learning Objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            fullWidth
            multiline
            rows={4}
            helperText="Describe what students will learn in this unit"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
            }
            label="Published (visible to students)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
