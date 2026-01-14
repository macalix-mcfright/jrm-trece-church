import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { Profile, CustomFieldDefinition, Role } from '../types';
import { Search, Filter, Plus, UserCog } from 'lucide-react';

const MemberDirectory: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.fetchProfiles(), api.fetchCustomFields()]).then(([p, c]) => {
      setProfiles(p);
      setCustomFields(c);
      setLoading(false);
    });
  }, []);

  const filteredProfiles = profiles.filter(p => 
    p.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    p.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Directory...</div>;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                <Filter className="w-4 h-4" />
                Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">
                <Plus className="w-4 h-4" />
                Add Member
            </button>
        </div>
      </div>

      {/* Dynamic Grid */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Name & Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Age Group
              </th>
              {customFields.map(field => (
                <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {field.label}
                </th>
              ))}
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredProfiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                        {profile.full_name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{profile.full_name}</div>
                      <div className="text-xs text-slate-500">{profile.email} • {profile.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${profile.manual_group_override ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {profile.computed_group}
                    {profile.manual_group_override && <span className="ml-1 text-[10px] uppercase">(Override)</span>}
                  </span>
                </td>
                
                {/* Dynamic Columns Rendering */}
                {customFields.map(field => (
                  <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {profile.dynamic_data[field.key] || '-'}
                  </td>
                ))}

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <button className="text-slate-400 hover:text-brand-600">
                        <UserCog className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberDirectory;