import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { SongWithKeys } from '../types';
import { Search, Music, ExternalLink, X, Mic2 } from 'lucide-react';
import KeyBadge from './KeyBadge';

const WorshipModule: React.FC = () => {
  const [songs, setSongs] = useState<SongWithKeys[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongWithKeys | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.fetchSongs().then(setSongs);
  }, []);

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex gap-6">
      {/* Song List (Left) */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Worship Database</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by title, lyrics, or artist..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredSongs.map(song => (
            <div 
              key={song.id}
              onClick={() => setSelectedSong(song)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                ${selectedSong?.id === song.id 
                  ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-300' 
                  : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-sm'}`}
            >
              <div>
                <div className="font-medium text-slate-900">{song.title}</div>
                <div className="text-xs text-slate-500">{song.artist}</div>
              </div>
              <KeyBadge musicalKey={song.default_key} />
            </div>
          ))}
        </div>
      </div>

      {/* Song Details (Right/Modal area) */}
      {selectedSong ? (
        <div className="w-1/3 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-start bg-slate-50 rounded-t-lg">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedSong.title}</h3>
              <p className="text-sm text-slate-500">{selectedSong.artist}</p>
            </div>
            <button onClick={() => setSelectedSong(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* Quick Links */}
            <div className="flex gap-3">
               {selectedSong.lyrics_url && (
                 <a href={selectedSong.lyrics_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Music className="w-4 h-4" /> Lyrics
                 </a>
               )}
               {selectedSong.youtube_url && (
                 <a href={selectedSong.youtube_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-slate-300 text-sm font-medium text-red-600 hover:bg-red-50">
                    <ExternalLink className="w-4 h-4" /> YouTube
                 </a>
               )}
            </div>

            {/* Keys Matrix */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Leader Keys</h4>
              <div className="space-y-3">
                {/* Default */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-200 p-1.5 rounded-full"><Music className="w-3 h-3 text-slate-600"/></div>
                        <span className="text-sm text-slate-700">Original / Default</span>
                    </div>
                    <KeyBadge musicalKey={selectedSong.default_key} />
                </div>

                {/* Specific Leaders */}
                {selectedSong.preferred_keys.map(pk => (
                   <div key={pk.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="bg-brand-100 p-1.5 rounded-full"><Mic2 className="w-3 h-3 text-brand-600"/></div>
                        <span className="text-sm font-medium text-slate-900">{pk.profile?.full_name}</span>
                      </div>
                      <KeyBadge musicalKey={pk.key_value} className="text-lg" />
                   </div>
                ))}

                {selectedSong.preferred_keys.length === 0 && (
                    <div className="text-center py-4 text-sm text-slate-400 italic">
                        No leader-specific keys assigned yet.
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-1/3 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
           <div className="text-center">
             <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
             <p>Select a song to view details</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorshipModule;