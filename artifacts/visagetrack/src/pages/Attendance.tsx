import React, { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useFaceMatch, useMarkAttendance } from '@/hooks/use-attendance';
import { FaceScanner } from '@/components/FaceScanner';
import { Camera, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Attendance() {
  const matchMutation = useFaceMatch();
  const markMutation = useMarkAttendance();
  const [matchResult, setMatchResult] = useState<{name: string, status: string} | null>(null);
  const [isActive, setIsActive] = useState(true);
  const isProcessingRef = useRef(false);

  const handleCapture = useCallback(async (descriptor: number[]) => {
    if (isProcessingRef.current || !isActive) return;
    isProcessingRef.current = true;

    try {
      const match = await matchMutation.mutateAsync(descriptor);
      if (match.matched && match.userId) {
        setIsActive(false); // Pause scanning
        
        await markMutation.mutateAsync({ userId: match.userId, status: 'present' });
        
        setMatchResult({ name: match.userName || 'Unknown', status: 'Marked Present' });
        
        // Show success for 3 seconds then resume
        setTimeout(() => {
          setMatchResult(null);
          setIsActive(true);
          isProcessingRef.current = false;
        }, 3000);
      } else {
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error(error);
      isProcessingRef.current = false;
    }
  }, [isActive, matchMutation, markMutation]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Camera className="mr-3 w-8 h-8 text-primary" />
            Live Attendance Station
          </h1>
          <p className="text-muted-foreground">Look at the camera to automatically mark attendance.</p>
        </div>

        <div className="flex-1 flex items-center justify-center bg-black/20 rounded-3xl border border-white/5 overflow-hidden relative">
          
          {!isActive && matchResult && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-success/10 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-success/20 p-6 rounded-full mb-6 pulse-glow">
                <CheckCircle2 className="w-24 h-24 text-success" />
              </div>
              <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Verified</h2>
              <p className="text-2xl text-success font-medium">{matchResult.name}</p>
              <p className="mt-8 text-white/50 text-sm animate-pulse">Resuming scanner...</p>
            </div>
          )}

          <div className="w-full max-w-4xl px-4 relative z-10">
            <div className="p-2 glass-panel rounded-[2rem] shadow-2xl">
               <FaceScanner 
                  onCapture={handleCapture} 
                  mode="attendance" 
                  isActive={isActive} 
                  matchResult={matchResult}
                />
            </div>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center z-0">
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-background/80 backdrop-blur border border-white/10 text-xs font-medium text-muted-foreground">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
               System Active & Processing
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
