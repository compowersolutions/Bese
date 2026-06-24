/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Operator, Bus, Trip, Booking, BusLayoutType, BusFacilities } from '../types';
import { 
  addOperator, 
  addBus, 
  addTrip, 
  getOperators, 
  getBuses, 
  getTrips, 
  getBookings 
} from '../lib/dbService';
import { generateSeatLayout } from '../data/mockData';
import { 
  Building, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  Compass, 
  Truck, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Wifi, 
  Wind, 
  Tv, 
  Zap, 
  Users, 
  Tag, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InteractiveSeatMap from './InteractiveSeatMap';

interface OperatorPortalProps {
  onRefreshData: () => void;
}

export default function OperatorPortal({ onRefreshData }: OperatorPortalProps) {
  // Application Data States
  const [operators, setOperators] = useState<Operator[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Session State
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Operator onboarding/registration form
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [hqLocation, setHqLocation] = useState('Gaborone');
  const [logoColor, setLogoColor] = useState('#0ea5e9');

  // Bus Creation Form
  const [busRegNo, setBusRegNo] = useState('');
  const [busModel, setBusModel] = useState('');
  const [layoutType, setLayoutType] = useState<BusLayoutType>('coach_luxury');
  const [facilities, setFacilities] = useState<BusFacilities>({
    hasWifi: true,
    hasAc: true,
    hasCharging: true,
    hasToilet: true,
    hasTv: true
  });
  const [showBusPreview, setShowBusPreview] = useState(false);
  const [isRegisteringBus, setIsRegisteringBus] = useState(false);

  // Trip Creation Form
  const [selectedBusId, setSelectedBusId] = useState('');
  const [tripStart, setTripStart] = useState('Gaborone');
  const [tripEnd, setTripEnd] = useState('Francistown');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [tripPrice, setTripPrice] = useState<number>(180);
  const [isSchedulingTrip, setIsSchedulingTrip] = useState(false);

  // Toggle View State
  const [activeTab, setActiveTab] = useState<'overview' | 'buses' | 'schedules' | 'bookings'>('overview');

  // Load operator data
  const loadOperatorData = async () => {
    setIsLoading(true);
    try {
      const ops = await getOperators();
      const bList = await getBuses();
      const tList = await getTrips();
      const bkList = await getBookings();

      setOperators(ops);
      setBuses(bList);
      setTrips(tList);
      setBookings(bkList);

      // Check if we have an active session
      const savedOpId = localStorage.getItem('bw_active_operator_id');
      if (savedOpId) {
        const found = ops.find(o => o.id === savedOpId);
        if (found) {
          setCurrentOperator(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOperatorData();
  }, []);

  // Quick select an operator for demonstration or login
  const handleSelectOperator = (op: Operator) => {
    setCurrentOperator(op);
    localStorage.setItem('bw_active_operator_id', op.id);
  };

  // Register a new company / Subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !contactPhone || !contactEmail) {
      alert('Please fill out all fields.');
      return;
    }

    const newOpId = 'op_' + companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newOp: Operator = {
      id: newOpId,
      name: companyName,
      contactPerson: contactName,
      phone: contactPhone,
      email: contactEmail,
      isSubscribed: true,
      subscribedAt: Date.now(),
      logoColor: logoColor,
      hqLocation: hqLocation
    };

    try {
      await addOperator(newOp);
      setOperators([newOp, ...operators]);
      setCurrentOperator(newOp);
      localStorage.setItem('bw_active_operator_id', newOp.id);
      onRefreshData(); // Tell main component to pull updated list
    } catch (err) {
      console.error('Subscription failed:', err);
      alert('Failed to register subscription.');
    }
  };

  // Log Out Company
  const handleLogout = () => {
    setCurrentOperator(null);
    localStorage.removeItem('bw_active_operator_id');
  };

  // Handle Bus Creation
  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOperator) return;
    if (!busRegNo || !busModel) {
      alert('Please complete all bus registry fields.');
      return;
    }

    // Basic Botswana plates regex check (e.g. B 123 ABC or B 1234 A)
    const cleanReg = busRegNo.trim().toUpperCase();
    if (!cleanReg.startsWith('B')) {
      alert('Botswana vehicle registration numbers must start with letter B.');
      return;
    }

    setIsRegisteringBus(true);
    const busId = 'bus_' + Math.random().toString(36).substring(2, 9);
    
    // Generate realistic seat coordinates based on selection
    const layout = generateSeatLayout(layoutType);

    const newBus: Bus = {
      id: busId,
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      regNo: cleanReg,
      model: busModel,
      capacity: layoutType === 'quantum' ? 14 : layoutType === 'coaster' ? 21 : 49,
      layoutType: layoutType,
      facilities: facilities,
      rows: layout.rows,
      cols: layout.cols,
      seats: layout.seats
    };

    try {
      await addBus(newBus);
      setBuses([newBus, ...buses]);
      setIsRegisteringBus(false);
      setBusRegNo('');
      setBusModel('');
      setShowBusPreview(false);
      alert('Vehicle registered successfully!');
      onRefreshData();
    } catch (err) {
      console.error(err);
      setIsRegisteringBus(false);
      alert('Failed to register vehicle.');
    }
  };

  // Handle Trip/Schedule Creation
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOperator) return;
    if (!selectedBusId || !departureDate || !departureTime) {
      alert('Please select a vehicle and set scheduled time.');
      return;
    }

    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (!selectedBus) return;

    setIsSchedulingTrip(true);
    const tripId = `trip_${selectedBus.id}_${departureDate}_${departureTime.replace(':', '')}`;
    
    const newTrip: Trip = {
      id: tripId,
      busId: selectedBus.id,
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      routeId: `r_${tripStart.substring(0,3).toLowerCase()}_${tripEnd.substring(0,3).toLowerCase()}`,
      start: tripStart,
      end: tripEnd,
      departureTime: `${departureDate} ${departureTime}`,
      arrivalTime: `${departureDate} ${calculateArrivalTime(departureTime, tripStart, tripEnd)}`,
      priceBWP: Number(tripPrice),
      availableSeats: selectedBus.capacity,
      bookedSeats: [],
      regNo: selectedBus.regNo,
      facilities: selectedBus.facilities,
      layoutType: selectedBus.layoutType
    };

    try {
      await addTrip(newTrip);
      setTrips([newTrip, ...trips]);
      setIsSchedulingTrip(false);
      setSelectedBusId('');
      alert('Route scheduled successfully!');
      onRefreshData();
    } catch (err) {
      console.error(err);
      setIsSchedulingTrip(false);
      alert('Failed to schedule route.');
    }
  };

  const calculateArrivalTime = (depTime: string, s: string, e: string): string => {
    const [h, m] = depTime.split(':').map(Number);
    // Add realistic duration
    let dur = 4;
    if (s === 'Gaborone' && e === 'Francistown') dur = 5;
    if (s === 'Gaborone' && e === 'Maun') dur = 10;
    if (s === 'Gaborone' && e === 'Lobatse') dur = 1;
    
    const arrivalH = (h + dur) % 24;
    return `${arrivalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Compute stats for current operator
  const myBuses = buses.filter(b => b.operatorId === currentOperator?.id);
  const myTrips = trips.filter(t => t.operatorId === currentOperator?.id);
  
  // Filter bookings belonging to this operator's trips
  const myTripIds = myTrips.map(t => t.id);
  const myBookings = bookings.filter(bk => myTripIds.includes(bk.tripId));
  const myEarnings = myBookings.reduce((sum, b) => sum + b.totalAmountBWP, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-sans">
        <span className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-xs">Loading Subscription Portal...</p>
      </div>
    );
  }

  // PORTAL FOR NOT SIGNED UP OWNERS (SUBSCRIBE FACILITY)
  if (!currentOperator) {
    return (
      <div className="space-y-8">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <span className="px-3 py-1 bg-sky-50 text-sky-600 text-xs font-bold rounded-full uppercase tracking-wider">
            Operator Portal
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subscribe Your Bus Fleet</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Register your transit brand to publish routes, customize realistic seat maps, and accept automated mobile money ticket purchases.
          </p>
        </div>

        {/* Existing Operators for quick login */}
        {operators.length > 0 && (
          <div className="max-w-xl mx-auto bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <span className="text-[10px] font-bold text-slate-400 block mb-3 uppercase tracking-wider">
              Quick Log In Authorized Operators
            </span>
            <div className="flex flex-wrap gap-2.5">
              {operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelectOperator(op)}
                  className="px-4 py-2 bg-white hover:bg-sky-50 hover:border-sky-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition-all flex items-center gap-2"
                >
                  <Building className="w-4 h-4 text-sky-500" />
                  {op.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Registration Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800">New Subscription</h3>
              <p className="text-xs text-slate-400">Botswana Transport Licensing compliant</p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Fleet Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kalahari Star Liners"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Primary Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="Manager / Director"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">HQ Central Station</label>
                <select
                  value={hqLocation}
                  onChange={(e) => setHqLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Gaborone">Gaborone (Station)</option>
                  <option value="Francistown">Francistown</option>
                  <option value="Maun">Maun</option>
                  <option value="Palapye">Palapye</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Central Hotline Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+267 395 XXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Hotline Email</label>
                <input
                  type="email"
                  required
                  placeholder="fleet@operator.co.bw"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Logo Brand Color Pick */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2">Corporate Brand Accent Color</label>
              <div className="flex gap-2">
                {['#0ea5e9', '#0284c7', '#0056B3', '#DC3545', '#198754', '#7c3aed', '#db2777'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setLogoColor(col)}
                    className={`w-8 h-8 rounded-full border transition-all duration-200 relative
                      ${logoColor === col ? 'border-slate-800 scale-110 shadow-sm' : 'border-slate-200 hover:scale-105'}
                    `}
                    style={{ backgroundColor: col }}
                  >
                    {logoColor === col && (
                      <span className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 shadow-md shadow-sky-100"
            >
              Subscribe Company Fleet
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ACTIVE OPERATOR DASHBOARD
  return (
    <div className="space-y-8">
      {/* Dashboard Top banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 rounded-bl-full -z-10 opacity-10" />
        <div>
          <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">SUBSCRIBED TRANSPORT PROVIDER</span>
          <h2 className="text-2xl font-black tracking-tight mt-1">{currentOperator.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
            <span>HQ: {currentOperator.hqLocation}</span>
            <span>&bull;</span>
            <span>Hotline: {currentOperator.phone}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
        >
          Disconnect Session
        </button>
      </div>

      {/* Operator stats widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fleet Vehicles</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{myBuses.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Registered in Registry</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Schedules</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{myTrips.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Scheduled on system</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tickets Sold</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{myBookings.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Reserved bookings</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gross Revenue</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">BWP {myEarnings}</span>
          <span className="text-[10px] text-emerald-600/75 font-semibold mt-1 block">Via local Mobile Money</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-100">
        {[
          { id: 'overview', label: 'Fleet Registry' },
          { id: 'schedules', label: 'Route Scheduling' },
          { id: 'bookings', label: 'Passenger Manifest' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-xs font-bold transition-all border-b-2
              ${activeTab === tab.id
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: FLEET REGISTRY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Bus Registry Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Register Transit Vehicle</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure custom configurations and seat blueprints</p>
              </div>

              <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1.5">Registration Plate Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B 110 ABY"
                    value={busRegNo}
                    onChange={(e) => setBusRegNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1.5">Bus Model Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scania Marcopolo G7 / Toyota Quantum"
                    value={busModel}
                    onChange={(e) => setBusModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1.5">Layout Configuration</label>
                  <select
                    value={layoutType}
                    onChange={(e) => setLayoutType(e.target.value as BusLayoutType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  >
                    <option value="quantum">15-Seater Minibus (Quantum Layout)</option>
                    <option value="coaster">22-Seater Midibus (Coaster Layout)</option>
                    <option value="coach_standard">65-Seater Standard Coach Layout (2x2)</option>
                    <option value="coach_luxury">49-Seater Luxury Liner Layout</option>
                  </select>
                </div>

                {/* Facilities Toggles */}
                <div className="space-y-2.5 pt-2">
                  <label className="block font-semibold text-slate-500">Boarding Amenities</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="flex items-center gap-2 border border-slate-100 bg-slate-50/50 p-2 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilities.hasWifi}
                        onChange={(e) => setFacilities({ ...facilities, hasWifi: e.target.checked })}
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                      />
                      <Wifi className="w-3.5 h-3.5 text-slate-500" />
                      <span>Free Wifi</span>
                    </label>

                    <label className="flex items-center gap-2 border border-slate-100 bg-slate-50/50 p-2 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilities.hasAc}
                        onChange={(e) => setFacilities({ ...facilities, hasAc: e.target.checked })}
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                      />
                      <Wind className="w-3.5 h-3.5 text-slate-500" />
                      <span>Air Con (AC)</span>
                    </label>

                    <label className="flex items-center gap-2 border border-slate-100 bg-slate-50/50 p-2 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilities.hasCharging}
                        onChange={(e) => setFacilities({ ...facilities, hasCharging: e.target.checked })}
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                      />
                      <Zap className="w-3.5 h-3.5 text-slate-500" />
                      <span>USB Outlets</span>
                    </label>

                    <label className="flex items-center gap-2 border border-slate-100 bg-slate-50/50 p-2 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilities.hasToilet}
                        onChange={(e) => setFacilities({ ...facilities, hasToilet: e.target.checked })}
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                      />
                      <Compass className="w-3.5 h-3.5 text-slate-500" />
                      <span>On-Board Restroom</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBusPreview(!showBusPreview)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-center"
                  >
                    {showBusPreview ? 'Hide Seat Map' : 'Preview Seat Map'}
                  </button>

                  <button
                    type="submit"
                    disabled={isRegisteringBus}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl"
                  >
                    {isRegisteringBus ? 'Adding...' : 'Register Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Bus preview or fleet list */}
          <div className="lg:col-span-7">
            {showBusPreview ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Seat Grid Blueprint Preview</h3>
                  <button
                    onClick={() => setShowBusPreview(false)}
                    className="text-xs font-bold text-sky-500"
                  >
                    Close Preview
                  </button>
                </div>
                
                <InteractiveSeatMap
                  seats={generateSeatLayout(layoutType).seats}
                  rows={layoutType === 'quantum' ? 5 : layoutType === 'coaster' ? 7 : 12}
                  cols={layoutType === 'quantum' ? 3 : layoutType === 'coaster' ? 4 : 5}
                  layoutType={layoutType}
                  bookedSeats={['2A', '2B']} // Dummy booked for preview representation
                  selectedSeats={[]}
                  onSeatToggle={() => {}}
                />
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Registered Operator Fleet ({myBuses.length})</h3>

                {myBuses.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-medium">No transit vehicles registered yet</p>
                    <p className="text-[10px]">Configure your first bus using the registration console on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {myBuses.map((bus) => (
                      <div key={bus.id} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50/40">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800 tracking-tight font-mono">{bus.regNo}</span>
                          <span className="text-xs text-slate-500 block">{bus.model} &bull; {bus.capacity} seats</span>
                          
                          <div className="flex gap-1 text-slate-400 mt-1">
                            {bus.facilities.hasWifi && <Wifi className="w-3.5 h-3.5 text-sky-500" />}
                            {bus.facilities.hasAc && <Wind className="w-3.5 h-3.5 text-sky-500" />}
                            {bus.facilities.hasCharging && <Zap className="w-3.5 h-3.5 text-sky-500" />}
                            {bus.facilities.hasToilet && <Compass className="w-3.5 h-3.5 text-sky-500" />}
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {bus.layoutType.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROUTE SCHEDULING */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Scheduling controls */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Publish Route Trip</h3>
                <p className="text-xs text-slate-400 mt-0.5">Deploy registered vehicles on commercial Botswana routes</p>
              </div>

              {myBuses.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-700 text-xs rounded-xl flex items-center gap-2 border border-amber-100">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Please register a fleet vehicle before scheduling trips!</span>
                </div>
              ) : (
                <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1.5">Select Fleet Vehicle</label>
                    <select
                      value={selectedBusId}
                      onChange={(e) => setSelectedBusId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="">-- Select Active Vehicle --</option>
                      {myBuses.map(b => (
                        <option key={b.id} value={b.id}>{b.regNo} ({b.model})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-500 mb-1.5">From (Hub)</label>
                      <select
                        value={tripStart}
                        onChange={(e) => setTripStart(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="Gaborone">Gaborone</option>
                        <option value="Francistown">Francistown</option>
                        <option value="Maun">Maun</option>
                        <option value="Lobatse">Lobatse</option>
                        <option value="Palapye">Palapye</option>
                        <option value="Kasane">Kasane</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-500 mb-1.5">To (Hub)</label>
                      <select
                        value={tripEnd}
                        onChange={(e) => setTripEnd(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="Francistown">Francistown</option>
                        <option value="Gaborone">Gaborone</option>
                        <option value="Maun">Maun</option>
                        <option value="Lobatse">Lobatse</option>
                        <option value="Palapye">Palapye</option>
                        <option value="Kasane">Kasane</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-500 mb-1.5">Date of Departure</label>
                      <input
                        type="date"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-500 mb-1.5">Time (24h format)</label>
                      <input
                        type="time"
                        required
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1.5">Ticket Fare (BWP)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={tripPrice}
                      onChange={(e) => setTripPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSchedulingTrip}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all duration-200 shadow-md"
                  >
                    {isSchedulingTrip ? 'Publishing...' : 'Publish Scheduled Trip'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Schedules list */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Active Commercial Schedules ({myTrips.length})</h3>

              {myTrips.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium">No published trips found</p>
                  <p className="text-[10px]">Use the left form to schedule routes and open bookings to the public.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myTrips.map((trip) => (
                    <div key={trip.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 text-xs">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          {trip.start} <ArrowRight className="w-3 h-3 text-slate-400" /> {trip.end}
                        </span>
                        <span className="font-bold text-slate-900">BWP {trip.priceBWP}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-500">
                        <div>
                          <span>Bus Reg: </span>
                          <span className="font-mono font-semibold text-slate-700">{trip.regNo}</span>
                        </div>
                        <div className="text-right">
                          <span>Departure: </span>
                          <span className="font-semibold text-slate-700">{trip.departureTime}</span>
                        </div>
                        <div>
                          <span>Seat layout: </span>
                          <span className="font-semibold text-slate-700 capitalize">{trip.layoutType.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <span>Booked: </span>
                          <span className="font-bold text-sky-600">{trip.bookedSeats.length} / {trip.layoutType === 'quantum' ? 14 : trip.layoutType === 'coaster' ? 21 : 49} seats</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PASSENGER MANIFEST */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Secured Passenger Bookings ({myBookings.length})</h3>

          {myBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">No bookings logged</p>
              <p className="text-[10px]">When passengers select seats and complete mobile money checkouts, their tickets will display here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-2">Ticket ID</th>
                    <th className="py-3 px-2">Passenger</th>
                    <th className="py-3 px-2">Route</th>
                    <th className="py-3 px-2">Departure</th>
                    <th className="py-3 px-2">Seat(s)</th>
                    <th className="py-3 px-2">Payment</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {myBookings.map((bk) => (
                    <tr key={bk.id} className="text-slate-700 hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-mono text-slate-400 font-bold">{bk.id}</td>
                      <td className="py-3 px-2">
                        <span className="font-bold text-slate-800 block">{bk.passengerName}</span>
                        <span className="text-[10px] text-slate-400 block">{bk.passengerPhone}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span>{bk.start} &rarr; {bk.end}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">Reg: {bk.regNo}</span>
                      </td>
                      <td className="py-3 px-2">{bk.departureTime}</td>
                      <td className="py-3 px-2 font-mono font-bold text-sky-600">{bk.selectedSeats.join(', ')}</td>
                      <td className="py-3 px-2">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-600">
                          {bk.paymentProvider.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{bk.paymentReference}</span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-900">BWP {bk.totalAmountBWP}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
