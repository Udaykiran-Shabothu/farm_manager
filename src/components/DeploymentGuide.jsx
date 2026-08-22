import React, { useState } from 'react';
import { Globe, Rocket, CheckCircle2, Copy, ExternalLink, Smartphone, CloudUpload, ShieldCheck, Server } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DeploymentGuide() {
  const [copied, setCopied] = useState(false);

  const copyBuildCommand = () => {
    navigator.clipboard.writeText('npm run build');
    setCopied(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 sm:p-8 glass-panel-glow rounded-3xl border border-indigo-500/30 card-3d flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Publish Farm Manager Online</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Access your daily farming website directly on your smartphone from the field anywhere! Follow these 3 simple free deployment options.
          </p>
        </div>
        <button
          onClick={copyBuildCommand}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
        >
          <Rocket className="w-4 h-4" /> {copied ? 'Command Copied!' : 'Copy Build Command'}
        </button>
      </div>

      {/* Deployment Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Option 1: Vercel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Recommended (Free)
              </span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Vercel Deployment</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Connect your GitHub repository to Vercel or run <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">npx vercel</code> in your project directory for instant HTTPS online access.
            </p>
          </div>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <span>Open Vercel</span> <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Option 2: Netlify Drag & Drop */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Easiest (No Code)
              </span>
              <CloudUpload className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Netlify Drop</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Run <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-400">npm run build</code> in <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-400">D:\farm_manager</code>, then drag the generated <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-400">dist</code> folder to app.netlify.com/drop!
            </p>
          </div>
          <a
            href="https://app.netlify.com/drop"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <span>Open Netlify Drop</span> <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Option 3: Cloudflare Pages */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Super Fast
              </span>
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Cloudflare Pages</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Deploy directly via Cloudflare Pages global network with zero configuration and unlimited free bandwidth worldwide.
            </p>
          </div>
          <a
            href="https://pages.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <span>Open Cloudflare</span> <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* Step by Step Guide */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 card-3d space-y-6">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-emerald-400" />
          Step-by-step Local Build & Mobile Access Guide
        </h3>

        <div className="space-y-4 text-xs text-slate-300">
          
          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <h4 className="font-bold text-white text-sm">Build Local Production Bundle</h4>
              <p className="text-slate-400 mt-1">Open PowerShell or Command Prompt in <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">D:\farm_manager</code> and execute:</p>
              <pre className="mt-2 p-3 bg-slate-950 rounded-xl font-mono text-emerald-300 border border-slate-800">npm run build</pre>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <h4 className="font-bold text-white text-sm">Upload to Netlify or Vercel</h4>
              <p className="text-slate-400 mt-1">
                Open <a href="https://app.netlify.com/drop" target="_blank" className="text-cyan-400 underline">app.netlify.com/drop</a> in your browser and drag the generated <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded">D:\farm_manager\dist</code> folder directly into the webpage drop area.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <h4 className="font-bold text-white text-sm">Open on Smartphone Mobile Browser</h4>
              <p className="text-slate-400 mt-1">
                Netlify or Vercel will instantly generate your personal web link (e.g., <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">https://my-daily-farm.netlify.app</code>). Bookmark it or add it to your mobile Home Screen!
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
