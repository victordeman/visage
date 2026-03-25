import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsersList, useDeleteUser } from '@/hooks/use-users';
import { useAuthStore } from '@/store/auth';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Shield, User as UserIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const { data: users, isLoading } = useUsersList();
  const deleteMutation = useDeleteUser();
  const [searchTerm, setSearchName] = useState('');
  const [_, setLocation] = useLocation();
  const { isAdmin } = useAuthStore();
  const { toast } = useToast();

  if (!isAdmin) {
    setLocation('/dashboard');
    return null;
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast({ title: "User Deleted", description: "The biometric profile has been removed." }),
        onError: () => toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" })
      });
    }
  };

  const filteredUsers = users?.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage enrolled profiles and biometric data.</p>
        </div>
        <Button onClick={() => setLocation('/enroll')} size="lg" className="shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <UserPlus className="w-5 h-5 mr-2" />
          Enroll New Face
        </Button>
      </div>

      <Card className="overflow-hidden border-white/10">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="w-full max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/80 text-muted-foreground uppercase text-xs tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Profile</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Biometric Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading directory...</td></tr>
              ) : filteredUsers?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                filteredUsers?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          {user.imagePath ? (
                            <img src={user.imagePath} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/80'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{user.department || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        user.hasEmbedding ? 'text-success bg-success/10 border border-success/20' : 'text-destructive bg-destructive/10 border border-destructive/20'
                      }`}>
                        {user.hasEmbedding ? 'Enrolled' : 'Pending Scan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
