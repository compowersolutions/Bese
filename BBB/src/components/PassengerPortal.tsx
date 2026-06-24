/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Booking, MobileMoneyProvider } from '../types';
import { getTrips, createBooking, updateTripBookedSeats } from '../lib/dbService';
import { generateSeatLayout } from '../data/mockData';
import InteractiveSeatMap from './InteractiveSeatMap';
import QrCodeSvg from './QrCodeSvg';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Wifi, 
  Wind, 
  Tv, 
  Zap, 
  Smile,
  ShieldCheck,
  CreditCard,
  Ticket,
  ChevronRight,
  Info,
  Phone,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Common Botswana Hubs
const BOTSWANA_HUBS = [
  'Gaborone',
  'Francistown',
  'Maun',
  'Lobatse',
  'Palapye',
  'Kasane',
  'Serowe',
  'Mahalapye',
  'Shakawe'
];

interface PassengerPortalProps {
  trips: Trip[];
  onRefreshTrips: () => void;
}

export default function PassengerPortal({ trips, onRefreshTrips }: PassengerPortalProps) {
  // Search State
  const [from, setFrom] = useState('Gaborone');
  const [to, setTo] = useState('Francistown');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [searched, setSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Trip[]>([]);

  // Selected Trip State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingStep, setBookingStep] = useState<'search' | 'seats' | 'payment' | 'ticket'>('search');

  // Passenger Info
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');

  // Payment State
  const [paymentProvider, setPaymentProvider] = useState<MobileMoneyProvider>('orange_money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'ussd_push' | 'success'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [recentBooking, setRecentBooking] = useState<Booking | null>(null);

  // My Tickets List State
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [showMyTickets, setShowMyTickets] = useState(false);

  // Load user bookings from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('bw_bus_bookings');
    if (stored) {
      try {
        setMyBookings(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Filter searches
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = trips.filter(trip => {
      const startMatches = trip.start.toLowerCase() === from.toLowerCase();
      const endMatches = trip.end.toLowerCase() === to.toLowerCase();
      const dateMatches = trip.departureTime.startsWith(date);
      return startMatches && endMatches && dateMatches;
    });
    setSearchResults(filtered);
    setSearched(true);
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setBookingStep('seats');
  };

  const handleSeatToggle = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Basic mobile money prefix check
  const getProviderPlaceholder = (provider: MobileMoneyProvider) => {
    switch (provider) {
      case 'orange_money': return 'Orange (e.g. 72XXXXXX / 73XXXXXX)';
      case 'myzaka': return 'Mascom (e.g. 71XXXXXX / 74XXXXXX)';
      case 'smega': return 'BTC (e.g. 70XXXXXX / 79XXXXXX)';
    }
  };

  const validatePaymentPhone = (phone: string, provider: MobileMoneyProvider): boolean => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length !== 8) return false;
    
    const prefix2 = cleaned.substring(0, 2);
    if (provider === 'orange_money') {
      return ['72', '73', '78'].includes(prefix2);
    } else if (provider === 'myzaka') {
      return ['71', '74', '75', '76', '77'].includes(prefix2);
    } else if (provider === 'smega') {
      return ['70', '79'].includes(prefix2);
    }
    return false;
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !passengerPhone || !passengerEmail) {
      alert('Please fill in passenger details.');
      return;
    }
    if (!validatePaymentPhone(paymentPhone, paymentProvider)) {
      alert(`Invalid number for selected mobile money. ${getProviderPlaceholder(paymentProvider)}`);
      return;
    }
    setPaymentStep('ussd_push');
  };

  const handleConfirmUssdPayment = async () => {
    if (!simulatedPin || simulatedPin.length < 4) {
      alert('Please enter your 4-digit Mobile Money PIN to authorize.');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate Network push
    setTimeout(async () => {
      if (!selectedTrip) return;

      const newBookingId = 'BW-' + Math.floor(100000 + Math.random() * 900000);
      const reference = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const booking: Booking = {
        id: newBookingId,
        tripId: selectedTrip.id,
        operatorName: selectedTrip.operatorName,
        regNo: selectedTrip.regNo,
        start: selectedTrip.start,
        end: selectedTrip.end,
        departureTime: selectedTrip.departureTime,
        selectedSeats: selectedSeats,
        totalAmountBWP: selectedTrip.priceBWP * selectedSeats.length,
        passengerName,
        passengerPhone,
        passengerEmail,
        paymentProvider,
        paymentPhone,
        paymentStatus: 'paid',
        paymentReference: reference,
        createdAt: Date.now()
      };

      try {
        // Save to Firebase Firestore!
        await createBooking(booking);

        // Update booked seats on the trip
        const updatedBooked = [...selectedTrip.bookedSeats, ...selectedSeats];
        await updateTripBookedSeats(selectedTrip.id, updatedBooked);

        // Save locally to show "My Bookings"
        const updatedLocal = [booking, ...myBookings];
        setMyBookings(updatedLocal);
        localStorage.setItem('bw_bus_bookings', JSON.stringify(updatedLocal));

        setRecentBooking(booking);
        setPaymentStep('success');
        setBookingStep('ticket');
        onRefreshTrips(); // Pull latest occupied seat state
      } catch (err) {
        console.error('Booking failed:', err);
        alert('Booking failed to sync. Local ticket generated.');
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2500);
  };

  return (
    <div className="w-full">
      {/* Sleek Sub-Header Navigation */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Passenger Booking</h2>
          <p className="text-xs text-slate-500">Secure ticket reservations throughout Botswana</p>
        </div>
        <button
          onClick={() => setShowMyTickets(!showMyTickets)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all duration-200
            ${showMyTickets 
              ? 'bg-sky-50 text-sky-600 border-sky-100' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }
          `}
        >
          <Ticket className="w-4 h-4" />
          {showMyTickets ? 'Back to Booking' : `My Tickets (${myBookings.length})`}
        </button>
      </div>

      {/* Conditionally show My Tickets or Main Booking Engine */}
      {showMyTickets ? (
        <div className="space-y-6">
          <h3 className="text-md font-bold text-slate-700">Your Reserved Tickets</h3>
          {myBookings.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Ticket className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">No tickets found</p>
              <p className="text-xs text-slate-400 mt-1">Book your first trip to Francistown, Maun, or Kasane!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBookings.map((b) => (
                <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-10 opacity-30" />
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          {b.operatorName}
                        </span>
                        <h4 className="text-xs font-mono text-slate-400 mt-1">Reg: {b.regNo}</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">
                        PAID
                      </span>
                    </div>

                    <div className="flex items-center gap-3 my-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{b.start}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{b.end}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Departure</span>
                        <span className="font-semibold text-slate-700">{b.departureTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Seats Reserved</span>
                        <span className="font-semibold text-slate-700">{b.selectedSeats.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Passenger</span>
                        <span className="text-xs font-semibold text-slate-700">{b.passengerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Fare</span>
                        <span className="text-xs font-bold text-slate-800">BWP {b.totalAmountBWP}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center border-t border-dashed border-slate-200 pt-4">
                    <QrCodeSvg value={b.paymentReference} size={90} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* STEP 1: Route Search & List Results */}
          {bookingStep === 'search' && (
            <div className="space-y-6">
              {/* Clean minimalist search bar */}
              <form onSubmit={handleSearch} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" /> From
                  </label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {BOTSWANA_HUBS.map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> To
                  </label>
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {BOTSWANA_HUBS.filter(h => h !== from).map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Travel Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  Find Buses
                </button>
              </form>

              {/* Search results */}
              <div>
                {searched && (
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700">
                      Available Schedules ({searchResults.length})
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {from} to {to} &bull; {date}
                    </span>
                  </div>
                )}

                {searched && searchResults.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                    <p className="text-sm text-slate-600 font-medium">No trips scheduled for this date</p>
                    <p className="text-xs text-slate-400 mt-1">Try scheduling a different route or check Operator Portal for setup.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(searched ? searchResults : trips).map((trip) => (
                      <div
                        key={trip.id}
                        className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row justify-between gap-6"
                      >
                        {/* Operator & Time Column */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: '#0ea5e9' }}>
                              {trip.operatorName}
                            </span>
                            <span className="text-xs font-mono text-slate-400">Reg: {trip.regNo}</span>
                          </div>

                          <div className="flex items-center gap-4 mt-4">
                            <div>
                              <span className="text-xs font-mono text-slate-400 block">Departure</span>
                              <span className="text-lg font-extrabold text-slate-800">
                                {trip.departureTime.split(' ')[1]}
                              </span>
                            </div>
                            <div className="flex flex-col items-center flex-1 max-w-[80px]">
                              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">Direct</span>
                              <div className="w-full h-px bg-slate-200 my-1 relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full" />
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono">Route Trip</span>
                            </div>
                            <div>
                              <span className="text-xs font-mono text-slate-400 block">Arrival</span>
                              <span className="text-lg font-extrabold text-slate-800">
                                {trip.arrivalTime.split(' ')[1]}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mid Section: Routes & Facilities */}
                        <div className="flex-1 flex flex-col justify-between md:border-l md:border-r border-slate-100 md:px-6">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Route</span>
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                              {trip.start} <ArrowRight className="w-3.5 h-3.5 text-slate-400" /> {trip.end}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-4 text-slate-400">
                            {trip.facilities.hasWifi && <Wifi className="w-4 h-4 text-sky-500" title="Free WiFi" />}
                            {trip.facilities.hasAc && <Wind className="w-4 h-4 text-sky-500" title="Air Conditioning" />}
                            {trip.facilities.hasTv && <Tv className="w-4 h-4 text-sky-500" title="Entertainment TV" />}
                            {trip.facilities.hasCharging && <Zap className="w-4 h-4 text-sky-500" title="USB Power Outlets" />}
                            <span className="text-xs text-slate-400 font-mono ml-2">
                              {49 - trip.bookedSeats.length} seats left
                            </span>
                          </div>
                        </div>

                        {/* Pricing & Reservation Column */}
                        <div className="flex flex-col justify-between items-end min-w-[120px]">
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-400 block">Ticket Fare</span>
                            <span className="text-2xl font-black text-slate-800">BWP {trip.priceBWP}</span>
                          </div>

                          <button
                            onClick={() => handleSelectTrip(trip)}
                            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 transition-all duration-200"
                          >
                            Reserve Seat <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Interactive Seat Map Selection */}
          {bookingStep === 'seats' && selectedTrip && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <button
                  onClick={() => setBookingStep('search')}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  &larr; Back to schedules
                </button>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-md font-bold text-slate-800 mb-2">Select Your Seating Position</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Choose seats from the configuration. Window seats have a subtle top-right marker dot.
                  </p>
                  
                  {/* Pull dynamically loaded seats from trip or mock schema */}
                  <InteractiveSeatMap
                    seats={selectedTrip.layoutType === 'quantum' ? 
                      trips.find(t=>t.id === selectedTrip.id)?.layoutType === 'quantum' ? 
                        requireLayout('quantum') : requireLayout('quantum') 
                      : requireLayout(selectedTrip.layoutType)
                    }
                    rows={selectedTrip.layoutType === 'quantum' ? 5 : selectedTrip.layoutType === 'coaster' ? 7 : 12}
                    cols={selectedTrip.layoutType === 'quantum' ? 3 : selectedTrip.layoutType === 'coaster' ? 4 : 5}
                    layoutType={selectedTrip.layoutType}
                    bookedSeats={selectedTrip.bookedSeats}
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                </div>
              </div>

              {/* Sidebar Booking Summary */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-6 space-y-6">
                  <div>
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold rounded-md uppercase">
                      {selectedTrip.operatorName}
                    </span>
                    <h4 className="text-md font-bold text-slate-800 mt-1 flex items-center gap-2">
                      {selectedTrip.start} <ArrowRight className="w-4 h-4 text-slate-400" /> {selectedTrip.end}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {selectedTrip.departureTime}
                    </p>
                  </div>

                  <div className="border-t border-b border-slate-100 py-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Selected Seats</span>
                      <span className="font-mono font-bold text-slate-700">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Fare Per Passenger</span>
                      <span className="font-mono text-slate-700">BWP {selectedTrip.priceBWP}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-600">Total Price</span>
                    <span className="text-xl font-black text-slate-950">
                      BWP {selectedTrip.priceBWP * selectedSeats.length}
                    </span>
                  </div>

                  <button
                    disabled={selectedSeats.length === 0}
                    onClick={() => setBookingStep('payment')}
                    className={`w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md
                      ${selectedSeats.length > 0
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-100'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      }
                    `}
                  >
                    Continue to Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Flow */}
          {bookingStep === 'payment' && selectedTrip && (
            <div className="max-w-2xl mx-auto space-y-6">
              <button
                onClick={() => setBookingStep('seats')}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                &larr; Back to seating
              </button>

              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Reserve and Secure Ticket</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Provide passenger contact details and make payment with local Mobile Money.
                </p>

                {paymentStep === 'details' && (
                  <form onSubmit={handleInitiatePayment} className="space-y-6">
                    {/* Passenger Info Grid */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Neo Letsholo"
                            value={passengerName}
                            onChange={(e) => setPassengerName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. neo@gmail.com"
                            value={passengerEmail}
                            onChange={(e) => setPassengerEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Phone Number</label>
                        <div className="flex">
                          <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2 text-xs text-slate-500 flex items-center">
                            +267
                          </span>
                          <input
                            type="tel"
                            required
                            placeholder="71234567"
                            value={passengerPhone}
                            onChange={(e) => setPassengerPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Money Info */}
                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Money Payment</h4>
                      
                      {/* Provider Select Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentProvider('orange_money')}
                          className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200
                            ${paymentProvider === 'orange_money'
                              ? 'border-orange-500 bg-orange-50/40 text-orange-600 font-bold shadow-sm'
                              : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-500'
                            }
                          `}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block" />
                          <span className="text-[10px] tracking-tight">Orange Money</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentProvider('myzaka')}
                          className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200
                            ${paymentProvider === 'myzaka'
                              ? 'border-yellow-500 bg-yellow-50/40 text-yellow-700 font-bold shadow-sm'
                              : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-500'
                            }
                          `}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block" />
                          <span className="text-[10px] tracking-tight">MyZaka (Mascom)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentProvider('smega')}
                          className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200
                            ${paymentProvider === 'smega'
                              ? 'border-teal-600 bg-teal-50/40 text-teal-700 font-bold shadow-sm'
                              : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-500'
                            }
                          `}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 block" />
                          <span className="text-[10px] tracking-tight">Smega (BTC)</span>
                        </button>
                      </div>

                      {/* Payment Number Input */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
                          {paymentProvider === 'orange_money' ? 'Orange Money' : paymentProvider === 'myzaka' ? 'MyZaka' : 'Smega'} Phone Number
                        </label>
                        <div className="flex">
                          <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2 text-xs text-slate-500 flex items-center">
                            +267
                          </span>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 72123456"
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1.5 block">
                          Provide your registered {paymentProvider === 'orange_money' ? 'Orange' : paymentProvider === 'myzaka' ? 'Mascom' : 'BTC'} SIM number.
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">Reserved seats: {selectedSeats.join(', ')}</span>
                      <span className="font-black text-slate-900 text-sm">BWP {selectedTrip.priceBWP * selectedSeats.length}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 shadow-md shadow-sky-100"
                    >
                      Authorize Payment
                    </button>
                  </form>
                )}

                {/* USSD PUSH SIMULATOR */}
                {paymentStep === 'ussd_push' && (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                      <CreditCard className="w-8 h-8 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 animate-ping" />
                    </div>

                    <h4 className="text-md font-bold text-slate-800">Payment Authorization Sent</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      A secured mobile payment request has been pushed to <span className="font-semibold text-slate-700">+267 {paymentPhone}</span>.
                    </p>

                    {/* MOCK PHONE LAYOUT / POPUP DIALOG */}
                    <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-xs mx-auto text-left shadow-2xl border border-slate-800 relative">
                      <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mb-4" />
                      
                      <div className="bg-slate-800 rounded-2xl p-4 space-y-4 text-xs">
                        <div className="flex justify-between border-b border-slate-700 pb-2">
                          <span className="font-bold tracking-wider text-[10px] text-sky-400">
                            {paymentProvider === 'orange_money' ? 'ORANGE MONEY' : paymentProvider === 'myzaka' ? 'MYZAKA' : 'SMEGA'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">PUSH</span>
                        </div>

                        <p className="text-slate-200 leading-relaxed font-mono">
                          Do you want to pay <span className="font-bold text-white">BWP {selectedTrip.priceBWP * selectedSeats.length}</span> to Botswana Bus Booking?
                        </p>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1 font-mono">ENTER PIN TO AUTHORIZE</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="••••"
                            value={simulatedPin}
                            onChange={(e) => setSimulatedPin(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5 mt-4">
                        <button
                          type="button"
                          onClick={() => setPaymentStep('details')}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold py-2 rounded-xl text-center text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={handleConfirmUssdPayment}
                          className="flex-1 bg-sky-500 hover:bg-sky-600 text-[10px] font-bold py-2 rounded-xl text-center text-white flex items-center justify-center gap-1"
                        >
                          {isProcessingPayment ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            'Authorize'
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-600 bg-amber-50/50 rounded-xl p-3 max-w-sm mx-auto border border-amber-100">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>This is a simulated secure integration. Enter any 4 digits to proceed.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Success / Ticket Boarding Pass */}
          {bookingStep === 'ticket' && recentBooking && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Booking Secured!</h3>
                <p className="text-xs text-slate-400">Your seat has been reserved and your receipt issued.</p>
              </div>

              {/* AESTHETIC POLISHED TICKETING CARD */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl relative">
                {/* Visual cutout circles (ticket-like) */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 border-r border-slate-100 rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 border-l border-slate-100 rounded-full -translate-y-1/2" />

                {/* Ticket Top */}
                <div className="p-6 bg-slate-900 text-white relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold tracking-widest text-sky-400 uppercase">BOARDING PASS</span>
                      <h4 className="text-lg font-extrabold tracking-tight mt-0.5">{recentBooking.operatorName}</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/25 text-emerald-300 text-[9px] font-bold rounded-md">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="flex justify-between items-center my-6">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">FROM</span>
                      <span className="text-md font-bold">{recentBooking.start}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 mx-4">
                      <ArrowRight className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">TO</span>
                      <span className="text-md font-bold">{recentBooking.end}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-800 pt-4 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px]">DEPARTURE</span>
                      <span className="font-semibold text-slate-200">{recentBooking.departureTime}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px]">BUS REG NO</span>
                      <span className="font-semibold text-slate-200">{recentBooking.regNo}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Bottom */}
                <div className="p-6 pt-8 space-y-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-mono">PASSENGER</span>
                      <span className="font-bold text-slate-800">{recentBooking.passengerName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] font-mono">SEAT(S)</span>
                      <span className="font-bold text-sky-600 font-mono text-sm">{recentBooking.selectedSeats.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-mono">PAYMENT METHOD</span>
                      <span className="font-semibold text-slate-700 capitalize">
                        {recentBooking.paymentProvider.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] font-mono">TOTAL AMOUNT</span>
                      <span className="font-bold text-slate-950">BWP {recentBooking.totalAmountBWP}</span>
                    </div>
                  </div>

                  {/* SVG QR Code */}
                  <div className="flex flex-col items-center justify-center border-t border-dashed border-slate-200 pt-6">
                    <QrCodeSvg value={recentBooking.paymentReference} size={120} />
                    <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase">Ref: {recentBooking.paymentReference}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBookingStep('search');
                    setSearched(false);
                    setSelectedTrip(null);
                    setSelectedSeats([]);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all duration-200"
                >
                  Book Another Trip
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Internal layout helper
function requireLayout(layoutType: any) {
  return generateSeatLayout(layoutType).seats;
}
