/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { seedInitialData, getTrips } from './lib/dbService';
import { Trip } from './types';
import PassengerPortal from './components/PassengerPortal';
import OperatorPortal from './components/OperatorPortal';
import SettingsPanel from './components/SettingsPanel';
import { useTheme } from './ThemeContext';
import { Bus, Settings, Users, Heart, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [role, setRole] = useState<'passenger' | 'operator'>('passenger');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isSeeding, setIsSeeding] = useState(true);
  const { setSettingsOpen } = useTheme();

  const loadTrips = async () => {
    try {
      const allTrips = await getTrips();
      setTrips(allTrips);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initializeDatabase = async () => {
      setIsSeeding(true);
      await seedInitialData();
      await loadTrips();
      setIsSeeding(false);
    };
    initializeDatabase();
  }, []);

  return (
    <div
      className="min-h-screen font-sans flex flex-col justify-between transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
    >
      {/* Botswana Flag-inspired accent line */}
      <div className="w-full h-1.5 flex">
        <div className="flex-1" style={{ backgroundColor: 'var(--flag-stripe)' }} title="Sky Blue (Rain / Pula)" />
        <div className="w-4" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="w-12" style={{ backgroundColor: 'var(--flag-center)' }} />
        <div className="w-4" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="flex-1" style={{ backgroundColor: 'var(--flag-stripe)' }} title="Sky Blue (Rain / Pula)" />
      </div>

      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header
          className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 flex items-center justify-center shadow-lg transition-all duration-300"
              style={{
                backgroundColor: 'var(--text-primary)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <Bus className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Botswana Bus Booking
                </h1>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider font-mono"
                  style={{
                    backgroundColor: 'var(--accent-bg)',
                    color: 'var(--accent-text)',
                    borderRadius: '0.25rem',
                  }}
                >
                  PULA
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Online Transit &amp; Seat Reservation Engine
              </p>
            </div>
          </div>

          {/* Right side: Mode switcher + Settings button */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div
              className="flex p-1"
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'calc(var(--radius) + 2px)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setRole('passenger')}
                className="px-4 py-2 text-xs font-bold transition-all duration-300 flex items-center gap-2"
                style={{
                  backgroundColor: role === 'passenger' ? 'var(--tab-active-bg)' : 'transparent',
                  color: role === 'passenger' ? 'var(--tab-active-txt)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius)',
                  boxShadow: role === 'passenger' ? 'var(--shadow)' : 'none',
                }}
              >
                <Users className="w-4 h-4" />
                Book Ticket
              </button>
              <button
                onClick={() => setRole('operator')}
                className="px-4 py-2 text-xs font-bold transition-all duration-300 flex items-center gap-2"
                style={{
                  backgroundColor: role === 'operator' ? 'var(--tab-active-bg)' : 'transparent',
                  color: role === 'operator' ? 'var(--tab-active-txt)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius)',
                  boxShadow: role === 'operator' ? 'var(--shadow)' : 'none',
                }}
              >
                <Settings className="w-4 h-4" />
                Operator Portal
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              title="Settings"
              className="w-10 h-10 flex items-center justify-center transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Loading state */}
        {isSeeding ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
            <span
              className="w-8 h-8 border-4 rounded-full animate-spin mb-4"
              style={{ borderColor: 'var(--bg-muted)', borderTopColor: 'var(--accent)' }}
            />
            <p className="text-xs font-medium">Synchronizing Botswana Transit Database...</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Downloading Seabelo, AT&amp;T, and Tsela-Kaye operators
            </p>
          </div>
        ) : (
          <main className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {role === 'passenger' ? (
                <motion.div
                  key="passenger"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <PassengerPortal trips={trips} onRefreshTrips={loadTrips} />
                </motion.div>
              ) : (
                <motion.div
                  key="operator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <OperatorPortal onRefreshData={loadTrips} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer
        className="py-6 mt-12"
        style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}
      >
        <div
          className="max-w-5xl w-full mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          <div className="flex items-center gap-1.5">
            <span>Powered by Botswana Mobile Money Services</span>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" title="Orange Money" />
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" title="MyZaka" />
            <div className="w-1.5 h-1.5 bg-teal-600 rounded-full" title="Smega" />
          </div>
          <div className="flex items-center gap-1">
            <span>Pula ya sarasara &bull; Made for Botswana Transit</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 ml-1" />
          </div>
        </div>
      </footer>

      {/* Settings Panel (slide-in from right) */}
      <SettingsPanel />
    </div>
  );
}
