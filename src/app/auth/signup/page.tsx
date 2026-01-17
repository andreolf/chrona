'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, SignupInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, Loader2, Briefcase, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'freelancer' | 'admin';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('freelancer');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Failed to create account');
      setIsLoading(false);
      return;
    }

    // Wait for session to be established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create or get organization
    let orgId: string;

    if (selectedRole === 'admin') {
      // Admin creates a new organization
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: org, error: orgError } = await (supabase as any)
        .from('organizations')
        .insert({ name: `${data.fullName}'s Workspace` })
        .select()
        .single();

      if (orgError) {
        console.error('Org error:', orgError);
        setError('Failed to create organization: ' + orgError.message);
        setIsLoading(false);
        return;
      }
      orgId = org.id;
    } else {
      // Freelancer joins existing organization
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: org } = await (supabase as any)
        .from('organizations')
        .select('id')
        .limit(1)
        .single();

      if (!org) {
        setError('No organization found. A client must sign up first.');
        setIsLoading(false);
        return;
      }
      orgId = org.id;
    }

    // Create profile with selected role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .insert({
        id: authData.user.id,
        org_id: orgId,
        email: data.email,
        full_name: data.fullName,
        role: selectedRole,
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      setError('Failed to create profile: ' + profileError.message);
      setIsLoading(false);
      return;
    }

    router.push('/app/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      {/* Back to home link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to home</span>
      </Link>

      <Card className="w-full max-w-md relative bg-slate-900/90 border-slate-800 shadow-2xl shadow-indigo-500/10">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Create your account
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Start tracking time with Chrona
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-slate-300">I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('freelancer')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    selectedRole === 'freelancer'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    selectedRole === 'freelancer'
                      ? 'bg-indigo-500/20'
                      : 'bg-slate-700/50'
                  )}>
                    <Briefcase className={cn(
                      'w-5 h-5',
                      selectedRole === 'freelancer' ? 'text-indigo-400' : 'text-slate-400'
                    )} />
                  </div>
                  <p className={cn(
                    'font-medium',
                    selectedRole === 'freelancer' ? 'text-white' : 'text-slate-300'
                  )}>
                    Freelancer
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    I track time for clients
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    selectedRole === 'admin'
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    selectedRole === 'admin'
                      ? 'bg-violet-500/20'
                      : 'bg-slate-700/50'
                  )}>
                    <Users className={cn(
                      'w-5 h-5',
                      selectedRole === 'admin' ? 'text-violet-400' : 'text-slate-400'
                    )} />
                  </div>
                  <p className={cn(
                    'font-medium',
                    selectedRole === 'admin' ? 'text-white' : 'text-slate-300'
                  )}>
                    Client
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    I hire freelancers
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full text-white font-medium py-5 shadow-lg',
                selectedRole === 'admin'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Create ${selectedRole === 'admin' ? 'Client' : 'Freelancer'} Account`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
