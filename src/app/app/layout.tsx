import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/app/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Profile } from '@/lib/supabase/types';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile directly - if RLS fails, create a minimal profile object
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile: Profile = data || {
    id: user.id,
    org_id: null,
    role: 'freelancer',
    full_name: user.email?.split('@')[0] || 'User',
    email: user.email || '',
    is_active: true,
    default_hourly_rate: null,
    preferred_currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar profile={profile} />
      <main className="ml-64 p-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
