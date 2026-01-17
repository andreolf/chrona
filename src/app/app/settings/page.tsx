'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/supabase/types';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    default_hourly_rate: '',
    preferred_currency: '',
  });

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: Profile | null };

    if (data) {
      setProfile(data as Profile);
      setFormData({
        full_name: data.full_name,
        default_hourly_rate: data.default_hourly_rate?.toString() || '',
        preferred_currency: data.preferred_currency || '',
      });
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        full_name: formData.full_name,
        default_hourly_rate: formData.default_hourly_rate
          ? parseFloat(formData.default_hourly_rate)
          : null,
        preferred_currency: formData.preferred_currency || null,
      })
      .eq('id', profile.id);

    setIsSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Settings saved',
      description: 'Your profile has been updated.',
    });
    router.refresh();
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Settings" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="max-w-2xl space-y-6 animate-fade-in">
        {/* Profile Settings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
            <CardDescription className="text-slate-400">
              Your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-300">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-slate-800/30 border-slate-700 text-slate-400"
              />
              <p className="text-xs text-slate-500">
                Contact an admin to change your email
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Input
                value={profile?.role === 'admin' ? 'Admin' : 'Freelancer'}
                disabled
                className="bg-slate-800/30 border-slate-700 text-slate-400 capitalize"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Payment Preferences</CardTitle>
            <CardDescription className="text-slate-400">
              Configure your payment settings for future payment features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-slate-300">
                Default Hourly Rate
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.default_hourly_rate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      default_hourly_rate: e.target.value,
                    }))
                  }
                  className="bg-slate-800/50 border-slate-700 text-white pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-300">
                Preferred Currency
              </Label>
              <Select
                value={formData.preferred_currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, preferred_currency: value }))
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="USD" className="text-white focus:bg-slate-800">
                    USD - US Dollar
                  </SelectItem>
                  <SelectItem value="USDC" className="text-white focus:bg-slate-800">
                    USDC - USD Coin
                  </SelectItem>
                  <SelectItem value="USDT" className="text-white focus:bg-slate-800">
                    USDT - Tether
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Payment streaming and vesting features coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
