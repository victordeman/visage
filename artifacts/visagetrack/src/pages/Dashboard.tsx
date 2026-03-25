import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/auth';
import { useUserStats } from '@/hooks/use-users';
import { useAttendanceList } from '@/hooks/use-attendance';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle2, XCircle, Clock, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function Dashboard() {
  const { user, isAdmin } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: attendance, isLoading: attendanceLoading } = useAttendanceList();

  const mockWeeklyData = [
    { name: 'Mon', present: 45, absent: 5 },
    { name: 'Tue', present: 48, absent: 2 },
    { name: 'Wed', present: 42, absent: 8 },
    { name: 'Thu', present: 50, absent: 0 },
    { name: 'Fri', present: 46, absent: 4 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here is your {isAdmin ? 'system overview' : 'attendance summary'} for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/20 to-card border-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Present Today</p>
              <h3 className="text-3xl font-display font-bold text-white">{stats?.present || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Absent</p>
              <h3 className="text-3xl font-display font-bold text-white">{stats?.absent || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                <h3 className="text-3xl font-display font-bold text-white">{stats?.total || 124}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Attendance Rate</p>
              <h3 className="text-3xl font-display font-bold text-white">{stats?.presentPercentage || 98}%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-primary" />
              Weekly Overview
            </h3>
          </div>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#8892b0" tickLine={false} axisLine={false} />
                <YAxis stroke="#8892b0" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
          </div>
          <div className="p-0 overflow-y-auto flex-1 max-h-[300px]">
            {attendanceLoading ? (
              <div className="p-6 text-center text-muted-foreground">Loading...</div>
            ) : attendance && attendance.length > 0 ? (
              <div className="divide-y divide-white/5">
                {attendance.slice(0, 10).map((record: any) => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium">
                        {record.userName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{record.userName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(record.timestamp)}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      record.status === 'present' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No recent records</div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
