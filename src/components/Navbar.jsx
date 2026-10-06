import React, { useState } from 'react';
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

// YouTube Channel Profile Image Logo URL for "Samagra Jeeva Vyavasayam and Farms"
const YOUTUBE_CHANNEL_LOGO = "https://yt3.googleusercontent.com/IMyirpYgGQFylcAYXuJ5s77mTU9lRiwtYhxRQnoaEXJN67K_HLa8RYAMJ6XEEyETWlXIb8H-YCg=s200-c-k-c0x00ffffff-no-rj";

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
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2 w-full">
            
            {/* YouTube Channel Profile Image Logo (No text name beside logo as requested) */}
            <div 
              onClick={triggerCelebration}
              title="Samagra Jeeva Vyavasayam & Farms"
              className="flex items-center cursor-pointer group transform transition-all duration-300 hover:scale-105 shrink-0"
            >
              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 shadow-md shadow-emerald-600/20">
                <img 
                  src={YOUTUBE_CHANNEL_LOGO} 
                  alt="Samagra Jeeva Vyavasayam & Farms YouTube Profile Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] object-cover bg-white"
                  onError={(e) => {
                    // Fallback to stylized logo if image load fails
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Desktop Center Navigation Tabs (Fits cleanly within application bounds) */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-md shadow-emerald-700/20 scale-105`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: User Profile & Logout */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{currentUser}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <div className="flex lg:hidden items-center ml-1">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
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

      {/* Mobile Fixed Bottom App Navigation Bar (Horizontal Scrollable Pills within bounds) */}
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
