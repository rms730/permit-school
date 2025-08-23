import { redirect } from 'next/navigation';

import PrivacySettings from './PrivacySettings';
import AppShell from '@/components/layout/AppShell';
import { getRouteClient } from '@/lib/supabaseRoute';


export default async function PrivacyPage() {
  const supabase = getRouteClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/en/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <AppShell user={profile}>
      <PrivacySettings user={user} profile={profile} />
    </AppShell>
  );
}
