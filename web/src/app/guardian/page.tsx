"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

interface GuardianChild {
  guardian_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  student_role: string;
}

export default function GuardianPage() {
  const { dict } = useI18n();
  const router = useRouter();
  const [children, setChildren] = useState<GuardianChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChildren() {
      try {
        const response = await fetch('/api/guardian/children');
        if (response.ok) {
          const data = await response.json();
          setChildren(data.children || []);
        } else {
          setError('Failed to load students');
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    }

    fetchChildren();
  }, []);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleStudentClick = (studentId: string) => {
    router.push(`/guardian/student/${studentId}`);
  };

  if (loading) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {dict.guardian.title}
          </Typography>
          <Typography>{dict.common.loading}</Typography>
        </Container>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {dict.guardian.title}
          </Typography>
          <Typography color="error">{error}</Typography>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {dict.guardian.title}
        </Typography>
      
      {children.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              No students linked to your account.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} sm={6} md={4} key={child.student_id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleStudentClick(child.student_id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {child.first_name} {child.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dict.guardian.age}: {calculateAge(child.dob)} {dict.guardian.yearsOld}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={child.student_role} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Button size="small" variant="outlined">
                      View Progress
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      </Container>
    </AppShell>
  );
}
