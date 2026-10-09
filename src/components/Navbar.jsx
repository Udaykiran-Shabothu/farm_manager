import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  CloudSun,
  Package,
  Users, 
  Tractor, 
  Milk, 
  Egg, 
  LayoutDashboard, 
  Database, 
  Menu,
  X,
  UserCheck,
  LogOut,
  Sparkles,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GlobalSearchModal from './GlobalSearchModal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, gradient: 'from-emerald-600 to-teal-700' },
  { id: 'crops', label: 'Crops & Fields', shortLabel: 'Crops', icon: Sprout, gradient: 'from-green-600 to-emerald-700' },
  { id: 'inventory', label: 'Warehouse Stock', shortLabel: 'Stock', icon: Package, gradient: 'from-amber-600 to-orange-700' },
  { id: 'weather', label: 'Weather & Advisory', shortLabel: 'Weather', icon: CloudSun, gradient: 'from-sky-600 to-teal-700' },
  { id: 'workers', label: 'Workers & Wages', shortLabel: 'Workers', icon: Users, gradient: 'from-amber-600 to-yellow-700' },
  { id: 'equipment', label: 'Tractors & Machinery', shortLabel: 'Tractors', icon: Tractor, gradient: 'from-blue-600 to-indigo-700' },
  { id: 'dairy', label: 'Dairy & Milk', shortLabel: 'Dairy', icon: Milk, gradient: 'from-cyan-600 to-blue-700' },
  { id: 'poultry', label: 'Poultry & Birds', shortLabel: 'Poultry', icon: Egg, gradient: 'from-rose-600 to-pink-700' },
  { id: 'backup', label: 'Backup & Sync', shortLabel: 'Backup', icon: Database, gradient: 'from-purple-600 to-indigo-700' }
];

// YouTube Channel Profile Image Logo URL for "Samagra Jeeva Vyavasayam and Farms"
const YOUTUBE_CHANNEL_LOGO = "https://yt3.googleusercontent.com/IMyirpYgGQFylcAYXuJ5s77mTU9lRiwtYhxRQnoaEXJN67K_HLa8RYAMJ6XEEyETWlXIb8H-YCg=s200-c-k-c0x00ffffff-no-rj";

export default function Navbar({ activeTab, setActiveTab, farmName, currency, currentUser = 'Uday', onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global Ctrl+K / Cmd+K search shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2 w-full">
            
            {/* YouTube Channel Profile Image Logo + Ultra-Compact Brand Name */}
            <div 
              onClick={triggerCelebration}
              title="Samagra Jeeva Vyavasayam & Farms"
              className="flex items-center space-x-2 cursor-pointer group transform transition-all duration-300 hover:scale-105 shrink-0 min-w-0"
            >
              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 shadow-md shadow-emerald-600/20 shrink-0">
                <img 
                  src={YOUTUBE_CHANNEL_LOGO} 
                  alt="Samagra Jeeva Vyavasayam & Farms Logo" 
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-[14px] object-cover bg-white"
                />
              </div>

              {/* Compact Sleek Brand Title */}
              <div className="flex flex-col justify-center leading-tight min-w-0">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 truncate max-w-[95px] sm:max-w-[150px] xl:max-w-[190px]">
                  Samagra Farm
                </span>
                <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline-block tracking-tight truncate max-w-[150px]">
                  Jeeva Vyavasayam
                </span>
              </div>
            </div>

            {/* Desktop Center Navigation Tabs (Fits cleanly within bounds) */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-md shadow-emerald-700/20 scale-105`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {/* Responsive text display to prevent overlap on 1024px-1280px viewports */}
                    <span className={`${isActive ? 'inline' : 'hidden xl:inline'} whitespace-nowrap`}>
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: User Profile & Logout */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Global Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                title="Search records across all modules (Ctrl+K)"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer group"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-white border border-slate-300 rounded text-[9px] text-slate-500 font-extrabold shadow-xs">
                  ⌘K
                </kbd>
              </button>

              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{currentUser}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <div className="flex lg:hidden items-center ml-0.5">
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
        </div>

        {/* Mobile Top Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1.5 animate-fadeIn shadow-lg">
            {/* Mobile User Profile Header */}
            <div className="flex items-center justify-between p-2.5 mb-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Logged in as: <strong className="text-slate-900">{currentUser}</strong></span>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              )}
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 mb-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Search all records...</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Ctrl+K</span>
            </button>

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
                  <Icon className="w-4 h-4 shrink-0" />
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
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>

      </header>

      {/* Mobile Fixed Bottom App Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl py-1.5 px-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              title={item.label}
              className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all ${
                isActive 
                  ? `bg-gradient-to-r ${item.gradient} text-white font-extrabold shadow-sm scale-105` 
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold whitespace-nowrap">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
        setActiveTab={setActiveTab} 
      />
    </>
  );
}
