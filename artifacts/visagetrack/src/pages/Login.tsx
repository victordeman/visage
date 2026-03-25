import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLoginMutation } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ShieldCheck, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [_, setLocation] = useLocation();
  const loginMutation = useLoginMutation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast({ title: "Access Granted", description: "Biometric systems initialized." });
          setLocation('/dashboard');
        },
        onError: (err) => {
          toast({ title: "Access Denied", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      {/* Abstract Background */}
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

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-panel p-8 rounded-[2rem]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 text-center">VisageTrack AI</h1>
            <p className="text-muted-foreground text-center text-sm">Secure Biometric Attendance System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input 
              type="text" 
              placeholder="Admin or Student Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />
            <Input 
              type="password" 
              placeholder="Security Credential" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg mt-4" 
              isLoading={loginMutation.isPending}
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              Authenticate
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 mr-1" /> End-to-end encrypted connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
