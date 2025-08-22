'use client';

import { CheckCircle, Error, Warning } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Container,
  Paper
} from '@mui/material';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface GuardianVerifyData {
  student_initials: string;
  course_title: string;
  jurisdiction_name: string;
  jurisdiction_disclaimers: string[];
  guardian_name: string;
  expires_at: string;
}

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Legal Guardian',
  'Grandparent',
  'Aunt/Uncle',
  'Sibling',
  'Other Family Member',
  'Other'
];

export default function GuardianSigningPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<GuardianVerifyData | null>(null);
  
  // Form state
  const [typedName, setTypedName] = useState('');
  const [relation, setRelation] = useState('');
  const [agree, setAgree] = useState(false);

  const fetchGuardianData = useCallback(async () => {
    try {
      const response = await fetch(`/api/guardian/verify/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 410) {
          setError('This consent request has expired or is no longer valid. Please contact the student to request a new consent link.');
        } else {
          setError(errorData.message || 'Invalid consent request');
        }
        setLoading(false);
        return;
      }
      
      const guardianData = await response.json();
      setData(guardianData);
    } catch (err) {
      setError('Failed to load consent request. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchGuardianData();
    }
  }, [token, fetchGuardianData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typedName.trim() || !relation || !agree) {
      setError('Please fill in all fields and agree to the consent statement.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/guardian/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          typed_name: typedName.trim(),
          relation,
          agree: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit consent');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to submit consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Error color="error" />
              <Typography variant="h6" color="error">
                Consent Request Error
              </Typography>
            </Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              If you need assistance, please contact support at{' '}
              <a href="mailto:support@permitschool.com">support@permitschool.com</a>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <CheckCircle color="success" />
              <Typography variant="h6" color="success.main">
                Consent Submitted Successfully
              </Typography>
            </Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your consent has been recorded and a receipt has been sent to your email address.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              The student will be notified of your consent and can now proceed with their course.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Guardian Consent Form
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Student and Course Information */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student and Course Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Student:</Typography>
                <Typography variant="body2" fontWeight="medium">{data.student_initials}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Course:</Typography>
                <Typography variant="body2" fontWeight="medium">{data.course_title}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Jurisdiction:</Typography>
                <Typography variant="body2" fontWeight="medium">{data.jurisdiction_name}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Expires:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {new Date(data.expires_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Jurisdiction Disclaimers */}
          {data.jurisdiction_disclaimers && data.jurisdiction_disclaimers.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Warning color="warning" />
                <Typography variant="h6">
                  Important Disclaimers
                </Typography>
              </Box>
              {data.jurisdiction_disclaimers.map((disclaimer, index) => (
                <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • {disclaimer}
                </Typography>
              ))}
            </Paper>
          )}

          {/* Consent Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Guardian Information
            </Typography>
            
            <TextField
              fullWidth
              label="Your Full Name (as it appears on legal documents)"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              margin="normal"
              required
              helperText="Please type your full legal name as it appears on official documents"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Relationship to Student</InputLabel>
              <Select
                value={relation}
                label="Relationship to Student"
                onChange={(e) => setRelation(e.target.value)}
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    required
                  />
                }
                label={
                  <Typography variant="body2">
                    I, {typedName || '[Your Name]'}, am the legal guardian of the student and hereby provide consent for their participation in the {data.course_title} course. I understand the course requirements and agree to the terms and conditions.
                  </Typography>
                }
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || !typedName.trim() || !relation || !agree}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? 'Submitting...' : 'Submit Consent'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            This consent will be recorded with your IP address and timestamp for verification purposes.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
