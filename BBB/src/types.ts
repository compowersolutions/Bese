/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BusLayoutType = 'quantum' | 'coaster' | 'coach_standard' | 'coach_luxury';

export interface BusFacilities {
  hasWifi: boolean;
  hasAc: boolean;
  hasCharging: boolean;
  hasToilet: boolean;
  hasTv: boolean;
}

export interface Seat {
  id: string; // e.g. "1A", "12C"
  row: number;
  col: number;
  type: 'passenger' | 'driver' | 'aisle' | 'space'; // aisle is walk space, space is empty/luggage
  isWindow: boolean;
  label: string;
}

export interface Bus {
  id: string;
  operatorId: string;
  operatorName: string;
  regNo: string; // e.g. B 482 AJD
  model: string; // e.g. "Scania Marcopolo", "Toyota Coaster", "Toyota Quantum"
  capacity: number;
  layoutType: BusLayoutType;
  facilities: BusFacilities;
  rows: number;
  cols: number;
  seats: Seat[]; // Flattened seats list
}

export interface Route {
  id: string;
  start: string; // e.g. "Gaborone"
  end: string; // e.g. "Francistown"
  distanceKm: number;
  durationHours: number;
}

export interface Trip {
  id: string;
  busId: string;
  operatorId: string;
  operatorName: string;
  routeId: string;
  start: string;
  end: string;
  departureTime: string; // "YYYY-MM-DD HH:MM"
  arrivalTime: string;
  priceBWP: number;
  availableSeats: number;
  bookedSeats: string[]; // List of seat IDs already booked
  regNo: string;
  facilities: BusFacilities;
  layoutType: BusLayoutType;
}

export type MobileMoneyProvider = 'orange_money' | 'myzaka' | 'smega';

export interface Booking {
  id: string;
  tripId: string;
  operatorName: string;
  regNo: string;
  start: string;
  end: string;
  departureTime: string;
  selectedSeats: string[];
  totalAmountBWP: number;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  paymentProvider: MobileMoneyProvider;
  paymentPhone: string;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
  paymentReference: string;
  createdAt: number;
}

export interface Operator {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  isSubscribed: boolean;
  subscribedAt: number;
  logoColor: string; // Hex or tailwind class for personalized branding
  hqLocation: string;
}
