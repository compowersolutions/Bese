/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  addDoc,
  orderBy
} from 'firebase/firestore';
import { Operator, Bus, Trip, Booking } from '../types';
import { initialOperators, initialBuses, generateTrips } from '../data/mockData';

// Collection references
const OPERATORS_COL = 'operators';
const BUSES_COL = 'buses';
const TRIPS_COL = 'trips';
const BOOKINGS_COL = 'bookings';

// Seeds initial data if the database collections are empty
export async function seedInitialData() {
  try {
    const opSnap = await getDocs(collection(db, OPERATORS_COL));
    if (opSnap.empty) {
      console.log('Seeding operators to Firestore...');
      for (const op of initialOperators) {
        await setDoc(doc(db, OPERATORS_COL, op.id), op);
      }
    }

    const busSnap = await getDocs(collection(db, BUSES_COL));
    if (busSnap.empty) {
      console.log('Seeding buses to Firestore...');
      for (const bus of initialBuses) {
        await setDoc(doc(db, BUSES_COL, bus.id), bus);
      }
    }

    const tripSnap = await getDocs(collection(db, TRIPS_COL));
    if (tripSnap.empty) {
      console.log('Seeding trips to Firestore...');
      const trips = generateTrips();
      for (const trip of trips) {
        await setDoc(doc(db, TRIPS_COL, trip.id), trip);
      }
    }
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
  }
}

// Operators Services
export async function getOperators(): Promise<Operator[]> {
  try {
    const snap = await getDocs(collection(db, OPERATORS_COL));
    const list: Operator[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Operator);
    });
    return list;
  } catch (err) {
    console.error('Error fetching operators:', err);
    return initialOperators; // Fallback to local
  }
}

export async function addOperator(op: Operator): Promise<void> {
  await setDoc(doc(db, OPERATORS_COL, op.id), op);
}

// Buses Services
export async function getBuses(): Promise<Bus[]> {
  try {
    const snap = await getDocs(collection(db, BUSES_COL));
    const list: Bus[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Bus);
    });
    return list;
  } catch (err) {
    console.error('Error fetching buses:', err);
    return initialBuses; // Fallback to local
  }
}

export async function addBus(bus: Bus): Promise<void> {
  await setDoc(doc(db, BUSES_COL, bus.id), bus);
}

// Trips Services
export async function getTrips(): Promise<Trip[]> {
  try {
    const snap = await getDocs(collection(db, TRIPS_COL));
    const list: Trip[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Trip);
    });
    return list;
  } catch (err) {
    console.error('Error fetching trips:', err);
    return generateTrips(); // Fallback to local
  }
}

export async function addTrip(trip: Trip): Promise<void> {
  await setDoc(doc(db, TRIPS_COL, trip.id), trip);
}

export async function updateTripBookedSeats(tripId: string, bookedSeats: string[]): Promise<void> {
  const docRef = doc(db, TRIPS_COL, tripId);
  await updateDoc(docRef, {
    bookedSeats: bookedSeats,
    availableSeats: 49 - bookedSeats.length // Dynamic fallback or precise mapping in component
  });
}

// Bookings Services
export async function getBookings(): Promise<Booking[]> {
  try {
    const snap = await getDocs(collection(db, BOOKINGS_COL));
    const list: Booking[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Booking);
    });
    // Sort by newest first
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

export async function createBooking(booking: Booking): Promise<void> {
  await setDoc(doc(db, BOOKINGS_COL, booking.id), booking);
}
