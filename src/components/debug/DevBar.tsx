'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, X, Bug, Layout } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export const DevBar = () => {
  if (process.env.NODE_ENV === 'production') return null;

  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const { showDevTiles } = useUserStore((state) => state.preferences);
  const setShowDevTiles = useUserStore((state) => state.setShowDevTiles);

  useEffect(() => {
    const saved = localStorage.getItem('dev_date_override');
    const enabled = localStorage.getItem('dev_date_enabled') === 'true';
    if (saved) {
      setOverrideDate(saved);
      setIsEnabled(enabled);
      if (enabled) setIsVisible(true);
    }
    const now = new Date();
    setCurrentDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  }, []);

  const handleApply = () => {
    if (isEnabled && overrideDate) {
      localStorage.setItem('dev_date_override', overrideDate);
      localStorage.setItem('dev_date_enabled', 'true');
    } else {
      localStorage.removeItem('dev_date_enabled');
    }
    window.location.reload();
  };

  const handleClear = () => {
    localStorage.removeItem('dev_date_override');
    localStorage.removeItem('dev_date_enabled');
    window.location.reload();
  };

  const handleToggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    if (!newEnabled) {
      setOverrideDate(currentDate);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 z-[9999] p-3 rounded-full shadow-lg hover:scale-110 transition-all ${isEnabled ? 'bg-accent text-white animate-pulse' : 'bg-card border border-border text-foreground/40'}`}
        title="Dev Tools"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Floating Bar */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-[9998] w-72 bg-card border border-border shadow-neo-out rounded-2xl p-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
              <Calendar className="w-4 h-4" />
              Time Travel
            </div>
            <button onClick={() => setIsVisible(false)} className="text-foreground/30 hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${isEnabled ? 'text-accent' : 'text-foreground/20'}`} />
                <span className={`text-xs font-bold ${isEnabled ? 'text-foreground' : 'text-foreground/40'}`}>Enable Override</span>
              </div>
              <button
                onClick={handleToggleEnabled}
                className={`w-10 h-5 rounded-full transition-colors relative ${isEnabled ? 'bg-accent' : 'bg-foreground/20'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className={`space-y-1 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Target Date</label>
              <input
                type="date"
                value={overrideDate || currentDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold">Show Dev Tiles</span>
              </div>
              <button
                onClick={() => setShowDevTiles(!showDevTiles)}
                className={`w-10 h-5 rounded-full transition-colors relative ${showDevTiles ? 'bg-accent' : 'bg-foreground/20'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${showDevTiles ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 bg-accent text-white font-bold text-xs py-2 rounded-lg hover:bg-accent/90 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Apply Changes
              </button>
              {(overrideDate || isEnabled) && (
                <button
                  onClick={handleClear}
                  className="px-3 bg-foreground/5 text-foreground/50 hover:bg-foreground/10 py-2 rounded-lg"
                  title="Reset to Real Time"
                >
                  <RefreshCw className="w-3 h-3 rotate-180" />
                </button>
              )}
            </div>

            <p className="text-[9px] text-center text-foreground/30 leading-tight italic">
              {isEnabled 
                ? "Overriding date will sync all daily challenges to that specific day."
                : "Time Travel is disabled. Using real-world clock."}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
