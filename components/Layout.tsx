import React from 'react';
import { Users, Music, GraduationCap, LayoutDashboard, Settings, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  isProjectorMode: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isProjectorMode }) => {
  if (isProjectorMode) {
    return <div className="h-screen w-screen bg-black overflow-hidden">{children}</div>;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Directory', icon: Users },
    { id: 'worship', label: 'Worship', icon: Music },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'docs', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white">J</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Jesus Reigns</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-tight">Trece Martires City</p>
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

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">JD</div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <Settings className="w-4 h-4 ml-auto text-slate-500 cursor-pointer hover:text-white" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h2 className="text-xl font-semibold text-slate-800 capitalize">{currentView}</h2>
            <div className="text-sm text-slate-500">JRM Management System v1.0</div>
        </header>
        <div className="flex-1 p-8 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;