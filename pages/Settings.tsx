import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { 
  Check, 
  X, 
  Shield, 
  Clock, 
  AlertCircle, 
  Loader2, 
  User, 
  ChevronDown, 
  Search, 
  Users,
  UserX,
  Calendar
} from 'lucide-react';

const Settings: React.FC = () => {
  // --- Pending State ---
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  
  // --- Active State ---
  const [activeUsers, setActiveUsers] = useState<Profile[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [activeSearch, setActiveSearch] = useState('');

  // --- Shared Action State ---
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Track selected role for pending users only (Active users use their current role as default)
  const [pendingSelectedRoles, setPendingSelectedRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingUsers();
    fetchActiveUsers();
  }, []);

  // --- FETCHING ---

  const fetchPendingUsers = async () => {
    try {
      setLoadingPending(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;
      setPendingUsers(data as Profile[] || []);
    } catch (err: any) {
      console.error('Error fetching pending users:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      setLoadingActive(true);
      // Fetch users where status is approved, and join their roles
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .eq('status', 'approved')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setActiveUsers(data as Profile[] || []);
    } catch (err: any) {
      console.error('Error fetching active users:', err);
    } finally {
      setLoadingActive(false);
    }
  };

  // --- ACTIONS ---

  const handlePendingRoleChange = (userId: string, role: string) => {
    setPendingSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  // Used for both Approving Pending and Revoking Active
  const handleStatusUpdate = async (userId: string, newStatus: 'approved' | 'denied', roleToAssign: string) => {
    try {
      setActionLoading(userId);
      setMessage(null);

      // RPC: approve_user(target_user_id, new_status, new_role)
      const { error } = await supabase.rpc('approve_user', {
        target_user_id: userId,
        new_status: newStatus,
        new_role: roleToAssign
      });

      if (error) throw error;

      // Optimistic Updates
      if (newStatus === 'approved') {
        // Remove from pending
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        // We typically refresh active list to see them there, or we could manually add them
        fetchActiveUsers();
        setMessage({ type: 'success', text: 'User approved successfully.' });
      } else {
        // Denied
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        setActiveUsers(prev => prev.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: 'User access revoked/denied.' });
      }

      // Cleanup pending role state
      const newRoles = { ...pendingSelectedRoles };
      delete newRoles[userId];
      setPendingSelectedRoles(newRoles);

    } catch (err: any) {
      console.error('Error updating status:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update user status.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Specific handler for changing role of an ALREADY ACTIVE user
  const handleActiveRoleUpdate = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      setMessage(null);

      const { error } = await supabase.rpc('approve_user', {
        target_user_id: userId,
        new_status: 'approved', // Keep them approved
        new_role: newRole
      });

      if (error) throw error;

      // Update local state
      setActiveUsers(prev => prev.map(u => {
        if (u.id === userId) {
          // Mock the nested structure update for the UI
          return { ...u, user_roles: [{ ...u.user_roles[0], role: newRole as any }] };
        }
        return u;
      }));

      setMessage({ type: 'success', text: 'User role updated successfully.' });

    } catch (err: any) {
      console.error('Error updating role:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const confirmRevoke = (user: Profile) => {
    if (window.confirm(`Are you sure you want to deactivate ${user.full_name}? They will lose access immediately.`)) {
      handleStatusUpdate(user.id, 'denied', 'member'); // Role doesn't matter when denying
    }
  };

  // --- FILTERS ---
  const filteredActiveUsers = activeUsers.filter(u => 
    (u.full_name || '').toLowerCase().includes(activeSearch.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-600" />
          Admin Settings
        </h1>
        <p className="text-slate-500">Manage user access, roles, and system security.</p>
      </div>

      {/* Global Alert Messages */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* SECTION 1: PENDING REQUESTS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Pending Requests</h2>
                <p className="text-xs text-slate-500">New registrants waiting for access</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {pendingUsers.length} Pending
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loadingPending ? (
            <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading requests...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400">
              <Shield className="w-12 h-12 mb-3 opacity-20" />
              <p>No pending user requests.</p>
            </div>
          ) : (
            pendingUsers.map(user => (
              <div key={user.id} className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                   </div>
                   <div>
                      <p className="font-bold text-slate-900">{user.full_name || 'Unknown User'}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                          <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {user.dynamic_data?.campus || 'No Campus'}
                          </span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 xl:mt-0">
                  <div className="relative">
                    <select
                      value={pendingSelectedRoles[user.id] || 'member'}
                      onChange={(e) => handlePendingRoleChange(user.id, e.target.value)}
                      className="w-full sm:w-40 appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                      disabled={actionLoading === user.id}
                    >
                      <option value="member">Member</option>
                      <option value="sg_leader">SG Leader</option>
                      <option value="ministry_head">Ministry Head</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(user.id, 'approved', pendingSelectedRoles[user.id] || 'member')}
                      disabled={actionLoading === user.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 min-w-[100px]"
                    >
                      {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(user.id, 'denied', 'member')}
                      disabled={actionLoading === user.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: ACTIVE DIRECTORY */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Active Directory</h2>
                <p className="text-xs text-slate-500">Manage approved members and roles</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search active users..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loadingActive ? (
            <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading directory...
            </div>
          ) : filteredActiveUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p>No active users found matching your search.</p>
            </div>
          ) : (
            filteredActiveUsers.map(user => {
               // Defensive coding for roles. DB returns 'superadmin' or 'sg_leader', so we match that.
               const currentRole = user.user_roles?.[0]?.role?.toLowerCase() || 'member';
               const joinedDate = (user as any).created_at ? new Date((user as any).created_at).toLocaleDateString() : 'Unknown';

               return (
                <div key={user.id} className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-slate-900">{user.full_name || 'Unknown User'}</p>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                             ${(currentRole === 'superadmin' || currentRole === 'super_admin') ? 'bg-purple-100 text-purple-700' :
                               currentRole === 'admin' ? 'bg-blue-100 text-blue-700' :
                               currentRole === 'ministry_head' ? 'bg-indigo-100 text-indigo-700' :
                               currentRole === 'sg_leader' ? 'bg-amber-100 text-amber-700' :
                               'bg-slate-100 text-slate-600'}
                           `}>
                             {currentRole.replace('_', ' ').replace('superadmin', 'super admin')}
                           </span>
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" /> Joined {joinedDate}
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 xl:mt-0 pl-14 xl:pl-0">
                    <div className="relative">
                      <select
                        value={currentRole}
                        onChange={(e) => handleActiveRoleUpdate(user.id, e.target.value)}
                        className="w-full sm:w-48 appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                        disabled={actionLoading === user.id}
                      >
                        <option value="member">Member</option>
                        <option value="sg_leader">SG Leader</option>
                        <option value="ministry_head">Ministry Head</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      {actionLoading === user.id && (
                        <Loader2 className="absolute right-8 top-3 w-4 h-4 animate-spin text-brand-600" />
                      )}
                    </div>

                    <button 
                      onClick={() => confirmRevoke(user)}
                      disabled={actionLoading === user.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      title="Deactivate User"
                    >
                      <UserX className="w-4 h-4" />
                      <span className="sm:hidden xl:inline">Revoke Access</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;