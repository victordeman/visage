import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/auth';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEnrollUser } from '@/hooks/use-users';
import { FaceScanner } from '@/components/FaceScanner';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, CheckCircle2, User, Mail, Briefcase, Lock } from 'lucide-react';

export default function Enroll() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', 
    role: 'student', department: '', jobDesignation: ''
  });
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  
  const { isAdmin } = useAuthStore();
  const [_, setLocation] = useLocation();
  const enrollMutation = useEnrollUser();
  const { toast } = useToast();

  if (!isAdmin) {
    setLocation('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCapture = (desc: number[]) => {
    setDescriptor(desc);
  };

  const handleSubmit = () => {
    if (!descriptor) return;
    
    enrollMutation.mutate(
      { ...formData, faceDescriptor: descriptor },
      {
        onSuccess: () => {
          toast({ title: "Enrollment Successful", description: "Face biometric securely stored." });
          setLocation('/users');
        },
        onError: (err) => {
          toast({ title: "Enrollment Failed", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-2">New Biometric Enrollment</h1>
        <p className="text-muted-foreground">Register a new profile and capture facial geometry.</p>
        
        {/* Progress steps */}
        <div className="flex items-center justify-between mt-8 mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -z-10" style={{ width: step === 2 ? '100%' : '50%' }} />
          
          <div className={`flex flex-col items-center w-1/2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-lg ${step >= 1 ? 'bg-primary text-white shadow-primary/30' : 'bg-card border border-white/10 text-muted-foreground'}`}>
              1
            </div>
            <span className="text-sm font-semibold">Profile Details</span>
          </div>
          
          <div className={`flex flex-col items-center w-1/2 ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-lg transition-colors duration-300 ${step === 2 ? 'bg-primary text-white shadow-primary/30' : 'bg-card border border-white/10 text-muted-foreground'}`}>
              2
            </div>
            <span className="text-sm font-semibold">Face Capture</span>
          </div>
        </div>

        <Card className="border-white/10 overflow-hidden">
          <CardContent className="p-8">
            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">First Name</label>
                    <Input name="firstName" required value={formData.firstName} onChange={handleChange} icon={<User className="w-4 h-4"/>} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Last Name</label>
                    <Input name="lastName" required value={formData.lastName} onChange={handleChange} icon={<User className="w-4 h-4"/>} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Email</label>
                    <Input type="email" name="email" required value={formData.email} onChange={handleChange} icon={<Mail className="w-4 h-4"/>} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Temporary Password</label>
                    <Input type="password" name="password" required value={formData.password} onChange={handleChange} icon={<Lock className="w-4 h-4"/>} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Department</label>
                    <Input name="department" value={formData.department} onChange={handleChange} icon={<Briefcase className="w-4 h-4"/>} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Role</label>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    Continue to Face Capture <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <p className="text-white font-medium mb-1">Position face in the center of the frame</p>
                  <p className="text-sm text-muted-foreground">The system will automatically capture when a clear face is detected.</p>
                </div>
                
                <div className="max-w-md mx-auto">
                  <FaceScanner onCapture={handleCapture} mode="enroll" isActive={true} />
                </div>

                <div className="flex justify-between pt-6 border-t border-white/5">
                  <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 text-white">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!descriptor || enrollMutation.isPending}
                    size="lg"
                    isLoading={enrollMutation.isPending}
                    className={descriptor ? 'bg-success hover:bg-success/90 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Enrollment
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
