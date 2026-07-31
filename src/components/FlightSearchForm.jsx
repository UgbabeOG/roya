import React, { useState, useEffect } from 'react';
import { Plane, Calendar, Users, Shield, ArrowRightLeft, Sparkles, Activity, Search, History, Clock, ArrowRight, Tag, Globe, Plus, Trash2 } from 'lucide-react';
import { POPULAR_AIRPORTS } from '../data/destinations';
import { fetchAirportsFromFirestore } from '../lib/destinationsService';
import { calculateSavings, formatCurrency } from '../utils/pnrGenerator';

export default function FlightSearchForm({ onSearchFlights, loading, currency = 'USD', onCurrencyChange }) {
  const [airports, setAirports] = useState(POPULAR_AIRPORTS);
  const [tripType, setTripType] = useState('round');
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LHR');
  const [departDate, setDepartDate] = useState('2026-08-15');
  const [returnDate, setReturnDate] = useState('2026-08-29');
  
  // Multi-city dynamic segments state
  const [multiSegments, setMultiSegments] = useState([
    { id: 'seg-1', origin: 'JFK', destination: 'LHR', date: '2026-08-15' },
    { id: 'seg-2', origin: 'LHR', destination: 'DXB', date: '2026-08-22' }
  ]);

  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Business');
  const [reserveBeforePayment, setReserveBeforePayment] = useState(true);

  // Recent Searches state (last 3 queries persisted in localStorage)
  const [recentSearches, setRecentSearches] = useState([]);
  const [dateError, setDateError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDepartDateChange = (val) => {
    setDepartDate(val);
    setDateError('');
    if (tripType === 'round' && val > returnDate) {
      // Auto adjust return date to be 7 days after new departure date
      const d = new Date(val);
      d.setDate(d.getDate() + 7);
      const nextRet = d.toISOString().split('T')[0];
      setReturnDate(nextRet);
    }
  };

  const handleReturnDateChange = (val) => {
    if (val < departDate) {
      setDateError('Return date cannot be earlier than departure date. Departure date must precede return date.');
      setReturnDate(departDate);
    } else {
      setDateError('');
      setReturnDate(val);
    }
  };

  useEffect(() => {
    async function loadAirports() {
      try {
        const fetched = await fetchAirportsFromFirestore();
        if (Array.isArray(fetched) && fetched.length > 0) {
          setAirports(fetched);
        }
      } catch (e) {
        console.warn('Error loading airports from Firebase Store:', e);
      }
    }
    loadAirports();

    try {
      const stored = localStorage.getItem('royabridge_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 3));
        }
      }
    } catch (err) {
      console.warn('Failed to load recent searches:', err);
    }
  }, []);


  const saveRecentSearch = (searchItem) => {
    try {
      const updated = [
        searchItem,
        ...recentSearches.filter(s => !(s.origin === searchItem.origin && s.destination === searchItem.destination && s.cabinClass === searchItem.cabinClass))
      ].slice(0, 3);
      setRecentSearches(updated);
      localStorage.setItem('royabridge_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist recent search:', err);
    }
  };

  // Multi-segment handlers
  const handleAddSegment = () => {
    if (multiSegments.length >= 5) return;
    const lastSeg = multiSegments[multiSegments.length - 1];
    
    // Calculate default date (+5 days after last segment date)
    let nextDate = '2026-08-28';
    if (lastSeg?.date) {
      const d = new Date(lastSeg.date);
      d.setDate(d.getDate() + 5);
      nextDate = d.toISOString().split('T')[0];
    }

    const nextOrigin = lastSeg?.destination || 'DXB';
    const nextDest = nextOrigin === 'HND' ? 'JFK' : 'HND';

    setMultiSegments([
      ...multiSegments,
      {
        id: `seg-${Date.now()}`,
        origin: nextOrigin,
        destination: nextDest,
        date: nextDate
      }
    ]);
  };

  const handleRemoveSegment = (index) => {
    if (multiSegments.length <= 2) return;
    setMultiSegments(multiSegments.filter((_, idx) => idx !== index));
  };

  const handleSegmentChange = (index, field, value) => {
    const updated = [...multiSegments];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-chain origin of next segment if destination changes
    if (field === 'destination' && index < updated.length - 1) {
      updated[index + 1].origin = value;
    }

    setMultiSegments(updated);
  };

  // Dynamic estimate calculation
  const multiMultiplier = tripType === 'multi' ? multiSegments.length * 0.85 : 1;
  const baseEstimate = cabinClass === 'Business' ? (1450 * multiMultiplier) : (cabinClass === 'First' ? (2800 * multiMultiplier) : (750 * multiMultiplier));
  const totalBase = baseEstimate * passengers;
  const savings = calculateSavings(totalBase, cabinClass);

  const executeSearch = (params) => {
    const tType = params.tripType || tripType;
    const originCode = params.origin || (tType === 'multi' ? multiSegments[0].origin : origin);
    const destCode = params.destination || (tType === 'multi' ? multiSegments[multiSegments.length - 1].destination : destination);
    const cabin = params.cabinClass || cabinClass;
    const depDate = params.departDate || (tType === 'multi' ? multiSegments[0].date : departDate);
    const retDate = params.returnDate || returnDate;
    const pax = params.passengers || passengers;

    const originObj = (airports || POPULAR_AIRPORTS).find(a => a.code === originCode) || { code: originCode, city: originCode, name: originCode };
    const destObj = (airports || POPULAR_AIRPORTS).find(a => a.code === destCode) || { code: destCode, city: destCode, name: destCode };

    const searchPayload = {
      tripType: tType,
      origin: originCode,
      destination: destCode,
      segments: tType === 'multi' ? multiSegments : null,
      originObj,
      destObj,
      departDate: depDate,
      returnDate: tType === 'round' ? retDate : null,
      passengers: pax,
      cabinClass: cabin,
      reserveBeforePayment,
      savings
    };

    // Persist to recent searches
    saveRecentSearch({
      id: Date.now(),
      origin: originCode,
      destination: destCode,
      originCity: originObj.city || originCode,
      destCity: destObj.city || destCode,
      departDate: depDate,
      returnDate: tType === 'round' ? retDate : null,
      cabinClass: cabin,
      tripType: tType,
      passengers: pax
    });

    onSearchFlights(searchPayload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validDep = departDate;
    let validRet = returnDate;

    if (tripType === 'round' && new Date(departDate) > new Date(returnDate)) {
      setDateError('Departure date cannot be after return date. We auto-aligned your return date.');
      validRet = departDate;
      setReturnDate(departDate);
    }

    executeSearch({ origin, destination, departDate: validDep, returnDate: validRet, tripType, passengers, cabinClass });
  };

  const handleSelectRecent = (recent) => {
    setOrigin(recent.origin);
    setDestination(recent.destination);
    setDepartDate(recent.departDate || '2026-08-15');
    if (recent.returnDate) setReturnDate(recent.returnDate);
    setCabinClass(recent.cabinClass || 'Business');
    if (recent.tripType) setTripType(recent.tripType);
    if (recent.passengers) setPassengers(recent.passengers);

    executeSearch(recent);
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <section id="reserve" style={{ padding: '60px 0', position: 'relative' }}>
      <div className="container">
        
        <div className="glass-card" style={{
          padding: '36px 32px',
          background: 'linear-gradient(180deg, rgba(14, 21, 38, 0.95) 0%, rgba(7, 11, 20, 0.95) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)'
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
            borderBottom: '1px solid rgba(229, 193, 88, 0.15)',
            paddingBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTripType('round')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: tripType === 'round' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: tripType === 'round' ? 'rgba(229, 193, 88, 0.2)' : 'transparent',
                  color: tripType === 'round' ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => setTripType('oneWay')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: tripType === 'oneWay' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: tripType === 'oneWay' ? 'rgba(229, 193, 88, 0.2)' : 'transparent',
                  color: tripType === 'oneWay' ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('multi')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: tripType === 'multi' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: tripType === 'multi' ? 'rgba(229, 193, 88, 0.2)' : 'transparent',
                  color: tripType === 'multi' ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Globe size={14} color={tripType === 'multi' ? 'var(--color-gold)' : 'currentColor'} />
                Multi-City
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Currency Selector Dropdown */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid var(--border-gold)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                <Globe size={15} color="var(--color-gold)" />
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Currency:</span>
                <select 
                  value={currency} 
                  onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
                  style={{
                    background: 'transparent',
                    color: 'var(--color-gold-bright)',
                    border: 'none',
                    outline: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    paddingRight: '2px'
                  }}
                  id="currency-selector"
                  aria-label="Select Currency"
                >
                  <option value="USD" style={{ background: '#0F172A', color: '#FFF' }}>USD ($)</option>
                  <option value="EUR" style={{ background: '#0F172A', color: '#FFF' }}>EUR (€)</option>
                  <option value="GBP" style={{ background: '#0F172A', color: '#FFF' }}>GBP (£)</option>
                </select>
              </div>

              <span className="gold-badge" style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
                <Shield size={14} color="var(--color-gold)" />
                Reserve Before Payment Enabled
              </span>
            </div>
          </div>

          {dateError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#EF4444" />
              <span>{dateError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Standard Round Trip / One Way Layout */}
            {tripType !== 'multi' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                alignItems: 'center'
              }}>
                
                {/* Origin */}
                <div>
                  <label style={labelStyle}>From (Origin)</label>
                  <div style={inputContainerStyle}>
                    <Plane size={18} color="var(--color-gold)" style={{ transform: 'rotate(-45deg)' }} />
                    <select 
                      value={origin} 
                      onChange={(e) => setOrigin(e.target.value)}
                      style={selectStyle}
                    >
                      {airports.map(ap => (
                        <option key={ap.code} value={ap.code} style={{ background: '#0F172A', color: '#FFF' }}>
                          {ap.city} ({ap.code}) - {ap.country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={swapLocations}
                    title="Swap Origin & Destination"
                    style={{
                      background: 'rgba(229, 193, 88, 0.15)',
                      border: '1px solid var(--border-gold)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gold-bright)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </div>

                {/* Destination */}
                <div>
                  <label style={labelStyle}>To (Destination)</label>
                  <div style={inputContainerStyle}>
                    <Plane size={18} color="var(--color-gold)" style={{ transform: 'rotate(45deg)' }} />
                    <select 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)}
                      style={selectStyle}
                    >
                      {airports.map(ap => (
                        <option key={ap.code} value={ap.code} style={{ background: '#0F172A', color: '#FFF' }}>
                          {ap.city} ({ap.code}) - {ap.country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Departure Date */}
                <div>
                  <label style={labelStyle}>Departure Date</label>
                  <div style={inputContainerStyle}>
                    <Calendar size={18} color="var(--color-gold)" />
                    <input 
                      type="date" 
                      value={departDate} 
                      min={todayStr}
                      onChange={(e) => handleDepartDateChange(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Return Date */}
                {tripType === 'round' && (
                  <div>
                    <label style={labelStyle}>Return Date</label>
                    <div style={inputContainerStyle}>
                      <Calendar size={18} color="var(--color-gold)" />
                      <input 
                        type="date" 
                        value={returnDate} 
                        min={departDate}
                        onChange={(e) => handleReturnDateChange(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Passengers & Cabin */}
                <div>
                  <label style={labelStyle}>Passengers & Cabin</label>
                  <div style={inputContainerStyle}>
                    <Users size={18} color="var(--color-gold)" />
                    <select 
                      value={passengers} 
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      style={{ ...selectStyle, width: '45%' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <option key={n} value={n} style={{ background: '#0F172A' }}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                      ))}
                    </select>
                    <select 
                      value={cabinClass} 
                      onChange={(e) => setCabinClass(e.target.value)}
                      style={{ ...selectStyle, width: '55%' }}
                    >
                      <option value="Economy" style={{ background: '#0F172A' }}>Economy</option>
                      <option value="Premium Economy" style={{ background: '#0F172A' }}>Premium Eco</option>
                      <option value="Business" style={{ background: '#0F172A' }}>Business Class</option>
                      <option value="First" style={{ background: '#0F172A' }}>First Class</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* Dynamic Multi-City Segment Builder Layout */}
            {tripType === 'multi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-gold-bright)', fontWeight: 700 }}>
                    Configure Multi-City Flight Segments ({multiSegments.length} Segments)
                  </span>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Passengers & Class:</label>
                    <select 
                      value={passengers} 
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      style={{ background: 'rgba(7,11,20,0.8)', border: '1px solid var(--border-gold)', color: '#FFF', borderRadius: '6px', padding: '4px 8px', fontSize: '0.85rem' }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                    </select>
                    <select 
                      value={cabinClass} 
                      onChange={(e) => setCabinClass(e.target.value)}
                      style={{ background: 'rgba(7,11,20,0.8)', border: '1px solid var(--border-gold)', color: '#FFF', borderRadius: '6px', padding: '4px 8px', fontSize: '0.85rem' }}
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Eco</option>
                      <option value="Business">Business Class</option>
                      <option value="First">First Class</option>
                    </select>
                  </div>
                </div>

                {multiSegments.map((seg, idx) => (
                  <div key={seg.id || idx} style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(229, 193, 88, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr 1fr 1fr auto',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      background: 'rgba(229, 193, 88, 0.2)',
                      color: 'var(--color-gold-bright)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap'
                    }}>
                      Flight {idx + 1}
                    </span>

                    {/* Segment Origin */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>From</label>
                      <select 
                        value={seg.origin} 
                        onChange={(e) => handleSegmentChange(idx, 'origin', e.target.value)}
                        style={{ ...selectStyle, background: 'rgba(7,11,20,0.9)', border: '1px solid var(--border-gold)', borderRadius: '6px', padding: '8px' }}
                      >
                        {airports.map(ap => (
                          <option key={ap.code} value={ap.code} style={{ background: '#0F172A' }}>
                            {ap.city} ({ap.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Segment Destination */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>To</label>
                      <select 
                        value={seg.destination} 
                        onChange={(e) => handleSegmentChange(idx, 'destination', e.target.value)}
                        style={{ ...selectStyle, background: 'rgba(7,11,20,0.9)', border: '1px solid var(--border-gold)', borderRadius: '6px', padding: '8px' }}
                      >
                        {airports.map(ap => (
                          <option key={ap.code} value={ap.code} style={{ background: '#0F172A' }}>
                            {ap.city} ({ap.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Segment Date */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Date</label>
                      <input 
                        type="date" 
                        value={seg.date} 
                        onChange={(e) => handleSegmentChange(idx, 'date', e.target.value)}
                        style={{ ...inputStyle, background: 'rgba(7,11,20,0.9)', border: '1px solid var(--border-gold)', borderRadius: '6px', padding: '8px' }}
                      />
                    </div>

                    {/* Remove Segment CTA */}
                    <div>
                      {multiSegments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSegment(idx)}
                          title="Remove flight segment"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#F87171',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Segment Button */}
                {multiSegments.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddSegment}
                    style={{
                      background: 'rgba(229, 193, 88, 0.12)',
                      border: '1px dashed var(--color-gold)',
                      color: 'var(--color-gold-bright)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    Add Another Flight Segment (+ Segment {multiSegments.length + 1})
                  </button>
                )}
              </div>
            )}

            {/* Recent Searches Bar (horizontal scrollable, max 3 queries) */}
            {recentSearches && recentSearches.length > 0 && (
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px dashed rgba(229, 193, 88, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--color-gold-bright)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}>
                  <History size={14} color="var(--color-gold)" />
                  Recent Searches:
                </div>

                <div 
                  className="no-scrollbar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '2px',
                    width: '100%'
                  }}
                >
                  {recentSearches.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleSelectRecent(item)}
                      style={{
                        background: 'rgba(7, 11, 20, 0.85)',
                        border: '1px solid rgba(229, 193, 88, 0.35)',
                        borderRadius: 'var(--radius-full)',
                        padding: '6px 14px',
                        color: '#FFF',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold-bright)';
                        e.currentTarget.style.background = 'rgba(229, 193, 88, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.35)';
                        e.currentTarget.style.background = 'rgba(7, 11, 20, 0.85)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Clock size={12} color="var(--color-gold)" />
                      <span>{item.origin} → {item.destination}</span>
                      <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>• {item.cabinClass}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Bar: Action Button */}
            <div style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(229, 193, 88, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              {/* Submit CTA */}
              <button 
                type="submit"
                className="btn-gold"
                style={{ padding: '16px 40px', fontSize: '1.05rem', minWidth: '280px' }}
                disabled={loading}
              >
                {loading ? <Activity className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Searching Live Inventory...' : (tripType === 'multi' ? 'Search Multi-City Flights' : 'Search Real-Time Flights & Prices')}
              </button>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: '600',
  color: 'var(--color-gold-bright)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px'
};

const inputContainerStyle = {
  background: 'rgba(7, 11, 20, 0.8)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const selectStyle = {
  background: 'transparent',
  border: 'none',
  color: '#F8FAFC',
  fontSize: '0.95rem',
  fontWeight: '500',
  outline: 'none',
  width: '100%',
  cursor: 'pointer'
};

const inputStyle = {
  background: 'transparent',
  border: 'none',
  color: '#F8FAFC',
  fontSize: '0.95rem',
  fontWeight: '500',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark'
};

