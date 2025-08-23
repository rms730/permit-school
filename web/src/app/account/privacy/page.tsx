import { redirect } from 'next/navigation';

import AppShell from '@/components/layout/AppShell';
import { getRouteClient } from '@/lib/supabaseRoute';

import PrivacySettings from './PrivacySettings';


export default async function PrivacyPage() {
  const supabase = await getRouteClient();
  
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
