import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuthStore } from '@/store/auth';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Camera, 
  LogOut, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-auth';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const { data: profile, isLoading } = useUserProfile();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  useEffect(() => {
    if (!useAuthStore.getState().isAuthenticated) {
      setLocation('/login');
    }
  }, [location, setLocation]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Mark Attendance', path: '/attendance', icon: Camera, show: true },
    { name: 'Users', path: '/users', icon: Users, show: isAdmin },
    { name: 'Enroll Face', path: '/enroll', icon: UserPlus, show: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="bg-primary/20 p-2 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">VisageTrack</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.filter(i => i.show).map(item => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location === item.path 
                  ? 'bg-primary/10 text-primary font-semibold shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location === item.path ? 'text-primary' : 'group-hover:text-white'}`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.name}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
