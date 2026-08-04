import React, { useState } from 'react';
import { Plane, Clock, ShieldCheck, Sparkles, Luggage, AlertCircle, ArrowRight, Filter, TrendingDown, Check, Columns, Layers, Trash2, X, Share2 } from 'lucide-react';
import { formatCurrency } from '../utils/pnrGenerator';
import AirlineLogo from './AirlineLogo';
import FlightComparisonModal from './FlightComparisonModal';

export default function RealTimeFlightResults({ 
  flights, 
  searchQuery, 
  loading, 
  error, 
  onSelectFlight,
  priceTrend,
  searchMeta,
  onCheckStatus,
  onOpenShare,
  currency = 'USD'
}) {

  const [sortBy, setSortBy] = useState('price'); // 'price' | 'duration' | 'departure'
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [comparedFlightIds, setComparedFlightIds] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  if (!searchQuery && !loading && (!flights || flights.length === 0)) {
    return null;
  }

  const toggleCompareFlight = (flightId) => {
    setComparedFlightIds(prev => {
      if (prev.includes(flightId)) {
        return prev.filter(id => id !== flightId);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 flights at a time.');
          return prev;
        }
        return [...prev, flightId];
      }
    });
  };

  const selectedComparedFlights = (flights || []).filter(f => comparedFlightIds.includes(f.id || f.flightNumber));

  // Filter & sort logic
  let filtered = Array.isArray(flights) ? [...flights] : [];

  if (selectedAirline !== 'ALL') {
    filtered = filtered.filter(f => f.airline.toLowerCase().includes(selectedAirline.toLowerCase()) || f.airlineCode === selectedAirline);
  }

  if (nonStopOnly) {
    filtered = filtered.filter(f => f.stops === 0);
  }

  if (sortBy === 'price') {
    filtered.sort((a, b) => a.royaPrice - b.royaPrice);
  } else if (sortBy === 'duration') {
    filtered.sort((a, b) => (parseInt(a.duration) || 8) - (parseInt(b.duration) || 8));
  }

  const uniqueAirlines = Array.from(new Set((flights || []).map(f => f.airlineCode)));

  return (
    <section id="realtime-results" style={{ padding: '40px 0 60px', position: 'relative' }}>
      <div className="container">
        
        {/* Loading State Skeleton & Scanner Animation */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Scanner Banner */}
            <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center', background: '#0E1526', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(229,193,88,0.08) 50%, transparent 100%)',
                animation: 'skeletonShimmer 1.8s infinite'
              }} />

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(229,193,88,0.2) 0%, rgba(16,185,129,0.2) 100%)',
                border: '2px solid var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'spin 2s linear infinite'
              }}>
                <Plane size={28} color="var(--color-gold-bright)" />
              </div>

              <h3 className="font-royal" style={{ fontSize: '1.35rem', color: '#FFF', marginBottom: '8px' }}>
                Querying Live Global Flight Inventory...
              </h3>
              <p style={{ color: '#CBD5E1', maxWidth: '520px', margin: '0 auto 16px', fontSize: '0.9rem' }}>
                Scanning Global Distribution Systems (GDS) for live schedules from <strong>{searchQuery?.origin || 'Origin'}</strong> to <strong>{searchQuery?.destination || 'Destination'}</strong>...
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="gold-badge" style={{ fontSize: '0.78rem' }}>
                  <Sparkles size={13} /> Live Price Engine Active
                </span>
                <span className="gold-badge" style={{ fontSize: '0.78rem' }}>
                  <ShieldCheck size={13} /> Applying 30% Concierge Rate
                </span>
              </div>
            </div>

            {/* Flight Result Card Skeletons (3 placeholder cards) */}
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="glass-card"
                style={{
                  padding: '24px 28px',
                  background: 'rgba(14, 21, 38, 0.7)',
                  border: '1px solid rgba(229, 193, 88, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                  animation: 'skeletonShimmer 1.8s infinite'
                }} />

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  {/* Skeleton 1: Airline info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '120px', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '6px' }} />
                        <div style={{ width: '80px', height: '12px', background: 'rgba(229,193,88,0.15)', borderRadius: '4px' }} />
                      </div>
                    </div>
                    <div style={{ width: '100px', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                  </div>

                  {/* Skeleton 2: Route schedule line */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ width: '60px', height: '22px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', marginBottom: '4px' }} />
                        <div style={{ width: '35px', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                      </div>

                      <div style={{ flex: 1, padding: '0 16px', textAlign: 'center' }}>
                        <div style={{ width: '50px', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', margin: '0 auto 6px' }} />
                        <div style={{ width: '100%', height: '2px', background: 'rgba(229,193,88,0.2)', margin: '6px 0' }} />
                        <div style={{ width: '70px', height: '12px', background: 'rgba(16,185,129,0.15)', borderRadius: '4px', margin: '0 auto' }} />
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ width: '60px', height: '22px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', marginBottom: '4px' }} />
                        <div style={{ width: '35px', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Skeleton 3: Price & button */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    background: 'rgba(7, 11, 20, 0.4)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ width: '80px', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '110px', height: '28px', background: 'rgba(229,193,88,0.2)', borderRadius: '4px', marginBottom: '12px' }} />
                    <div style={{ width: '100%', height: '38px', background: 'rgba(229,193,88,0.15)', borderRadius: 'var(--radius-md)' }} />
                  </div>
                </div>
              </div>
            ))}

            <style>{`
              @keyframes skeletonShimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid #EF4444' }}>
            <AlertCircle size={36} color="#EF4444" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '8px' }}>Unable to load live flight data</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* Results View */}
        {!loading && !error && filtered && (
          <div>
            
            {/* Results Header */}
            <div className="glass-card" style={{
              padding: '24px 28px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.95) 0%, rgba(7, 11, 20, 0.98) 100%)',
              border: '1.5px solid var(--border-gold)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.05em' }}>
                      REAL-TIME FLIGHT INVENTORY FOUND ({filtered.length} OPTIONS)
                    </span>
                  </div>
                  <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.6rem' }}>
                    {searchQuery?.origin || 'Origin'} → {searchQuery?.destination || 'Destination'}
                    <span style={{ fontSize: '1rem', color: 'var(--color-gold-bright)', marginLeft: '12px', fontWeight: 400 }}>
                      • {searchQuery?.cabinClass || 'Business'} Class
                    </span>
                  </h2>


                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowTrend(!showTrend)}
                    className="btn-outline-gold"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <TrendingDown size={16} />
                    {showTrend ? 'Hide Price Trends' : 'View 7-Day Price Trends'}
                  </button>
                </div>

              </div>

              {/* Price Trend Interactive Graph */}
              {showTrend && priceTrend && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(229,193,88,0.15)',
                  background: 'rgba(7, 11, 20, 0.6)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <h4 style={{ color: 'var(--color-gold-bright)', fontSize: '0.92rem', fontWeight: 700 }}>
                      7-Day Airfare Outlook ({searchQuery?.origin} - {searchQuery?.destination})
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#6EE7B7', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                      💡 Tip: {priceTrend.priceAdvice}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '10px 0' }}>
                    {priceTrend.trend.map((t, idx) => (
                      <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-bright)', fontWeight: 700, marginBottom: '4px' }}>
                          ${t.royaPrice}
                        </div>
                        <div style={{
                          height: `${Math.max(25, (t.royaPrice / 1500) * 70)}px`,
                          background: t.isCheapest 
                            ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)' 
                            : 'linear-gradient(180deg, #E5C158 0%, #B89025 100%)',
                          borderRadius: '4px',
                          margin: '0 auto',
                          width: '28px',
                          boxShadow: t.isCheapest ? '0 0 12px rgba(16,185,129,0.5)' : 'none'
                        }} />
                        <span style={{ fontSize: '0.75rem', color: t.isCheapest ? '#6EE7B7' : '#94A3B8', display: 'block', marginTop: '6px', fontWeight: t.isCheapest ? 800 : 500 }}>
                          {t.day} {t.isCheapest ? '⭐' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sorting & Filter Controls Bar */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={14} /> Sort:
                  </span>
                  <button
                    onClick={() => setSortBy('price')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: sortBy === 'price' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      background: sortBy === 'price' ? 'rgba(229,193,88,0.2)' : 'transparent',
                      color: sortBy === 'price' ? 'var(--color-gold-bright)' : '#94A3B8',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Lowest Concierge Price
                  </button>
                  <button
                    onClick={() => setSortBy('duration')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: sortBy === 'duration' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      background: sortBy === 'duration' ? 'rgba(229,193,88,0.2)' : 'transparent',
                      color: sortBy === 'duration' ? 'var(--color-gold-bright)' : '#94A3B8',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Fastest Duration
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={nonStopOnly}
                      onChange={(e) => setNonStopOnly(e.target.checked)}
                      style={{ accentColor: 'var(--color-gold)' }}
                    />
                    Direct Flights Only
                  </label>
                </div>
              </div>

            </div>

            {/* Flight Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filtered.map((flight) => (
                <div 
                  key={flight.id || flight.flightNumber}
                  className="glass-card"
                  style={{
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.9) 0%, rgba(7, 11, 20, 0.95) 100%)',
                    border: '1px solid rgba(229, 193, 88, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    
                    {/* Airline Info */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <AirlineLogo code={flight.airlineCode} name={flight.airline} size="md" />

                        {/* Side-by-side Compare Toggle Checkbox */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          background: comparedFlightIds.includes(flight.id || flight.flightNumber) ? 'rgba(229,193,88,0.22)' : 'rgba(255,255,255,0.05)',
                          border: comparedFlightIds.includes(flight.id || flight.flightNumber) ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.15)',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.76rem',
                          color: comparedFlightIds.includes(flight.id || flight.flightNumber) ? 'var(--color-gold-bright)' : '#CBD5E1',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                          userSelect: 'none'
                        }}>
                          <input
                            type="checkbox"
                            checked={comparedFlightIds.includes(flight.id || flight.flightNumber)}
                            onChange={() => toggleCompareFlight(flight.id || flight.flightNumber)}
                            style={{ accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                          />
                          <Columns size={13} />
                          {comparedFlightIds.includes(flight.id || flight.flightNumber) ? 'Comparing' : 'Compare'}
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', background: 'rgba(229,193,88,0.12)', border: '1px solid rgba(229,193,88,0.25)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Flight {flight.flightNumber}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          Aircraft: {flight.aircraft || 'Boeing 787-9 Dreamliner'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 600 }}>
                        <Luggage size={14} color="#10B981" />
                        {flight.baggageIncluded || '2x 23kg Checked Bags Included'}
                      </div>
                    </div>

                    {/* Departure & Arrival Schedule */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{flight.departTime}</span>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8' }}>{flight.origin}</span>
                        </div>

                        <div style={{ flex: 1, padding: '0 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block' }}>{flight.duration}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(229,193,88,0.4)' }} />
                            <Plane size={14} color="var(--color-gold)" />
                            <div style={{ flex: 1, height: '1px', background: 'rgba(229,193,88,0.4)' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: flight.stops === 0 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                            {flight.stops === 0 ? 'Nonstop Direct' : `1 Stop (${flight.stopLocation || 'Transit'})`}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{flight.arriveTime}</span>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8' }}>{flight.destination}</span>
                        </div>
                      </div>

                      {flight.seatsRemaining && (
                        <span style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600 }}>
                          🔥 Only {flight.seatsRemaining} seats left at this price
                        </span>
                      )}
                    </div>

                    {/* Price & Concierge CTA */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(7, 11, 20, 0.95) 0%, rgba(14, 21, 38, 0.95) 100%)',
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-gold-glow)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                      minWidth: '280px'
                    }}>
                      
                      {/* Side-by-Side / Stacked High Visibility Fare Comparison */}
                      <div style={{
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        marginBottom: '12px',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}>
                        {/* Public Fare Line */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            PUBLIC AIRLINE FARE:
                          </span>
                          <span style={{ fontSize: '1.05rem', color: '#F87171', fontWeight: 800, textDecoration: 'line-through' }}>
                            {formatCurrency(flight.retailPrice, currency)}
                          </span>
                        </div>

                        {/* RoyaBridge Fare Line */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                              ROYABRIDGE CONCIERGE FARE:
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Includes 24h PNR Lock</span>
                          </div>
                          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '-0.02em' }}>
                            {formatCurrency(flight.royaPrice, currency)}
                          </span>
                        </div>

                        {/* Savings Badge */}
                        <div style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px dashed rgba(229,193,88,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.75rem',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: '#FFF',
                            padding: '3px 12px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                          }}>
                            SAVE {formatCurrency(flight.retailPrice - flight.royaPrice, currency)} (30% OFF)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectFlight(flight)}
                        className="btn-gold"
                        style={{ width: '100%', padding: '12px 20px', fontSize: '0.92rem', fontWeight: 800 }}
                      >
                        <ShieldCheck size={18} />
                        Reserve Flight Before Payment
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* Floating Sticky Comparison Bar Dock */}
        {comparedFlightIds.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9000,
            background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.96) 0%, rgba(7, 11, 20, 0.98) 100%)',
            border: '1.5px solid var(--border-gold-glow)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.8), 0 0 20px rgba(229,193,88,0.2)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            maxWidth: '92%',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(229,193,88,0.2)', border: '1px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold-bright)', flexShrink: 0 }}>
                <Columns size={16} />
              </div>
              <div>
                <strong style={{ color: '#FFF', fontSize: '0.88rem', display: 'block' }}>
                  Comparing {comparedFlightIds.length} {comparedFlightIds.length === 1 ? 'Flight' : 'Flights'}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Select up to 4 flights</span>
              </div>
            </div>

            {/* Selected Flight Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '2px 0' }}>
              {selectedComparedFlights.map(f => (
                <span 
                  key={f.id || f.flightNumber} 
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(229,193,88,0.3)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    color: '#FFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <strong>{f.flightNumber}</strong> ({formatCurrency(f.royaPrice, currency)})
                  <button 
                    onClick={() => toggleCompareFlight(f.id || f.flightNumber)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, display: 'flex' }}
                    title="Remove from comparison"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={() => setComparedFlightIds([])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                Clear
              </button>

              <button
                onClick={() => setIsComparisonOpen(true)}
                className="btn-gold"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(229,193,88,0.3)'
                }}
              >
                <Columns size={16} /> Compare Side-by-Side
              </button>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Modal */}
        {isComparisonOpen && (
          <FlightComparisonModal 
            selectedFlights={selectedComparedFlights}
            currency={currency}
            onClose={() => setIsComparisonOpen(false)}
            onSelectFlight={onSelectFlight}
            onRemoveFlight={(flightId) => {
              setComparedFlightIds(prev => prev.filter(id => id !== flightId));
              if (comparedFlightIds.length <= 1) {
                setIsComparisonOpen(false);
              }
            }}
            onClearAll={() => {
              setComparedFlightIds([]);
              setIsComparisonOpen(false);
            }}
          />
        )}

      </div>
    </section>
  );
}
