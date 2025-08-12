import { Suspense } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { getRouteClient } from '@/lib/supabaseRoute';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import AccountOverview from './AccountOverview';

export default async function AccountPage() {
  const supabase = getRouteClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <AppShell user={profile}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Account Settings
        </Typography>
        
        <Suspense fallback={<AccountSkeleton />}>
          <AccountOverview user={user} profile={profile} />
        </Suspense>
      </Box>
    </AppShell>
  );
}

function AccountSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={64} height={64} />
              <Box>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width={150} height={32} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
