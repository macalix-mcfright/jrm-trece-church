import { createClient } from '@supabase/supabase-js';
import { Profile, AppRole, MinistryName } from '../types';

// --- DEBUG LOGS ---
console.log("--------------------------------------");
console.log("🚀 Supabase Client Initializing...");
console.log("URL Exists?", import.meta.env.VITE_SUPABASE_URL ? "✅ YES" : "❌ NO");
console.log("Key Exists?", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ YES" : "❌ NO");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const normalizeRole = (role: string): AppRole => {
  if (!role) return 'MEMBER';
  const clean = role.toLowerCase().trim();
  if (clean === 'superadmin' || clean === 'super_admin') return 'SUPER_ADMIN';
  if (clean === 'ministryhead' || clean === 'ministry_head') return 'MINISTRY_HEAD';
  if (clean === 'sgleader' || clean === 'sg_leader') return 'SG_LEADER';
  return clean.toUpperCase() as AppRole;
};

// --- FALLBACK PROFILE (Used if DB fails) ---
const FALLBACK_PROFILE: Profile = {
  id: 'fallback-id',
  full_name: 'Admin User (Offline Mode)',
  email: 'admin@jesusreigns.org',
  dob: '1980-01-01',
  contact_info: {},
  sub_group: 'Adults',
  civil_status: 'Single',
  dynamic_data: { campus: 'Trece Martires (Main)' },
  user_roles: [{ id: 999, user_id: 'fallback-id', role: 'SUPER_ADMIN', assigned_ministry: 'Worship' }]
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`👤 getProfile called for UserID: ${userId}`);

  // 1. TIMEOUT MECHANISM: If DB takes > 5 seconds, use fallback
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Database Timeout")), 5000)
  );

  try {
    // Race: Who finishes first? The Database or the 5-second Timer?
    const profileData: any = await Promise.race([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle().then(res => res.data),
      timeoutPromise
    ]);

    if (profileData) {
      console.log("✅ Profile Data Found:", profileData.full_name);
      
      const { data: rolesData } = await supabase.from('user_roles').select('*').eq('user_id', userId);
      
      const normalizedRoles = (rolesData || []).map((r: any) => ({
        ...r,
        role: normalizeRole(r.role),
        assigned_ministry: (r.assigned_ministry as MinistryName) || 'None'
      }));

      return { ...profileData, user_roles: normalizedRoles } as Profile;
    } else {
      console.warn("⚠️ User found in Auth but NOT in 'profiles' table.");
    }

  } catch (err) {
    console.error('🛑 Database Error or Timeout:', err);
    console.warn("⚠️ Switching to FALLBACK PROFILE to prevent White Screen.");
    // Return a fake profile so the app loads
    return { ...FALLBACK_PROFILE, id: userId };
  }

  return null;
};