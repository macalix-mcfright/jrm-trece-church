import React from 'react';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PendingApproval: React.FC = () => {
  const handleSignOut = async () => {
    // Cast auth to any to bypass type mismatch error
    await (supabase.auth as any).signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-amber-50 p-6 border-b border-amber-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Account Pending</h1>
          <p className="text-amber-700 font-medium mt-2">Administrator Approval Required</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center text-slate-600 space-y-4">
            <p>
              Thank you for registering with <strong>Jesus Reigns Ministries</strong> CMS.
            </p>
            <p className="text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
              To ensure the security of our member data, all new accounts must be verified by a Super Administrator before accessing the dashboard.
            </p>
            <p className="text-xs text-slate-400">
              Please check back later or contact your ministry head to expedite approval.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-3 h-3" />
          Secured Access Control
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;