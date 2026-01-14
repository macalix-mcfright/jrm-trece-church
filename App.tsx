import React, { useState, useEffect } from 'react';
import { supabase, getProfile } from './lib/supabaseClient';
import { Profile } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Directory from './pages/Directory';
import Dashboard from './pages/Dashboard';
import WorshipModule from './pages/WorshipModule';
import TrainingTracker from './components/TrainingTracker';
import ProfilePage from './pages/Profile';
import PendingApproval from './pages/PendingApproval';
import Settings from './pages/Settings'; 

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Cast auth to any to bypass type mismatch error
      const { data: { session } } = await (supabase.auth as any).getSession();
      setSession(session);
      if (session?.user) {
        const userProfile = await getProfile(session.user.id);
        setProfile(userProfile);
      }
      setLoading(false);
    };

    checkSession();

    // Cast auth to any to bypass type mismatch error
    const { data: authListener } = (supabase.auth as any).onAuthStateChange(async (_event: any, session: any) => {
      setSession(session);
       if (session?.user) {
        const userProfile = await getProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
        setAuthView('login'); // Reset to login screen on sign out
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    // Cast auth to any to bypass type mismatch error
    await (supabase.auth as any).signOut();
  };

  const renderContent = () => {
    if (!profile) return <div className="text-center p-8">Loading profile...</div>;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Directory />;
      case 'worship':
        return <WorshipModule user={profile} />;
      case 'training':
        return <TrainingTracker onToggleProjector={setIsProjectorMode} isProjectorMode={isProjectorMode} />;
      case 'profile':
        return <ProfilePage />;
      case 'admin_settings':
        // Strict Role Check: Only Super Admins can render the Settings component
        if (profile.user_roles?.some(r => r.role === 'SUPER_ADMIN')) {
             return <Settings />;
        }
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
             <h2 className="text-2xl font-bold">Access Denied</h2>
             <p>You do not have permission to view this page.</p>
          </div>
        );
      case 'docs':
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-900">Document Repository</h3>
              <p>Secure file storage (Coming Soon).</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // --- UN-AUTHENTICATED STATE ---
  if (!session) {
    if (authView === 'register') {
      return <Register onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateToRegister={() => setAuthView('register')} />;
  }

  // --- ACCESS CONTROL CHECK ---
  
  // 1. Denied Users
  if (profile?.status === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center border border-red-100">
           <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
           <p className="text-slate-600 mb-6">Your account has been deactivated or denied by an administrator.</p>
           <button 
             onClick={handleSignOut} 
             className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
           >
             Sign Out
           </button>
        </div>
      </div>
    );
  }

  // 2. Pending Users (Show Pending Page, bypassing Layout)
  if (profile?.status === 'pending') {
      return <PendingApproval />;
  }

  // 3. Approved Users (Show Layout)
  return (
    <Layout 
      user={profile}
      onSignOut={handleSignOut}
      currentView={currentView} 
      onNavigate={setCurrentView}
      isProjectorMode={isProjectorMode}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;