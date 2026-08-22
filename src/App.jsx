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
import DeploymentGuide from './components/DeploymentGuide';
import { HardDrive, Globe, Heart } from 'lucide-react';

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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'crops' && <CropsModule />}
          {activeTab === 'workers' && <WorkersModule />}
          {activeTab === 'equipment' && <EquipmentModule />}
          {activeTab === 'dairy' && <DairyModule />}
          {activeTab === 'poultry' && <PoultryModule />}
          {activeTab === 'backup' && <BackupModule />}
          {activeTab === 'deploy' && <DeploymentGuide />}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 glass-panel-glow border-t border-slate-800/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Daily Farm Manager 3D</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Stored locally in <code className="text-emerald-300 font-mono">D:\farm_manager</code>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('backup')} 
              className="hover:text-emerald-400 transition-colors"
            >
              Backup & Export
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={() => setActiveTab('deploy')} 
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold text-cyan-300"
            >
              <Globe className="w-3.5 h-3.5" /> Deploy Online
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
