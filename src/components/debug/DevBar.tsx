'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, X, Bug } from 'lucide-react';

export const DevBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dev_date_override');
    if (saved) {
      setOverrideDate(saved);
      setIsVisible(true);
    }
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleApply = () => {
    if (overrideDate) {
      localStorage.setItem('dev_date_override', overrideDate);
    } else {
      localStorage.removeItem('dev_date_override');
    }
    window.location.reload();
  };

  const handleClear = () => {
    localStorage.removeItem('dev_date_override');
    window.location.reload();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9999] p-3 bg-accent text-white rounded-full shadow-lg hover:scale-110 transition-transform"
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
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Target Date</label>
              <input
                type="date"
                value={overrideDate || currentDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 bg-accent text-white font-bold text-xs py-2 rounded-lg hover:bg-accent/90 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Apply
              </button>
              {overrideDate && (
                <button
                  onClick={handleClear}
                  className="px-3 bg-foreground/5 text-foreground/50 hover:bg-foreground/10 py-2 rounded-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-[9px] text-center text-foreground/30 leading-tight italic">
              Overriding date will force local hashing to sync all daily challenges to that specific day.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
