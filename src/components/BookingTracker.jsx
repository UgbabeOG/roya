import React, { useState } from 'react';
import { Search, ShieldCheck, X, Clock, Plane, Activity, CheckCircle2, AlertCircle, RefreshCw, User, Mail, Phone, Tag, Share2 } from 'lucide-react';
import { formatCurrency } from '../utils/pnrGenerator';
import { lookupBookingFromDatabase } from '../lib/bookingsService';

export default function BookingTracker({ isOpen, onClose, onOpenChat, onOpenShare, showToast, currency = 'USD' }) {
  const [tab, setTab] = useState('pnr'); // 'pnr' | 'flight'
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState(null);
  const [flightStatus, setFlightStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePnrSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter your 6-character PNR code, full legal name, or email address.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const bookingData = await lookupBookingFromDatabase(searchInput);
      if (bookingData) {
        setResult(bookingData);
        if (showToast) {
          showToast({
            type: 'success',
            title: 'PNR Hold Found in DB!',
            message: `Retrieved confirmed booking for ${bookingData.passenger} (${bookingData.route}).`,
            pnr: bookingData.pnr
          });
        }
      } else {
        setError(`No active reservation hold found matching "${searchInput}". Please check your 6-character PNR code or email address.`);
      }
    } catch (err) {
      console.error('PNR lookup error:', err);
      setError('Failed to query database. Please check your search code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlightStatusSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter a flight number (e.g. BA178, EK202, DL3).');
      return;
    }
    setError('');
    setLoading(true);
    setFlightStatus(null);

    try {
      const res = await fetch('/api/flights/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightNumber: searchInput })
      });
      const data = await res.json();
      if (data.success && data.status) {
        setFlightStatus(data.status);
      } else {
        setError(data.error || 'Flight status not found.');
      }
    } catch (err) {
      setError('Failed to reach real-time flight status API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '560px',
        width: '100%',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="var(--color-gold)" />
            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.4rem' }}>
              Flight Lookup & Tracking
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: 'rgba(7, 11, 20, 0.6)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('pnr'); setError(''); setResult(null); setFlightStatus(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'pnr' ? 'var(--color-gold)' : 'transparent',
              color: tab === 'pnr' ? '#070B14' : '#CBD5E1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Track PNR Hold
          </button>
          <button
            type="button"
            onClick={() => { setTab('flight'); setError(''); setResult(null); setFlightStatus(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'flight' ? 'var(--color-gold)' : 'transparent',
              color: tab === 'flight' ? '#070B14' : '#CBD5E1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Check Live Flight Status
          </button>
        </div>

        {/* PNR Tab */}
        {tab === 'pnr' && (
          <div>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '16px' }}>
              Enter your 6-character PNR reference code to inspect your locked itinerary status and hold countdown.
            </p>

            <form onSubmit={handlePnrSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="e.g. RB8K92, Full Name, or email@domain.com"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(7, 11, 20, 0.8)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '12px 20px' }} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Searching...' : 'Search DB'}
              </button>
            </form>

            {/* Loading Skeleton */}
            {loading && (
              <div style={{
                background: 'rgba(7, 11, 20, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(229, 193, 88, 0.2)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                  animation: 'skeletonShimmer 1.5s infinite'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ width: '120px', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '160px', height: '24px', background: 'rgba(229,193,88,0.2)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '100px', height: '28px', background: 'rgba(16,185,129,0.2)', borderRadius: '20px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ width: '80%', height: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
                  ))}
                </div>

                <div style={{ width: '100%', height: '40px', background: 'rgba(229,193,88,0.15)', borderRadius: 'var(--radius-sm)' }} />
              </div>
            )}

            {!loading && result && (
              <div style={{
                background: 'rgba(7, 11, 20, 0.9)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>DATABASE PNR RECORD</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '0.05em' }}>
                      {result.pnr}
                    </div>
                  </div>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    border: '1px solid #10B981',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {result.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.86rem', color: '#CBD5E1', marginBottom: '16px' }}>
                  <div><strong>Lead Passenger:</strong> {result.passenger}</div>
                  <div><strong>Email:</strong> {result.email || 'N/A'}</div>
                  <div><strong>Flight:</strong> {result.airline} ({result.flightNumber})</div>
                  <div><strong>Cabin:</strong> {result.cabin}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Route:</strong> {result.route}</div>
                  <div><strong>Depart Date:</strong> {result.departDate}</div>
                  {result.returnDate && <div><strong>Return Date:</strong> {result.returnDate}</div>}
                  <div><strong>Total Fare:</strong> {formatCurrency(result.totalFare, currency)}</div>
                  <div><strong>Saved:</strong> <span style={{ color: '#6EE7B7', fontWeight: 700 }}>{formatCurrency(result.savedAmount, currency)}</span></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>24h Hold Expiry Countdown</span>
                  <span style={{ color: '#6EE7B7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem' }}>
                    <Clock size={15} /> {result.holdExpires}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {onOpenShare && (
                    <button 
                      onClick={() => {
                        const routeParts = (result.route || '').split('→').map(s => s.trim());
                        onOpenShare({
                          type: 'pnr',
                          pnrNumber: result.pnr,
                          origin: routeParts[0] || 'JFK',
                          destination: routeParts[1] || 'LHR',
                          departDate: result.departDate,
                          returnDate: result.returnDate,
                          cabinClass: result.cabin,
                          passengers: result.passengers || 1,
                          airline: result.airline,
                          flightNumber: result.flightNumber,
                          royaPrice: result.totalFare,
                          savings: result.savedAmount
                        });
                      }}
                      className="btn-outline-gold" 
                      style={{ flex: 1, padding: '11px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Share2 size={16} />
                      Share Reserved Itinerary
                    </button>
                  )}
                  <button onClick={onOpenChat} className="btn-gold" style={{ flex: 1, padding: '11px', fontSize: '0.88rem' }}>
                    Message Concierge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Flight Status Tab */}
        {tab === 'flight' && (
          <div>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '16px' }}>
              Check real-time flight status, departure terminal, gate, and schedule by flight number.
            </p>

            <form onSubmit={handleFlightStatusSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="e.g. BA178, EK202, DL3"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(7, 11, 20, 0.8)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '12px 20px' }} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Querying...' : 'Check Status'}
              </button>
            </form>

            {/* Loading Skeleton */}
            {loading && (
              <div style={{
                background: 'rgba(7, 11, 20, 0.8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(229, 193, 88, 0.2)',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                  animation: 'skeletonShimmer 1.5s infinite'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '140px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                  <div style={{ width: '80px', height: '24px', background: 'rgba(16,185,129,0.2)', borderRadius: '12px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ width: '75%', height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
                  ))}
                </div>
              </div>
            )}

            {!loading && flightStatus && (
              <div style={{
                background: 'rgba(7, 11, 20, 0.8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-gold)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-bright)', fontWeight: 700 }}>LIVE FLIGHT DETAILS</span>
                    <h3 style={{ fontSize: '1.3rem', color: '#FFF', fontWeight: 800 }}>{flightStatus.flightNumber} ({flightStatus.airline})</h3>
                  </div>
                  <span style={{
                    background: flightStatus.status === 'On Time' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                    color: flightStatus.status === 'On Time' ? '#10B981' : '#F59E0B',
                    border: `1px solid ${flightStatus.status === 'On Time' ? '#10B981' : '#F59E0B'}`,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    {flightStatus.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem', color: '#CBD5E1' }}>
                  <div><strong>Route:</strong> {flightStatus.origin} → {flightStatus.destination}</div>
                  <div><strong>Aircraft:</strong> {flightStatus.aircraft}</div>
                  <div><strong>Terminal:</strong> {flightStatus.departureTerminal}</div>
                  <div><strong>Gate:</strong> {flightStatus.departureGate}</div>
                  <div><strong>Scheduled Dep:</strong> {flightStatus.scheduledDeparture}</div>
                  <div><strong>Est. Arrival:</strong> {flightStatus.estimatedArrival}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '16px' }}>{error}</p>
        )}

      </div>
    </div>
  );
}

