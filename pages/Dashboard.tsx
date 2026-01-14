import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, AgeGroup } from '../types';
import { Users, UserPlus, Baby, ChevronRight } from 'lucide-react';

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    youth: 0,
    kids: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('dob, manual_group_override, status');

        if (error) throw error;

        let total = 0;
        let youth = 0;
        let kids = 0;
        let pending = 0;

        data?.forEach((p: any) => {
            if (p.status === 'pending') {
                pending++;
                return;
            }
            if (p.status === 'denied') return;

            total++;
            const group = calculateAgeGroup(p.dob, p.manual_group_override);
            if (group === AgeGroup.YOUTH) youth++;
            if (group === AgeGroup.KIDS) kids++;
        });

        setStats({ total, youth, kids, pending });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ label, value, icon: Icon, color, subColor }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-all group">
      <div>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${subColor} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-slate-300">Welcome to the Jesus Reigns Ministries Management System.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full bg-white/5 skew-x-12 transform translate-x-20"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            label="Total Members" 
            value={stats.total} 
            icon={Users} 
            color="text-blue-600" 
            subColor="bg-blue-50" 
        />
        <StatCard 
            label="JRM Youth" 
            value={stats.youth} 
            icon={UserPlus} 
            color="text-purple-600" 
            subColor="bg-purple-50" 
        />
        <StatCard 
            label="Kids Ministry" 
            value={stats.kids} 
            icon={Baby} 
            color="text-amber-500" 
            subColor="bg-amber-50" 
        />
        <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Pending Requests</p>
                <h3 className="text-3xl font-bold mt-1">{loading ? '-' : stats.pending}</h3>
            </div>
            <div className="flex items-center text-sm font-medium text-blue-400 mt-4">
                Review <ChevronRight className="w-4 h-4 ml-1" />
            </div>
        </div>
      </div>

      {/* Empty State / Placeholder for future widgets */}
      <div className="flex-1 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center p-8 text-slate-400">
        <p>Additional widgets (Upcoming Events, Birthday Celebrants) coming soon.</p>
      </div>
    </div>
  );
};

export default Dashboard;