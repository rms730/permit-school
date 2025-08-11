import { getRouteClient } from '@/lib/supabaseRoute';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import AuthSettings from './AuthSettings';

export default async function AuthPage() {
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
      <AuthSettings user={user} profile={profile} />
    </AppShell>
  );
}
