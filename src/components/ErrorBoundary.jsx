import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error Captured by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetLocalStorage = () => {
    try {
      localStorage.removeItem('agri_farm_manager_db');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl border border-rose-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Application Recovery Notice</h2>
                <p className="text-xs text-slate-500">Samagra Farm Manager encountered a temporary rendering issue.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Technical Diagnostics:
              </p>
              <p className="font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-rose-700 overflow-x-auto">
                {this.state.error?.toString() || 'Unknown Javascript Exception'}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2 text-[11px]">
                  <summary className="cursor-pointer text-slate-500 font-semibold hover:text-slate-800">
                    View Full Stack Trace
                  </summary>
                  <pre className="font-mono bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 text-[10px] mt-1 overflow-x-auto whitespace-pre-wrap max-h-48">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page & Recover
              </button>

              <button
                onClick={this.handleResetLocalStorage}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4 text-rose-600" /> Reset Stale Cache
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Your farm records are safely stored on disk and will re-sync automatically upon reload.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
