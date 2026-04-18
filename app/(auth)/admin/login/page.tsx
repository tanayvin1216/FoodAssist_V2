'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, LoginFormValues } from '@/lib/validations/schemas';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      toast.error(error?.message ?? 'Unable to sign in.');
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      toast.error('This portal is for Council administrators only.');
      setIsLoading(false);
      return;
    }

    toast.success('Welcome back.');
    router.push('/admin');
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-navy/10">
          <Shield className="h-5 w-5 text-navy" />
        </div>
        <CardTitle className="text-navy text-lg">Administrator Sign-In</CardTitle>
        <p className="text-xs text-muted-text">
          Council staff only. Use the credentials provided by the Food &amp; Health Council.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="you@carteretfoodasist.org"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                Signing in…
              </>
            ) : (
              'Sign In to Admin Dashboard'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
