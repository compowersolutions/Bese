/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { seedInitialData, getTrips } from './lib/dbService';
import { Trip } from './types';
import PassengerPortal from './components/PassengerPortal';
import OperatorPortal from './components/OperatorPortal';
import { Bus, Settings, Users, Compass, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [role, setRole] = useState<'passenger' | 'operator'>('passenger');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isSeeding, setIsSeeding] = useState(true);

  // Initialize and load trips
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
      await seedInitialData(); // Pre-populate Botswana operators, routes, and buses
      await loadTrips();
      setIsSeeding(false);
    };

    initializeDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-sky-100 flex flex-col justify-between">
      {/* Botswana Flag-inspired accent line */}
      <div className="w-full h-1.5 flex">
        <div className="flex-1 bg-[#75AADB]" title="Sky Blue (Rain / Pula)" />
        <div className="w-4 bg-white" />
        <div className="w-12 bg-black" />
        <div className="w-4 bg-white" />
        <div className="flex-1 bg-[#75AADB]" title="Sky Blue (Rain / Pula)" />
      </div>

      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Sleek Minimalist Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-950/10">
              <Bus className="w-6 h-6 text-[#75AADB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Botswana Bus Booking</h1>
                <span className="bg-[#75AADB]/10 text-[#4287B9] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                  PULA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Online Transit & Seat Reservation Engine</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setRole('passenger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2
                ${role === 'passenger'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              <Users className="w-4 h-4" />
              Book Ticket
            </button>
            <button
              onClick={() => setRole('operator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2
                ${role === 'operator'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              <Settings className="w-4 h-4" />
              Operator Portal
            </button>
          </div>
        </header>

        {/* Database initial seed loader */}
        {isSeeding ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-sans">
            <span className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mb-4" />
            <p className="text-xs font-medium">Synchronizing Botswana Transit Database...</p>
            <p className="text-[10px] text-slate-400/80 mt-1">Downloading Seabelo, AT&T, and Tsela-Kaye operators</p>
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

      {/* Humble Minimalist Footer */}
      <footer className="border-t border-slate-100 py-6 mt-12 bg-white">
        <div className="max-w-5xl w-full mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-sans">
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
    </div>
  );
}
