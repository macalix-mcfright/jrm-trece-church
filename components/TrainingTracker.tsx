import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { ProfileWithTraining } from '../types';
import { Monitor, LayoutGrid, CheckCircle2, Circle } from 'lucide-react';

interface TrainingTrackerProps {
  onToggleProjector: (active: boolean) => void;
  isProjectorMode: boolean;
}

const TrainingTracker: React.FC<TrainingTrackerProps> = ({ onToggleProjector, isProjectorMode }) => {
  const [data, setData] = useState<ProfileWithTraining[]>([]);

  useEffect(() => {
    api.fetchTrainingMatrix().then(setData);
  }, []);

  // --- PROJECTOR MODE STYLES ---
  const containerClass = isProjectorMode 
    ? "fixed inset-0 z-50 bg-black text-white p-8 overflow-auto" 
    : "h-full bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden";
  
  const tableHeaderClass = isProjectorMode
    ? "bg-zinc-900 text-zinc-300 text-2xl py-6"
    : "bg-slate-50 text-slate-500 text-xs py-3";

  const tableCellClass = isProjectorMode
    ? "py-6 text-3xl border-zinc-800"
    : "py-4 text-sm border-slate-200";

  return (
    <div className={containerClass}>
      {/* Header / Controls */}
      <div className={`flex justify-between items-center ${isProjectorMode ? 'mb-8 border-b border-zinc-700 pb-4' : 'p-4 border-b border-slate-200'}`}>
        <h2 className={`${isProjectorMode ? 'text-4xl font-bold text-brand-400' : 'text-lg font-semibold text-slate-800'}`}>
          Training Progress (EGPR & T4T)
        </h2>
        <button 
          onClick={() => onToggleProjector(!isProjectorMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
            ${isProjectorMode 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
              : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
        >
          {isProjectorMode ? <LayoutGrid className="w-5 h-5"/> : <Monitor className="w-4 h-4"/>}
          {isProjectorMode ? 'Exit Projector' : 'Projector Mode'}
        </button>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-auto">
        <table className={`min-w-full divide-y ${isProjectorMode ? 'divide-zinc-800' : 'divide-slate-200'}`}>
          <thead className={isProjectorMode ? 'bg-black' : 'bg-slate-50'}>
            <tr>
              <th className={`px-6 text-left font-medium uppercase tracking-wider ${tableHeaderClass}`}>Member</th>
              <th className={`px-6 text-center font-medium uppercase tracking-wider ${tableHeaderClass}`}>EGPR</th>
              <th className={`px-6 text-center font-medium uppercase tracking-wider ${tableHeaderClass}`}>T4T</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isProjectorMode ? 'divide-zinc-800 bg-black' : 'divide-slate-200 bg-white'}`}>
            {data.map((profile) => {
               const egpr = profile.training_records.find(r => r.module_name === 'EGPR')?.status || 'Not Started';
               const t4t = profile.training_records.find(r => r.module_name === 'T4T')?.status || 'Not Started';
               
               return (
                <tr key={profile.id} className={isProjectorMode ? '' : 'hover:bg-slate-50'}>
                  <td className={`px-6 font-medium ${tableCellClass} ${isProjectorMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {profile.full_name}
                  </td>
                  
                  {/* Status Cells */}
                  {[egpr, t4t].map((status, idx) => (
                    <td key={idx} className={`px-6 text-center ${tableCellClass}`}>
                      <div className="flex items-center justify-center gap-2">
                        {status === 'Completed' && (
                          <CheckCircle2 className={`
                            ${isProjectorMode ? 'w-8 h-8 text-green-400' : 'w-5 h-5 text-green-600'}
                          `} />
                        )}
                        {status === 'In Progress' && (
                          <div className={`rounded-full border-2 border-dotted animate-pulse
                            ${isProjectorMode ? 'w-6 h-6 border-amber-400' : 'w-4 h-4 border-amber-500'}
                          `} />
                        )}
                        {status === 'Not Started' && (
                           <Circle className={`
                            ${isProjectorMode ? 'w-6 h-6 text-zinc-700' : 'w-4 h-4 text-slate-300'}
                           `} />
                        )}
                        
                        {/* Text label for accessibility/clarity */}
                        <span className={`
                          ${status === 'Completed' ? (isProjectorMode ? 'text-green-400' : 'text-green-700') : ''}
                          ${status === 'In Progress' ? (isProjectorMode ? 'text-amber-400' : 'text-amber-700') : ''}
                          ${status === 'Not Started' ? (isProjectorMode ? 'text-zinc-600' : 'text-slate-400') : ''}
                        `}>
                          {status}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainingTracker;