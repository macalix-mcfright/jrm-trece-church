import React from 'react';
import { Users, Music, GraduationCap, LayoutDashboard, FileText, LogOut, Shield } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  user: Profile | null;
  onSignOut: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  isProjectorMode: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut, currentView, onNavigate, isProjectorMode }) => {
  if (isProjectorMode) {
    return <div className="h-screen w-screen bg-black overflow-hidden">{children}</div>;
  }

  // Check if user is Super Admin for Settings Access
  const isSuperAdmin = user?.user_roles?.some(r => r.role === 'SUPER_ADMIN');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Directory', icon: Users },
    { id: 'worship', label: 'Worship', icon: Music },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'docs', label: 'Documents', icon: FileText },
  ];

  if (isSuperAdmin) {
    navItems.push({ id: 'admin_settings', label: 'Admin Settings', icon: Shield });
  }

  // Explicitly handle sign out with Supabase
  const handleSignOutClick = async () => {
    try {
      // Cast auth to any to bypass type mismatch error in environment
      const { error } = await (supabase.auth as any).signOut();
      if (error) console.error('Error logging out:', error);
      // Trigger parent callback to update App state (redirect to login)
      onSignOut();
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white">J</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Jesus Reigns Ministries</h1>
              <p className="text-slate-400 uppercase tracking-widest leading-tight">Trece Martires City</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-brand-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section (Bottom) */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-md transition-colors" onClick={() => onNavigate('profile')}>
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user?.full_name || 'NA').substring(0, 2).toUpperCase()
                )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.user_roles?.[0]?.role || 'Guest'}</p>
            </div>
             <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleSignOutClick(); 
              }} 
              className="ml-auto text-slate-500 hover:text-white" 
              title="Sign Out"
            >
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h2 className="text-xl font-semibold text-slate-800 capitalize">
                {currentView === 'profile' ? 'User Profile' : 
                 currentView === 'admin_settings' ? 'Administration' : 
                 currentView}
            </h2>
            <div className="text-sm text-slate-500">JRM Management System v1.1</div>
        </header>
        <div className="flex-1 p-8 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;