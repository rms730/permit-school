import { getServerClient } from './supabaseServer';

export async function getEntitlementForUser(j_code: string = 'CA') {
  const supabase = await getServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { active: false };
  }

  const { data: entitlement, error } = await supabase
    .from('v_user_entitlements')
    .select('active')
    .eq('user_id', user.id)
    .eq('j_code', j_code)
    .single();

  if (error || !entitlement) {
    return { active: false };
  }

  return { active: entitlement.active };
}
