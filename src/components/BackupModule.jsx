import React, { useRef, useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Cloud, 
  CloudDownload, 
  CloudUpload, 
  Key, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initGoogleOAuth, saveToGoogleDrive, loadFromGoogleDrive } from '../services/googleDrive';

export default function BackupModule() {
  const { data, resetToSampleData, clearAllData, importData } = useFarm();
  const fileInputRef = useRef(null);

  // Google OAuth & Client ID state
  const [clientId, setClientId] = useState(() => localStorage.getItem('google_oauth_client_id') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const handleSaveClientId = (e) => {
    e.preventDefault();
    localStorage.setItem('google_oauth_client_id', clientId.trim());
    setSyncStatus('Google OAuth Client ID saved!');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // 1-Click Backup to Google Drive
  const handleGoogleDriveBackup = () => {
    const savedId = localStorage.getItem('google_oauth_client_id') || clientId;
    if (!savedId) {
      setShowSettings(true);
      alert('Please enter your Google OAuth Client ID in Settings first to enable Google Drive Sync!');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Connecting to Google Account...');

    const oauthClient = initGoogleOAuth(
      savedId,
      async (token) => {
        setAccessToken(token);
        try {
          setSyncStatus('Uploading samagra_farm_database.json to 1 TB Google Drive...');
          await saveToGoogleDrive(token, data);
          setSyncStatus('✅ Successfully backed up to 1 TB Google Drive!');
          confetti({ particleCount: 60, spread: 70 });
        } catch (err) {
          setSyncStatus(`❌ Backup failed: ${err.message}`);
        } finally {
          setIsSyncing(false);
        }
      },
      (err) => {
        setSyncStatus(`❌ Authentication error: ${err}`);
        setIsSyncing(false);
      }
    );

    if (oauthClient) {
      oauthClient.requestAccessToken();
    } else {
      setIsSyncing(false);
    }
  };

  // 1-Click Restore from Google Drive
  const handleGoogleDriveRestore = () => {
    const savedId = localStorage.getItem('google_oauth_client_id') || clientId;
    if (!savedId) {
      setShowSettings(true);
      alert('Please enter your Google OAuth Client ID in Settings first to enable Google Drive Sync!');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Connecting to Google Account...');

    const oauthClient = initGoogleOAuth(
      savedId,
      async (token) => {
        setAccessToken(token);
        try {
          setSyncStatus('Fetching farm database from 1 TB Google Drive...');
          const restoredData = await loadFromGoogleDrive(token);
          importData(restoredData);
          setSyncStatus('✅ Farm data successfully restored from Google Drive!');
          confetti({ particleCount: 80, spread: 80 });
        } catch (err) {
          setSyncStatus(`❌ Restore failed: ${err.message}`);
        } finally {
          setIsSyncing(false);
        }
      },
      (err) => {
        setSyncStatus(`❌ Authentication error: ${err}`);
        setIsSyncing(false);
      }
    );

    if (oauthClient) {
      oauthClient.requestAccessToken();
    } else {
      setIsSyncing(false);
    }
  };

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
          alert('Farm data successfully restored from backup file!');
        } catch (error) {
          alert('Error parsing JSON backup file. Please check file formatting.');
        }
      };
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 glass-panel-glow rounded-3xl border border-cyan-500/30 card-3d flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Cloud className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">1 TB Google Drive & Local Data Backup</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">Sync farm databases to your private 1 TB Google Drive, export offline JSON files, or restore backups seamlessly.</p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Private & Protected
        </div>
      </div>

      {/* SECTION 1: 1 TB GOOGLE DRIVE CLOUD SYNC */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 card-3d space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">☁️ 1 TB Google Drive Cloud Database Sync</h3>
              <p className="text-xs text-slate-400">Stores samagra_farm_database.json inside your private Google Drive folder (Samagra_Farm_Manager_Cloud_DB).</p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Key className="w-3.5 h-3.5" /> {showSettings ? 'Close Settings' : 'Google OAuth Client ID'}
          </button>
        </div>

        {/* Client ID Configuration Form */}
        {showSettings && (
          <form onSubmit={handleSaveClientId} className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-cyan-400" /> Google Cloud OAuth 2.0 Client ID Configuration
            </h4>
            <p className="text-slate-400 text-[11px]">
              Paste your safe Client ID from Google Cloud Console (e.g. <code className="text-cyan-300">xxxx.apps.googleusercontent.com</code>).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="xxxx.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                Save ID
              </button>
            </div>
          </form>
        )}

        {/* Sync Status Alert */}
        {syncStatus && (
          <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-cyan-300 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* 1-Click Actions: Cloud Backup & Cloud Restore */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <button
            onClick={handleGoogleDriveBackup}
            disabled={isSyncing}
            className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <CloudUpload className="w-5 h-5 fill-slate-950" /> ☁️ Backup to Google Drive
          </button>

          <button
            onClick={handleGoogleDriveRestore}
            disabled={isSyncing}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <CloudDownload className="w-5 h-5 text-cyan-400" /> 🔄 Restore from Google Drive
          </button>

        </div>
      </div>

      {/* SECTION 2: LOCAL OFFLINE BACKUP FILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Download Offline JSON Backup</h3>
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
            <h3 className="text-lg font-bold text-white">Restore Data from JSON File</h3>
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
