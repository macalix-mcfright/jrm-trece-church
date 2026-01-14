import React, { useState } from 'react';
import Layout from './components/Layout';
import MemberDirectory from './components/MemberDirectory';
import WorshipModule from './components/WorshipModule';
import TrainingTracker from './components/TrainingTracker';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('members');
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'members':
        return <MemberDirectory />;
      case 'worship':
        return <WorshipModule />;
      case 'training':
        return (
          <TrainingTracker 
            onToggleProjector={setIsProjectorMode} 
            isProjectorMode={isProjectorMode} 
          />
        );
      case 'docs':
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
                <h3 className="text-lg font-medium text-slate-900">Document Repository</h3>
                <p>Secure file storage integrated with Backblaze B2 (Mock).</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium uppercase">Total Members</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">1,240</p>
                <div className="mt-4 text-sm text-green-600">+12 this week</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium uppercase">Worship Songs</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">342</p>
                <div className="mt-4 text-sm text-slate-500">Active Database</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium uppercase">Training Completed</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">85%</p>
                <div className="mt-4 text-sm text-brand-600">Target: 90%</div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView}
      isProjectorMode={isProjectorMode}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;