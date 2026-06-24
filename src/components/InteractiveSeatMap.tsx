/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Seat, BusLayoutType } from '../types';
import { Armchair, Compass } from 'lucide-react';

interface InteractiveSeatMapProps {
  seats: Seat[];
  rows: number;
  cols: number;
  layoutType: BusLayoutType;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
}

export default function InteractiveSeatMap({
  seats,
  rows,
  cols,
  layoutType,
  bookedSeats,
  selectedSeats,
  onSeatToggle
}: InteractiveSeatMapProps) {
  // Let's create an elegant grid representation
  // We will map the list of seats to a grid coordinate array
  const grid: (Seat | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  seats.forEach((seat) => {
    if (seat.row < rows && seat.col < cols) {
      grid[seat.row][seat.col] = seat;
    }
  });

  const getLayoutLabel = (type: BusLayoutType) => {
    switch (type) {
      case 'quantum': return '15-Seater Minibus (Quantum)';
      case 'coaster': return '22-Seater Midibus (Coaster)';
      case 'coach_standard': return '65-Seater Standard Coach';
      case 'coach_luxury': return '49-Seater Luxury Liner';
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
      <div className="text-center mb-4">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-sans">
          Bus Layout
        </span>
        <h4 className="text-sm font-semibold text-slate-700 mt-1">
          {getLayoutLabel(layoutType)}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">
          Driving on Left (Driver is on the Right)
        </p>
      </div>

      {/* Front of bus indicator */}
      <div className="w-full max-w-[340px] flex items-center justify-between px-6 py-2 border-b border-dashed border-slate-200 text-slate-400 text-xs font-medium font-mono mb-6">
        <span>[ REAR OF BUS ]</span>
        <div className="w-8 h-px bg-slate-200"></div>
        <span>[ FRONT OF BUS ]</span>
      </div>

      {/* Bus Grid Body */}
      <div className="relative bg-white border border-slate-100 rounded-3xl shadow-xl p-5 w-full max-w-[340px] flex flex-col gap-3">
        {/* Steering Wheel Area (Top / Front is Right side in Botswana LHD) */}
        <div className="flex justify-between items-center px-2 pb-2 mb-2 border-b border-slate-100 text-[10px] text-slate-400 font-mono">
          <span>LEFT WINDOW</span>
          <span>RIGHT WINDOW</span>
        </div>

        {/* Rows wrapper - we render rows top-to-bottom but visual orientation is usually front-to-back */}
        <div className="flex flex-col gap-3">
          {grid.map((rowSeats, rowIndex) => (
            <div key={rowIndex} className="flex justify-between items-center gap-1.5 h-10">
              {rowSeats.map((seat, colIndex) => {
                if (!seat) {
                  // Empty space/aisle block
                  return <div key={`empty-${rowIndex}-${colIndex}`} className="flex-1" />;
                }

                if (seat.type === 'aisle') {
                  return (
                    <div 
                      key={seat.id} 
                      className="flex-1 flex items-center justify-center text-[9px] font-mono font-medium text-slate-300 tracking-wider"
                    >
                      AISLE
                    </div>
                  );
                }

                if (seat.type === 'space') {
                  return <div key={seat.id} className="flex-1" />;
                }

                if (seat.type === 'driver') {
                  return (
                    <div 
                      key={seat.id} 
                      className="flex-1 h-full flex flex-col items-center justify-center bg-amber-50 border border-amber-100 rounded-xl text-amber-700 select-none cursor-not-allowed"
                      title="Driver Seat"
                    >
                      <Compass className="w-4 h-4 animate-spin-slow text-amber-500" />
                      <span className="text-[8px] font-bold font-mono mt-0.5">DRV</span>
                    </div>
                  );
                }

                // Passenger seats
                const isBooked = bookedSeats.includes(seat.id);
                const isSelected = selectedSeats.includes(seat.id);

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => onSeatToggle(seat.id)}
                    className={`flex-1 h-full flex flex-col items-center justify-center rounded-xl transition-all duration-200 relative group
                      ${isBooked 
                        ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-sky-500 text-white border border-sky-600 shadow-md shadow-sky-100 scale-105'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 hover:scale-102 active:scale-95'
                      }
                    `}
                  >
                    <Armchair className={`w-4 h-4 ${isBooked ? 'text-slate-300' : isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-[9px] font-mono font-bold tracking-tight mt-0.5">
                      {seat.label}
                    </span>

                    {/* Window label dot */}
                    {seat.isWindow && !isBooked && !isSelected && (
                      <span className="absolute top-1 right-1 w-1 h-1 bg-slate-300 rounded-full" title="Window seat" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-slate-600 font-sans">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md border border-slate-200 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md border border-sky-600 bg-sky-500" />
          <span className="font-semibold text-slate-800">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md border border-slate-200 bg-slate-100" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md border border-amber-100 bg-amber-50 flex items-center justify-center">
            <Compass className="w-3 h-3 text-amber-500" />
          </div>
          <span>Driver</span>
        </div>
      </div>
    </div>
  );
}
