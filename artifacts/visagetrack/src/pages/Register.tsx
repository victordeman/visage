import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ShieldCheck, User, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { setAuthToken } from '@/lib/utils';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Registration failed', description: data.message, variant: 'destructive' });
        return;
      }

      setAuthToken(data.access_token);
      setAuth(data.access_token, { id: data.userId, name: data.name, email: form.email, role: data.role });
      toast({ title: 'Account created!', description: `Welcome, ${data.name}.` });
      setLocation('/dashboard');
    } catch {
      toast({ title: 'Network error', description: 'Could not reach the server.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="Security background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="glass-panel p-8 rounded-[2rem]">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1 text-center">Create Account</h1>
            <p className="text-muted-foreground text-center text-sm">Join VisageTrack AI Attendance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="firstName"
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                name="lastName"
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              name="email"
              type="text"
              placeholder="Email or username"
              value={form.email}
              onChange={handleChange}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="student" className="bg-gray-900">Student</option>
                <option value="admin" className="bg-gray-900">Admin</option>
              </select>
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-2" isLoading={isLoading}>
              <Fingerprint className="w-5 h-5 mr-2" />
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
            <p className="text-xs text-muted-foreground/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 mr-1" /> End-to-end encrypted connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
