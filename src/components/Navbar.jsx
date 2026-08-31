import React, { useState } from 'react';
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
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'crops', label: 'Crops & Fields', shortLabel: 'Crops', icon: Sprout, gradient: 'from-green-500 to-emerald-600' },
  { id: 'workers', label: 'Workers & Wages', shortLabel: 'Workers', icon: Users, gradient: 'from-amber-500 to-yellow-600' },
  { id: 'equipment', label: 'Tractors & Machinery', shortLabel: 'Tractors', icon: Tractor, gradient: 'from-blue-500 to-indigo-600' },
  { id: 'dairy', label: 'Dairy & Milk', shortLabel: 'Dairy', icon: Milk, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'poultry', label: 'Poultry & Birds', shortLabel: 'Poultry', icon: Egg, gradient: 'from-rose-500 to-pink-600' },
  { id: 'backup', label: 'Backup & Sync', shortLabel: 'Backup', icon: Database, gradient: 'from-purple-500 to-indigo-600' }
];

export default function Navbar({ activeTab, setActiveTab, farmName, currency }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 glass-panel-glow border-b border-slate-700/60 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={triggerCelebration}
              className="flex items-center space-x-2 cursor-pointer group transform transition-all duration-300 hover:scale-105 min-w-0"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 stroke-[2.5]" />
                <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-900 absolute -top-1 -right-1 animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-[320px]">
                    {farmName || 'Samagra Jeeva Vyavasayam'}
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full items-center gap-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Organic Farm
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                  Integrated Organic Agriculture Operations Hub
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 glass-panel p-1.5 rounded-2xl border border-slate-700/50">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-md shadow-emerald-900/30 scale-105`
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Top Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-1.5 animate-fadeIn">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Secondary Scrollable Horizontal Navigation Pill Bar */}
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/90 px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center space-x-1.5 text-nowrap snap-x">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex-shrink-0 snap-start flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-md shadow-emerald-950/40 scale-105`
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </header>

      {/* Mobile Fixed Bottom App Navigation Bar (Flipkart / Amazon Style) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl py-1 px-1 flex items-center justify-between no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                isActive 
                  ? 'text-emerald-400 font-extrabold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-[48px]">
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
