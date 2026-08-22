import React from 'react';
import { 
  Sprout, 
  Leaf,
  Sun,
  Users, 
  Tractor, 
  Milk, 
  Egg, 
  LayoutDashboard, 
  Database, 
  Globe, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'crops', label: 'Crops & Fields', icon: Sprout, gradient: 'from-green-500 to-emerald-600' },
  { id: 'workers', label: 'Workers & Wages', icon: Users, gradient: 'from-amber-500 to-yellow-600' },
  { id: 'equipment', label: 'Tractors & Machinery', icon: Tractor, gradient: 'from-blue-500 to-indigo-600' },
  { id: 'dairy', label: 'Dairy & Milk', icon: Milk, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'poultry', label: 'Poultry & Birds', icon: Egg, gradient: 'from-rose-500 to-pink-600' },
  { id: 'backup', label: 'Backup & Data', icon: Database, gradient: 'from-purple-500 to-indigo-600' },
  { id: 'deploy', label: 'Go Online', icon: Globe, gradient: 'from-indigo-500 to-violet-600' },
];

export default function Navbar({ activeTab, setActiveTab, farmName, currency }) {
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel-glow border-b border-slate-700/60 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name with Nature Symbols */}
          <div 
            onClick={triggerCelebration}
            className="flex items-center space-x-3 cursor-pointer group transform transition-all duration-300 hover:scale-105"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform group-hover:rotate-12 transition-transform duration-300">
              <Leaf className="w-7 h-7 text-slate-950 stroke-[2.5]" />
              <Sun className="w-4 h-4 text-amber-900 absolute -top-1 -right-1 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-1.5">
                  <span>🍃</span> {farmName || 'Samagra Jeeva Vyavasayam & Farms'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Organic 3D
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Integrated Organic Agriculture & Farm Operations Hub</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 glass-panel p-1.5 rounded-2xl border border-slate-700/50 shadow-inner">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 transform ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-emerald-900/30 scale-105 transform-style-3d translate-z-10`
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status badge */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('deploy')}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Globe className="w-4 h-4" />
              <span>Publish Online</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="lg:hidden flex space-x-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 border border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
