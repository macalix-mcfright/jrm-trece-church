import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { SongWithKeys, Profile } from '../types';
import { Search, Music, ExternalLink, Mic2, FileText, Pencil, Activity } from 'lucide-react';
import KeyBadge from './KeyBadge';

/* 
  SUPABASE DATA FETCHING QUERY REFERENCE (Task 3)
  -----------------------------------------------
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      preferred_keys:song_preferred_keys (
        preferred_key,
        capo_position,
        leader:profiles (
          full_name
        )
      )
    `);
*/

const SongLibrary: React.FC = () => {
  const [songs, setSongs] = useState<SongWithKeys[]>([]);
  const [search, setSearch] = useState('');
  // Simulating a logged-in user. Change to 'p1' (None) to test "View Only" mode.
  // FIX: `assigned_ministry` must be nested inside the `user_roles` array to match the `Profile` type.
  const [currentUser] = useState<Partial<Profile>>({ id: 'p2', user_roles: [{id: 1, user_id: 'p2', role: 'MINISTRY_HEAD', assigned_ministry: 'Worship'}] }); 
  
  useEffect(() => {
    api.fetchSongs().then(setSongs);
  }, []);

  // FIX: Access `assigned_ministry` from within the `user_roles` array.
  const canEdit = currentUser.user_roles?.[0]?.assigned_ministry === 'Worship';

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.artist.toLowerCase().includes(search.toLowerCase())
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
        
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search titles, lyrics, or artists..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Song Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            
            {/* Card Header */}
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

            {/* Links & Tools */}
            <div className="px-4 py-3 bg-slate-50 flex gap-2 border-b border-slate-100">
              {song.lyrics_url && (
                <a href={song.lyrics_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-slate-600 hover:text-brand-600 font-medium">
                  <FileText className="w-3 h-3" /> Lyrics
                </a>
              )}
              {song.youtube_link && (
                <a href={song.youtube_link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-slate-600 hover:text-red-600 font-medium">
                  <ExternalLink className="w-3 h-3" /> YouTube
                </a>
              )}
              <div className="flex-1"></div>
              {canEdit && (
                <button className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {/* Leader Key Grid (Task 2 Requirement) */}
            <div className="p-4 flex-1 bg-white rounded-b-lg">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Leader Arrangements</h4>
              
              {/* FIX: Property 'preferred_keys' does not exist on type 'SongWithKeys'. Use 'song_preferred_keys' instead. */}
              {song.song_preferred_keys.length > 0 ? (
                <div className="space-y-2">
                  {/* FIX: Property 'preferred_keys' does not exist on type 'SongWithKeys'. Use 'song_preferred_keys' instead. */}
                  {song.song_preferred_keys.map((pk) => (
                    <div key={pk.id} className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                          <Mic2 className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-slate-700">{pk.leader?.full_name.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-slate-800">Key of {pk.preferred_key}</span>
                         {pk.capo_position && pk.capo_position > 0 ? (
                           <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                             Capo {pk.capo_position}
                           </span>
                         ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-slate-400 italic bg-slate-50 rounded border border-dashed border-slate-200">
                  No specific leader keys assigned.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongLibrary;