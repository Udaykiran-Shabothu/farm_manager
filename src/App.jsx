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

  const farmName = data?.farmInfo?.name || "Samagra Jeeva Vyavasayam & Farms";
  const currency = data?.farmInfo?.currency || "₹";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      
      {/* Soft Fresh Daylight Background Ambient Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-emerald-100/60 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[120px] animate-float-reverse" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[110px] animate-glow" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          farmName={farmName} 
          currency={currency}
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
      <footer className="relative z-10 bg-white border-t border-slate-200 py-5 mt-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">Daily Farm Manager</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-500 truncate font-medium">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" /> Stored locally & synced to Cloud API
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('backup')} 
              className="hover:text-emerald-600 transition-colors font-semibold text-slate-700 hover:underline"
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
