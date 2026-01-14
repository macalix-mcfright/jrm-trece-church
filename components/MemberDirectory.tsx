import React from 'react';
import { Profile, AgeGroup } from '../types';
import { User, Phone, Mail } from 'lucide-react';

interface MemberCardProps {
  profile: Profile;
}

const getGroupColor = (group?: AgeGroup) => {
    switch(group) {
        case AgeGroup.KIDS: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case AgeGroup.YOUTH: return 'bg-blue-100 text-blue-800 border-blue-200';
        case AgeGroup.YOUNG_ADULT: return 'bg-purple-100 text-purple-800 border-purple-200';
        case AgeGroup.ADULT: return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
};

const MemberCard: React.FC<MemberCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <span className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getGroupColor(profile.computed_group)}`}>
          {profile.computed_group || 'Member'}
        </span>
      </div>

      <h3 className="text-slate-900 font-bold text-lg truncate w-full">{profile.full_name}</h3>
      <p className="text-slate-500 text-xs mb-4 truncate w-full">{profile.dynamic_data?.campus || 'Trece Martires City'}</p>

      <div className="w-full space-y-2 mt-auto">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg justify-center">
            <Mail className="w-3 h-3" />
            <span className="truncate text-xs">{profile.email}</span>
        </div>
        {profile.dynamic_data?.phone && (
           <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg justify-center">
             <Phone className="w-3 h-3" />
             <span className="truncate text-xs">{profile.dynamic_data.phone}</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;