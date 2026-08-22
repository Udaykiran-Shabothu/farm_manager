import React, { useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { Database, Download, Upload, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BackupModule() {
  const { data, resetToSampleData, clearAllData, importData } = useFarm();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `farm_manager_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    confetti({ particleCount: 50, spread: 60 });
  };

  const handleFileChange = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          importData(parsed);
          alert('Farm data successfully restored from backup!');
        } catch (error) {
          alert('Error parsing JSON backup file. Please check file formatting.');
        }
      };
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 glass-panel-glow rounded-3xl border border-purple-500/30 card-3d flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Local Data Backup & Recovery</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">Export complete farm databases, restore backups, or reset demo data anytime safely.</p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Offline Protected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Download Farm Backup</h3>
            <p className="text-xs text-slate-400 mt-1">
              Saves a complete `.json` copy of all your crop, worker, tractor, dairy, and poultry records directly to your computer.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" /> Download JSON Backup File
          </button>
        </div>

        {/* Restore Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Restore Data from Backup</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a previously saved `.json` backup file to restore all your farm records instantly.
            </p>
          </div>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Upload className="w-4 h-4" /> Choose Backup File
          </button>
        </div>

      </div>

      {/* Demo Data & Danger Zone */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Sample Data & Storage Reset
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">Load Realistic Demo Data</h4>
            <p className="text-xs text-slate-400">Pre-populates sample crop harvests, worker attendance, diesel fills, milk logs, and poultry flocks for testing.</p>
          </div>
          <button
            onClick={() => {
              resetToSampleData();
              confetti({ particleCount: 60 });
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" /> Load Sample Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
          <div>
            <h4 className="text-sm font-bold text-rose-300">Clear All Local Records</h4>
            <p className="text-xs text-rose-400/80">Wipes all stored records to start completely fresh with zero entries.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all farm records? Make sure you have exported a backup first!')) {
                clearAllData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" /> Clear Database
          </button>
        </div>
      </div>

    </div>
  );
}
