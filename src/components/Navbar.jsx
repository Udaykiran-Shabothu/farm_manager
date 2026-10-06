import React, { useState } from 'react';
import { 
  Sprout, 
  Leaf,
  Sun,
  CloudSun,
  Package,
  Users, 
  Tractor, 
  Milk, 
  Egg, 
  LayoutDashboard, 
  Database, 
  Sparkles,
  Menu,
  X,
  UserCheck,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

export default function Navbar({ activeTab, setActiveTab, farmName, currency, currentUser = 'Uday', onLogout }) {
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
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={triggerCelebration}
              className="flex items-center space-x-2.5 cursor-pointer group transform transition-all duration-300 hover:scale-105 min-w-0 shrink-0"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-600/25 flex-shrink-0">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
                <Sun className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-sm sm:text-lg tracking-tight text-slate-900 truncate max-w-[140px] sm:max-w-[220px] xl:max-w-[300px]">
                    {farmName || 'Samagra Farm'}
                  </span>
                  <span className="hidden 2xl:inline-flex px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 rounded-full items-center gap-1 flex-shrink-0 shadow-xs">
                    <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Organic Farm
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium truncate hidden sm:flex">
                  <span className="truncate max-w-[180px] xl:max-w-[260px]">Integrated Agriculture Operations</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Controls: Navigation & User Profile */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              
              {/* Desktop Responsive Navigation Tabs */}
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
                      {/* On lg viewports, show label for active item, and icons only for inactive items. On xl+ show short label for all items. */}
                      <span className={`${isActive ? 'inline' : 'hidden xl:inline'} whitespace-nowrap`}>
                        {item.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Logged in User Profile & Logout Action */}
              <div className="flex items-center space-x-1.5 pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0">
                <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
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
              </div>

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

      {/* Mobile Fixed Bottom App Navigation Bar (Horizontal Scrollable Pills) */}
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
    </>
  );
}
