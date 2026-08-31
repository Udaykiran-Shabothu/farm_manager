import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CropsModule from './components/CropsModule';
import WorkersModule from './components/WorkersModule';
import EquipmentModule from './components/EquipmentModule';
import DairyModule from './components/DairyModule';
import PoultryModule from './components/PoultryModule';
import BackupModule from './components/BackupModule';
import { HardDrive } from 'lucide-react';

function MainApp() {
  const { data } = useFarm();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background Animated Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] animate-float-reverse" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px] animate-glow" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          farmName={data.farmInfo.name} 
          currency={data.farmInfo.currency}
        />

        <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8 animate-fadeIn">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'crops' && <CropsModule />}
          {activeTab === 'workers' && <WorkersModule />}
          {activeTab === 'equipment' && <EquipmentModule />}
          {activeTab === 'dairy' && <DairyModule />}
          {activeTab === 'poultry' && <PoultryModule />}
          {activeTab === 'backup' && <BackupModule />}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 glass-panel-glow border-t border-slate-800/80 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">Daily Farm Manager</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-400 truncate">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Stored locally & synced to Cloud
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('backup')} 
              className="hover:text-emerald-400 transition-colors font-medium text-slate-300"
            >
              Backup & Data Sync
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <FarmProvider>
      <MainApp />
    </FarmProvider>
  );
}
