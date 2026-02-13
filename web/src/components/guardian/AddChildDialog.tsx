"use client";

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert
} from '@mui/material';
import { forwardRef, useState } from 'react';

import { useSnack } from '@/app/providers/SnackbarProvider';

interface AddChildDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (childId: string) => void;
}

interface ChildFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  relationship: string;
}

export const AddChildDialog = forwardRef<HTMLDivElement, AddChildDialogProps>(
  ({ open, onClose, onSuccess }, ref) => {
    const [formData, setFormData] = useState<ChildFormData>({
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      relationship: 'child',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<ChildFormData>>({});
    const { success, error: showError } = useSnack();

    const validateForm = (): boolean => {
      const newErrors: Partial<ChildFormData> = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 13 || age > 18) {
          newErrors.dateOfBirth = 'Child must be between 13 and 18 years old';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      setLoading(true);

      try {
        const response = await fetch('/api/guardian/children', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add child');
        }

        success('Child added successfully. A consent email has been sent.');
        onSuccess?.(data.childId);
        handleClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add child';
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        relationship: 'child',
      });
      setErrors({});
      onClose();
    };

    const handleInputChange = (field: keyof ChildFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="add-child-dialog-title"
      >
        <DialogTitle id="add-child-dialog-title">
          Add Child to Your Account
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Adding a child will send them a consent email. They must verify their email and provide consent before they can access the platform.
            </Alert>
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
                required
              />
            </Stack>
            
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
            />
            
            <TextField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Relationship</InputLabel>
              <Select
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                label="Relationship"
              >
                <MenuItem value="child">Child</MenuItem>
                <MenuItem value="stepchild">Stepchild</MenuItem>
                <MenuItem value="grandchild">Grandchild</MenuItem>
                <MenuItem value="ward">Ward</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              <FormHelperText>
                Specify your relationship to the child
              </FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Child'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

AddChildDialog.displayName = 'AddChildDialog';
