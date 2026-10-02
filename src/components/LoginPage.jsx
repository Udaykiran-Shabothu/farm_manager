import React, { useState } from 'react';
import { Leaf, Sun, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const trimmedUser = username.trim();
      
      // Case-insensitive check for username 'Uday' and exact password 'Udaykiran'
      if (trimmedUser.toLowerCase() === 'uday' && password === 'Udaykiran') {
        if (rememberMe) {
          localStorage.setItem('farm_manager_user', JSON.stringify({ username: 'Uday', loggedInAt: new Date().toISOString() }));
        } else {
          sessionStorage.setItem('farm_manager_user', JSON.stringify({ username: 'Uday', loggedInAt: new Date().toISOString() }));
        }
        onLoginSuccess('Uday');
      } else {
        setErrorMsg('Invalid Username or Password. Hint: Username is "Uday" & Password is "Udaykiran".');
        setIsSubmitting(false);
      }
    }, 300);
  };

  const autofillCredentials = () => {
    setUsername('Uday');
    setPassword('Udaykiran');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Background Animated Ambient Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none animate-glow" />

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 card-3d animate-scaleIn">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 transform transition-transform duration-300 hover:scale-110">
            <Leaf className="w-8 h-8 stroke-[2.5]" />
            <Sun className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-spin-slow" />
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Samagra Farm Manager
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Integrated Agriculture Operations & Multi-Sector Hub
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Owner Authentication</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Username Input */}
          <div>
            <label className="block text-slate-700 mb-1.5 font-bold">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Enter username (e.g. Uday)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-slate-700 mb-1.5 font-bold">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Auto Fill Row */}
          <div className="flex items-center justify-between text-slate-600 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-bold">Keep me logged in</span>
            </label>

            <button
              type="button"
              onClick={autofillCredentials}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-fill Demo
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/30 hover:shadow-xl hover:shadow-emerald-700/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center space-x-2 mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <>
                <span>Sign In to Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Footer Box */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-extrabold text-slate-800 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Current Owner Credentials
            </p>
            <div className="flex items-center justify-center gap-3 font-mono font-bold text-slate-700 text-[11px]">
              <span>Username: <strong className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">Uday</strong></span>
              <span>Password: <strong className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">Udaykiran</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
