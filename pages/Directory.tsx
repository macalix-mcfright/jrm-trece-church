import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, AgeGroup } from '../types';
import { Search, Filter, Loader2 } from 'lucide-react';
import MemberCard from '../components/MemberDirectory'; // Importing the Card Component

// Helper logic for age groups
const calculateAgeGroup = (dob: string, override?: AgeGroup | null): AgeGroup => {
  if (override) return override;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  if (age <= 12) return AgeGroup.KIDS;
  if (age <= 22) return AgeGroup.YOUTH;
  if (age >= 23) return AgeGroup.YOUNG_ADULT;
  return AgeGroup.ADULT;
};

const Directory: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('status', 'approved') // Only show approved members
            .order('full_name', { ascending: true });

        if (error) throw error;

        // Process data with age groups
        const processed = (data || []).map((p: any) => ({
            ...p,
            computed_group: calculateAgeGroup(p.dob, p.manual_group_override)
        }));

        setProfiles(processed as Profile[]);
      } catch (err) {
        console.error('Error fetching directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(p => 
    (p.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h2 className="text-lg font-bold text-slate-900">Member Directory</h2>
           <p className="text-sm text-slate-500">View and manage church members</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Find by name or email..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button className="p-2.5 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
             <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-500">Loading Directory...</span>
            </div>
        ) : filteredProfiles.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
                No members found matching your search.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {filteredProfiles.map(profile => (
                    <MemberCard key={profile.id} profile={profile} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Directory;