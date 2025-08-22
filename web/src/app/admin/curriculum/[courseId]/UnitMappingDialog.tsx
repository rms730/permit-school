"use client";

import { Delete, Add } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Divider,
  Box,
} from "@mui/material";
import * as React from "react";

interface ChunkMapping {
  ord: number;
  chunk_id: number;
  snippet: string;
  score?: number;
}

interface UnitMappingDialogProps {
  open: boolean;
  onClose: () => void;
  unitId: string;
  unitTitle: string;
  currentMappings: ChunkMapping[];
  onSave: (unitId: string, mappings: ChunkMapping[], action: 'replace' | 'append') => Promise<void>;
  onSuggest: (unitId: string) => Promise<ChunkMapping[]>;
}

export default function UnitMappingDialog({
  open,
  onClose,
  unitId,
  unitTitle,
  currentMappings,
  onSave,
  onSuggest,
}: UnitMappingDialogProps) {
  const [mappings, setMappings] = React.useState<ChunkMapping[]>([]);
  const [suggestions, setSuggestions] = React.useState<ChunkMapping[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = React.useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMappings([...currentMappings]);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
    }
  }, [open, currentMappings]);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const newSuggestions = await onSuggest(unitId);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSave = async (action: 'replace' | 'append') => {
    setIsLoading(true);
    try {
      let finalMappings = [...mappings];
      
      if (action === 'append' && selectedSuggestions.size > 0) {
        const maxOrd = mappings.length > 0 ? Math.max(...mappings.map(m => m.ord)) : 0;
        const newMappings = suggestions
          .filter((_, index) => selectedSuggestions.has(index))
          .map((suggestion, index) => ({
            ...suggestion,
            ord: maxOrd + index + 1,
          }));
        finalMappings = [...mappings, ...newMappings];
      } else if (action === 'replace' && selectedSuggestions.size > 0) {
        finalMappings = suggestions
          .filter((_, index) => selectedSuggestions.has(index))
          .map((suggestion, index) => ({
            ...suggestion,
            ord: index + 1,
          }));
      }
      
      await onSave(unitId, finalMappings, action);
      onClose();
    } catch (error) {
      console.error("Failed to save mappings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMapping = (ord: number) => {
    setMappings(mappings.filter(m => m.ord !== ord));
  };

  const handleToggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleClose = () => {
    if (!isLoading && !isSuggesting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Map Content for: {unitTitle}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Current Mappings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Mappings ({mappings.length})
            </Typography>
            <List dense>
              {mappings.map((mapping) => (
                <ListItem key={mapping.ord}>
                  <ListItemText
                    primary={`${mapping.ord}. ${mapping.snippet.substring(0, 100)}...`}
                    secondary={`Chunk ID: ${mapping.chunk_id}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMapping(mapping.ord)}
                      disabled={isLoading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            {mappings.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No content mapped to this unit.
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Suggestions */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Content Suggestions
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleSuggest}
                disabled={isSuggesting || isLoading}
              >
                {isSuggesting ? "Loading..." : "Get Suggestions"}
              </Button>
            </Stack>

            {suggestions.length > 0 && (
              <>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedSuggestions(new Set(suggestions.map((_, i) => i)))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedSuggestions(new Set())}
                  >
                    Clear All
                  </Button>
                </Stack>

                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSuggestions.has(index)}
                            onChange={() => handleToggleSuggestion(index)}
                            disabled={isLoading}
                          />
                        }
                        label=""
                      />
                      <ListItemText
                        primary={suggestion.snippet.substring(0, 140) + "..."}
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip label={`Chunk ${suggestion.chunk_id}`} size="small" />
                            {suggestion.score && (
                              <Chip 
                                label={`Score: ${suggestion.score.toFixed(2)}`} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading || isSuggesting}>
          Cancel
        </Button>
        {selectedSuggestions.size > 0 && (
          <>
            <Button
              onClick={() => handleSave('replace')}
              variant="contained"
              disabled={isLoading || isSuggesting}
            >
              Replace All
            </Button>
            <Button
              onClick={() => handleSave('append')}
              variant="contained"
              disabled={isLoading || isSuggesting}
            >
              Append Selected
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
