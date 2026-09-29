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
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, gradient: 'from-emerald-600 to-teal-700' },
  { id: 'crops', label: 'Crops & Fields', shortLabel: 'Crops', icon: Sprout, gradient: 'from-green-600 to-emerald-700' },
  { id: 'workers', label: 'Workers & Wages', shortLabel: 'Workers', icon: Users, gradient: 'from-amber-600 to-yellow-700' },
  { id: 'equipment', label: 'Tractors & Machinery', shortLabel: 'Tractors', icon: Tractor, gradient: 'from-blue-600 to-indigo-700' },
  { id: 'dairy', label: 'Dairy & Milk', shortLabel: 'Dairy', icon: Milk, gradient: 'from-cyan-600 to-blue-700' },
  { id: 'poultry', label: 'Poultry & Birds', shortLabel: 'Poultry', icon: Egg, gradient: 'from-rose-600 to-pink-700' },
  { id: 'backup', label: 'Backup & Sync', shortLabel: 'Backup', icon: Database, gradient: 'from-purple-600 to-indigo-700' }
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={triggerCelebration}
              className="flex items-center space-x-2.5 cursor-pointer group transform transition-all duration-300 hover:scale-105 min-w-0"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
                <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 absolute -top-1 -right-1 animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 truncate max-w-[180px] sm:max-w-[320px]">
                    {farmName || 'Samagra Jeeva Vyavasayam'}
                  </span>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-full items-center gap-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Organic Farm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
                  Integrated Organic Agriculture Operations Hub
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-md shadow-emerald-700/20 scale-105`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
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
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Top Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1.5 animate-fadeIn shadow-lg">
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
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center space-x-1.5 text-nowrap snap-x">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex-shrink-0 snap-start flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-sm scale-105`
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </header>

      {/* Mobile Fixed Bottom App Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl py-1 px-1 flex items-center justify-between no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                isActive 
                  ? 'text-emerald-700 font-extrabold scale-105' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : ''}`}>
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
