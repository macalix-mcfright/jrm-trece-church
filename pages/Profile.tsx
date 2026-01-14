import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { Loader2, Camera, User, Mail, Calendar, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Cast auth to any to bypass type mismatch error
      const { data: { user } } = await (supabase.auth as any).getUser();

      if (!user) throw new Error('No user logged in');

      // 1. Try to fetch existing profile (Split query)
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile table:', JSON.stringify(profileError, null, 2));
        throw profileError;
      }

      // 2. If profile is missing (first login), create a default row
      if (!profileData) {
        console.log('Profile missing, creating default row...');
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'New Member',
          email: user.email,
          dob: '2000-01-01',
          dynamic_data: { campus: 'Trece Martires (Main)' }
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) throw insertError;
        profileData = newProfile as any;
      }

      // 3. Fetch roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
        
      if (rolesError) {
         // Log but don't fail, we can show the profile without roles
         console.error('Error fetching roles:', JSON.stringify(rolesError, null, 2));
      }

      // Combine
      setProfile({
        ...(profileData as any),
        user_roles: rolesData || []
      } as Profile);

    } catch (error: any) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load profile.' });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const userId = profile?.id;
      
      if (!userId) throw new Error('User ID not found');

      // Unique file path to avoid browser caching issues
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile Record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state immediately
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: error.message || 'Error uploading avatar' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"></div>

        <div className="px-8 pb-8">
          <div className="relative flex items-end -mt-12 mb-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-400">
                    {/* Defensive coding: ensure full_name exists */}
                    {(profile?.full_name || 'User').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-xs text-white font-medium">Change</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="ml-6 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h1>
              <p className="text-sm text-slate-500 font-medium">{profile?.user_roles?.[0]?.role || 'Member'}</p>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Personal Information</h3>
              
              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Full Name</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <User className="w-5 h-5 text-slate-400" />
                  {profile?.full_name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Email Address</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <Mail className="w-5 h-5 text-slate-400" />
                  {profile?.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Ministry Data</h3>

              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Date of Birth</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  {profile?.dob || 'Not set'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Campus</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-brand-600">C</div>
                  {profile?.dynamic_data?.campus || 'Trece Martires (Main)'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg shadow-sm hover:bg-brand-700 transition-colors opacity-50 cursor-not-allowed">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;