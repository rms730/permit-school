import { Suspense } from 'react';
import { getRouteClient } from '@/lib/supabaseRoute';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProfileEditForm from './ProfileEditForm';

export default async function ProfileEditPage() {
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
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileEditForm user={user} profile={profile} />
      </Suspense>
    </AppShell>
  );
}
