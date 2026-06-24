/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bus, Operator, Trip, Route, BusLayoutType, Seat } from '../types';

// Helper to generate a realistic seat layout
export function generateSeatLayout(layoutType: BusLayoutType): { seats: Seat[]; rows: number; cols: number } {
  const seats: Seat[] = [];
  let rows = 0;
  let cols = 0;

  switch (layoutType) {
    case 'quantum': {
      // 15-seater mini-bus, 3 columns: Left (0), Middle/Aisle (1), Right (2)
      // Driving is Left-Hand Traffic (UK standard) -> Driver is on Right (col 2), entrance is on Left
      rows = 5;
      cols = 3;
      
      // Row 0 (Front)
      seats.push({ id: '1A', row: 0, col: 0, type: 'passenger', isWindow: true, label: '1A' });
      seats.push({ id: '1B', row: 0, col: 1, type: 'passenger', isWindow: false, label: '1B' });
      seats.push({ id: 'DRV', row: 0, col: 2, type: 'driver', isWindow: true, label: 'Driver' });

      // Row 1
      seats.push({ id: '2A', row: 1, col: 0, type: 'passenger', isWindow: true, label: '2A' });
      seats.push({ id: 'AISLE_1', row: 1, col: 1, type: 'aisle', isWindow: false, label: '' });
      seats.push({ id: '2C', row: 1, col: 2, type: 'passenger', isWindow: true, label: '2C' });

      // Row 2
      seats.push({ id: '3A', row: 2, col: 0, type: 'passenger', isWindow: true, label: '3A' });
      seats.push({ id: '3B', row: 2, col: 1, type: 'passenger', isWindow: false, label: '3B' });
      seats.push({ id: '3C', row: 2, col: 2, type: 'passenger', isWindow: true, label: '3C' });

      // Row 3
      seats.push({ id: '4A', row: 3, col: 0, type: 'passenger', isWindow: true, label: '4A' });
      seats.push({ id: '4B', row: 3, col: 1, type: 'passenger', isWindow: false, label: '4B' });
      seats.push({ id: '4C', row: 3, col: 2, type: 'passenger', isWindow: true, label: '4C' });

      // Row 4 (Back Row)
      seats.push({ id: '5A', row: 4, col: 0, type: 'passenger', isWindow: true, label: '5A' });
      seats.push({ id: '5B', row: 4, col: 1, type: 'passenger', isWindow: false, label: '5B' });
      seats.push({ id: '5C', row: 4, col: 2, type: 'passenger', isWindow: true, label: '5C' });
      break;
    }

    case 'coaster': {
      // 22-seater Coaster. 3 columns: Left window/aisle (0), Aisle (1), Right double (2, 3)
      rows = 7;
      cols = 4;

      // Row 0 (Front)
      seats.push({ id: '1A', row: 0, col: 0, type: 'passenger', isWindow: true, label: '1A' });
      seats.push({ id: 'AISLE_0', row: 0, col: 1, type: 'aisle', isWindow: false, label: '' });
      seats.push({ id: '1B', row: 0, col: 2, type: 'passenger', isWindow: false, label: '1B' });
      seats.push({ id: 'DRV', row: 0, col: 3, type: 'driver', isWindow: true, label: 'Driver' });

      for (let r = 1; r < 6; r++) {
        // Left column
        seats.push({ id: `${r + 1}A`, row: r, col: 0, type: 'passenger', isWindow: true, label: `${r + 1}A` });
        // Aisle
        seats.push({ id: `AISLE_${r}`, row: r, col: 1, type: 'aisle', isWindow: false, label: '' });
        // Right columns (Double seats)
        seats.push({ id: `${r + 1}B`, row: r, col: 2, type: 'passenger', isWindow: false, label: `${r + 1}B` });
        seats.push({ id: `${r + 1}C`, row: r, col: 3, type: 'passenger', isWindow: true, label: `${r + 1}C` });
      }

      // Back Row 6 (4 seats across)
      seats.push({ id: '7A', row: 6, col: 0, type: 'passenger', isWindow: true, label: '7A' });
      seats.push({ id: '7B', row: 6, col: 1, type: 'passenger', isWindow: false, label: '7B' });
      seats.push({ id: '7C', row: 6, col: 2, type: 'passenger', isWindow: false, label: '7C' });
      seats.push({ id: '7D', row: 6, col: 3, type: 'passenger', isWindow: true, label: '7D' });
      break;
    }

    case 'coach_standard':
    case 'coach_luxury': {
      // Standard/Luxury coaches: 2x2 layout, 12 rows. 5 columns: L Window (0), L Aisle (1), Aisle Space (2), R Aisle (3), R Window (4)
      rows = 12;
      cols = 5;

      // Row 0 (Front)
      seats.push({ id: '1A', row: 0, col: 0, type: 'passenger', isWindow: true, label: '1A' });
      seats.push({ id: '1B', row: 0, col: 1, type: 'passenger', isWindow: false, label: '1B' });
      seats.push({ id: 'AISLE_0', row: 0, col: 2, type: 'aisle', isWindow: false, label: '' });
      seats.push({ id: 'DRV_M', row: 0, col: 3, type: 'space', isWindow: false, label: '' });
      seats.push({ id: 'DRV', row: 0, col: 4, type: 'driver', isWindow: true, label: 'Driver' });

      for (let r = 1; r < 11; r++) {
        // Left side
        seats.push({ id: `${r + 1}A`, row: r, col: 0, type: 'passenger', isWindow: true, label: `${r + 1}A` });
        seats.push({ id: `${r + 1}B`, row: r, col: 1, type: 'passenger', isWindow: false, label: `${r + 1}B` });
        // Aisle
        seats.push({ id: `AISLE_${r}`, row: r, col: 2, type: 'aisle', isWindow: false, label: '' });
        // Right side
        seats.push({ id: `${r + 1}C`, row: r, col: 3, type: 'passenger', isWindow: false, label: `${r + 1}C` });
        seats.push({ id: `${r + 1}D`, row: r, col: 4, type: 'passenger', isWindow: true, label: `${r + 1}D` });
      }

      // Back row 11 (5 seats across)
      seats.push({ id: '12A', row: 11, col: 0, type: 'passenger', isWindow: true, label: '12A' });
      seats.push({ id: '12B', row: 11, col: 1, type: 'passenger', isWindow: false, label: '12B' });
      seats.push({ id: '12C', row: 11, col: 2, type: 'passenger', isWindow: false, label: '12C' });
      seats.push({ id: '12D', row: 11, col: 3, type: 'passenger', isWindow: false, label: '12D' });
      seats.push({ id: '12E', row: 11, col: 4, type: 'passenger', isWindow: true, label: '12E' });
      break;
    }
  }

  return { seats, rows, cols };
}

// Initial Bus Operators in Botswana
export const initialOperators: Operator[] = [
  {
    id: 'op_seabelo',
    name: 'Seabelo Express',
    contactPerson: 'Kabo Seabelo',
    phone: '+267 395 1011',
    email: 'info@seabeloexpress.co.bw',
    isSubscribed: true,
    subscribedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    logoColor: '#0056B3', // Royal Blue
    hqLocation: 'Gaborone Broadhurst Industrial'
  },
  {
    id: 'op_monnakgotla',
    name: 'AT & T Monnakgotla',
    contactPerson: 'Thabo Monnakgotla',
    phone: '+267 393 3223',
    email: 'bookings@attmonnakgotla.co.bw',
    isSubscribed: true,
    subscribedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    logoColor: '#DC3545', // Deep Red
    hqLocation: 'Gaborone West Phase 1'
  },
  {
    id: 'op_mahalapye_express',
    name: 'Tsela-Kaye Coaches',
    contactPerson: 'Mpho Moipone',
    phone: '+267 471 1122',
    email: 'tselakaye@info.bw',
    isSubscribed: true,
    subscribedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    logoColor: '#198754', // Green
    hqLocation: 'Mahalapye'
  }
];

// Initial Buses configured for operators
export const initialBuses: Bus[] = [
  {
    id: 'bus_sea_01',
    operatorId: 'op_seabelo',
    operatorName: 'Seabelo Express',
    regNo: 'B 110 ABY',
    model: 'Scania Marcopolo G7',
    capacity: 49,
    layoutType: 'coach_luxury',
    facilities: {
      hasWifi: true,
      hasAc: true,
      hasCharging: true,
      hasToilet: true,
      hasTv: true
    },
    ...generateSeatLayout('coach_luxury')
  },
  {
    id: 'bus_sea_02',
    operatorId: 'op_seabelo',
    operatorName: 'Seabelo Express',
    regNo: 'B 302 ADC',
    model: 'Volvo Irizar i6',
    capacity: 49,
    layoutType: 'coach_standard',
    facilities: {
      hasWifi: false,
      hasAc: true,
      hasCharging: true,
      hasToilet: false,
      hasTv: true
    },
    ...generateSeatLayout('coach_standard')
  },
  {
    id: 'bus_mon_01',
    operatorId: 'op_monnakgotla',
    operatorName: 'AT & T Monnakgotla',
    regNo: 'B 482 ATT',
    model: 'Scania Touring HD',
    capacity: 49,
    layoutType: 'coach_luxury',
    facilities: {
      hasWifi: true,
      hasAc: true,
      hasCharging: true,
      hasToilet: true,
      hasTv: true
    },
    ...generateSeatLayout('coach_luxury')
  },
  {
    id: 'bus_mon_02',
    operatorId: 'op_monnakgotla',
    operatorName: 'AT & T Monnakgotla',
    regNo: 'B 920 ATK',
    model: 'Toyota Coaster',
    capacity: 21,
    layoutType: 'coaster',
    facilities: {
      hasWifi: false,
      hasAc: true,
      hasCharging: false,
      hasToilet: false,
      hasTv: false
    },
    ...generateSeatLayout('coaster')
  },
  {
    id: 'bus_tk_01',
    operatorId: 'op_mahalapye_express',
    operatorName: 'Tsela-Kaye Coaches',
    regNo: 'B 777 TSL',
    model: 'Toyota Quantum',
    capacity: 14,
    layoutType: 'quantum',
    facilities: {
      hasWifi: false,
      hasAc: true,
      hasCharging: true,
      hasToilet: false,
      hasTv: false
    },
    ...generateSeatLayout('quantum')
  }
];

// Routes inside Botswana
export const initialRoutes: Route[] = [
  { id: 'r_gab_ft', start: 'Gaborone', end: 'Francistown', distanceKm: 430, durationHours: 5.5 },
  { id: 'r_gab_maun', start: 'Gaborone', end: 'Maun', distanceKm: 850, durationHours: 10 },
  { id: 'r_gab_lob', start: 'Gaborone', end: 'Lobatse', distanceKm: 75, durationHours: 1 },
  { id: 'r_ft_kasane', start: 'Francistown', end: 'Kasane', distanceKm: 490, durationHours: 6 },
  { id: 'r_gab_palapye', start: 'Gaborone', end: 'Palapye', distanceKm: 270, durationHours: 3.5 },
  { id: 'r_maun_shak', start: 'Maun', end: 'Shakawe', distanceKm: 370, durationHours: 5 }
];

// Tripping (Schedules for upcoming days)
export function generateTrips(): Trip[] {
  const trips: Trip[] = [];
  const routesMap: Record<string, Route> = {};
  initialRoutes.forEach(r => { routesMap[r.id] = r; });

  const busMap: Record<string, Bus> = {};
  initialBuses.forEach(b => { busMap[b.id] = b; });

  const now = new Date();
  
  // We'll generate trips for today, tomorrow, and the next 5 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Gaborone <-> Francistown (Seabelo Luxury & AT&T)
    trips.push({
      id: `trip_sea_01_${dateStr}`,
      busId: 'bus_sea_01',
      operatorId: 'op_seabelo',
      operatorName: 'Seabelo Express',
      routeId: 'r_gab_ft',
      start: 'Gaborone',
      end: 'Francistown',
      departureTime: `${dateStr} 06:00`,
      arrivalTime: `${dateStr} 11:30`,
      priceBWP: 180,
      availableSeats: 49,
      bookedSeats: ['2A', '2B', '5C', '6A'],
      regNo: 'B 110 ABY',
      facilities: busMap['bus_sea_01'].facilities,
      layoutType: 'coach_luxury'
    });

    trips.push({
      id: `trip_sea_02_${dateStr}`,
      busId: 'bus_sea_02',
      operatorId: 'op_seabelo',
      operatorName: 'Seabelo Express',
      routeId: 'r_gab_ft',
      start: 'Francistown',
      end: 'Gaborone',
      departureTime: `${dateStr} 13:00`,
      arrivalTime: `${dateStr} 18:30`,
      priceBWP: 160,
      availableSeats: 49,
      bookedSeats: ['3C', '3D', '10A'],
      regNo: 'B 302 ADC',
      facilities: busMap['bus_sea_02'].facilities,
      layoutType: 'coach_standard'
    });

    trips.push({
      id: `trip_mon_01_${dateStr}`,
      busId: 'bus_mon_01',
      operatorId: 'op_monnakgotla',
      operatorName: 'AT & T Monnakgotla',
      routeId: 'r_gab_maun',
      start: 'Gaborone',
      end: 'Maun',
      departureTime: `${dateStr} 07:30`,
      arrivalTime: `${dateStr} 17:30`,
      priceBWP: 280,
      availableSeats: 49,
      bookedSeats: ['4A', '4B', '7C', '8D', '11A', '11B'],
      regNo: 'B 482 ATT',
      facilities: busMap['bus_mon_01'].facilities,
      layoutType: 'coach_luxury'
    });

    // Short commute Gaborone to Lobatse (Coaster / Quantum)
    trips.push({
      id: `trip_mon_02_${dateStr}`,
      busId: 'bus_mon_02',
      operatorId: 'op_monnakgotla',
      operatorName: 'AT & T Monnakgotla',
      routeId: 'r_gab_lob',
      start: 'Gaborone',
      end: 'Lobatse',
      departureTime: `${dateStr} 09:00`,
      arrivalTime: `${dateStr} 10:00`,
      priceBWP: 45,
      availableSeats: 21,
      bookedSeats: ['2A', '3B'],
      regNo: 'B 920 ATK',
      facilities: busMap['bus_mon_02'].facilities,
      layoutType: 'coaster'
    });

    trips.push({
      id: `trip_tk_01_${dateStr}`,
      busId: 'bus_tk_01',
      operatorId: 'op_mahalapye_express',
      operatorName: 'Tsela-Kaye Coaches',
      routeId: 'r_gab_palapye',
      start: 'Gaborone',
      end: 'Palapye',
      departureTime: `${dateStr} 14:00`,
      arrivalTime: `${dateStr} 17:30`,
      priceBWP: 95,
      availableSeats: 14,
      bookedSeats: ['2A', '3A'],
      regNo: 'B 777 TSL',
      facilities: busMap['bus_tk_01'].facilities,
      layoutType: 'quantum'
    });
  }

  return trips;
}
