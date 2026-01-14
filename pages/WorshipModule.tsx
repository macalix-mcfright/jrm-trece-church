import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../services/mockSupabase';
import { SongWithKeys, Profile, AppRole } from '../types';
import { Search, Music, ExternalLink, Mic2, FileText, Pencil, Activity, Plus } from 'lucide-react';
import KeyBadge from '../components/KeyBadge';

interface WorshipModuleProps {
  user: Profile;
}

const WorshipModule: React.FC<WorshipModuleProps> = ({ user }) => {
  const [songs, setSongs] = useState<SongWithKeys[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          song_preferred_keys (
            *,
            leader:profiles (
              full_name
            )
          )
        `)
        .order('title', { ascending: true });

      if (error) {
        console.warn('Supabase song fetch failed, switching to fallback data:', error.message);
        try {
            const mockSongs = await api.fetchSongs();
            setSongs(mockSongs);
        } catch (e) {
            setError('Failed to load songs from database or fallback.');
        }
      } else {
        setSongs(data as SongWithKeys[]);
      }
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const canAddOrEdit = () => {
    if (!user || !user.user_roles || user.user_roles.length === 0) return false;
    const userRole = user.user_roles[0];
    const permittedRoles: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'MINISTRY_HEAD'];
    
    return permittedRoles.includes(userRole.role) && userRole.assigned_ministry === 'Worship';
  };

  const filteredSongs = songs.filter(s => 
    (s.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.artist || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Music className="w-6 h-6 text-brand-600" />
            Worship Hub
          </h2>
          <p className="text-sm text-slate-500">Manage songs, keys, and arrangements.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search titles or artists..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {canAddOrEdit() && (
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">
                    <Plus className="w-4 h-4" />
                    New Song
                </button>
            )}
        </div>
      </div>

      {/* Song Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="text-center text-slate-500">Loading songs...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredSongs.map(song => (
            <div key={song.id} className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{song.title}</h3>
                    <div className="text-sm text-slate-500 mt-1">{song.artist}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <KeyBadge musicalKey={song.original_key} className="text-sm" />
                    {song.bpm && (
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {song.bpm} BPM
                    </span>
                    )}
                </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 flex gap-2 border-b border-slate-100">
                {song.lyrics_url && <a href={song.lyrics_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-slate-600 hover:text-brand-600 font-medium"><FileText className="w-3 h-3" /> Lyrics</a>}
                {song.youtube_link && <a href={song.youtube_link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-slate-600 hover:text-red-600 font-medium"><ExternalLink className="w-3 h-3" /> YouTube</a>}
                <div className="flex-1"></div>
                {canAddOrEdit() && <button className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"><Pencil className="w-3 h-3" /> Edit</button>}
                </div>

                <div className="p-4 flex-1 bg-white rounded-b-lg">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Leader Arrangements</h4>
                
                {song.song_preferred_keys.length > 0 ? (
                    <div className="space-y-2">
                    {song.song_preferred_keys.map((pk) => (
                        <div key={pk.id} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors"><Mic2 className="w-3 h-3" /></div>
                            <span className="font-medium text-slate-700">{pk.leader?.full_name.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Key of {pk.preferred_key}</span>
                            {pk.capo_position && pk.capo_position > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">Capo {pk.capo_position}</span>}
                        </div>
                        </div>
                    ))}
                    </div>
                ) : <div className="text-center py-2 text-xs text-slate-400 italic bg-slate-50 rounded border border-dashed border-slate-200">No leader keys assigned.</div>}
                </div>
            </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default WorshipModule;