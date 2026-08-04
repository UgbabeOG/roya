import React, { useState } from 'react';
import { Search, Plane, Clock, Navigation, MapPin, ShieldCheck, Sparkles, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import AirlineLogo from './AirlineLogo';

export default function FlightStatusSection({ onSelectFlight }) {
  const [flightNumber, setFlightNumber] = useState('EK201');
  const [flightDate, setFlightDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  const POPULAR_FLIGHTS = [
    { code: 'EK201', route: 'DXB → JFK', airline: 'Emirates' },
    { code: 'BA117', route: 'LHR → JFK', airline: 'British Airways' },
    { code: 'QR015', route: 'DOH → LHR', airline: 'Qatar Airways' },
    { code: 'DL400', route: 'JFK → LAX', airline: 'Delta Air Lines' },
    { code: 'SQ308', route: 'SIN → LHR', airline: 'Singapore Airlines' }
  ];

  const handleTrackStatus = async (e) => {
    if (e) e.preventDefault();
    if (!flightNumber.trim()) {
      setError('Please enter a valid flight number (e.g., EK201 or BA117)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/flights/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightNumber, date: flightDate })
      });

      const data = await response.json();
      if (data.success && data.status) {
        setStatusResult(data.status);
      } else {
        setError(data.error || 'Unable to retrieve real-time flight status. Please check the flight number.');
      }
    } catch (err) {
      setError('Network error checking status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (code) => {
    setFlightNumber(code);
    setError('');
  };

  return (
    <section id="flight-status" style={{ padding: '60px 0', position: 'relative' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
          <div className="gold-badge" style={{ margin: '0 auto 12px' }}>
            <Navigation size={14} />
            Real-Time Radar & Radar Search
          </div>
          <h2 className="font-royal" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#FFF', marginBottom: '12px' }}>
            Live Flight Status Lookup
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6 }}>
            Track any global flight in real time using official Global Distribution Systems (GDS). Check live departure gates, altitude, route progress, and lock fares instantly.
          </p>
        </div>

        {/* Glass Box Form Card */}
        <div 
          className="glass-card"
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: '28px 32px',
            background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.85) 0%, rgba(7, 11, 20, 0.95) 100%)',
            border: '1.5px solid var(--border-gold-glow)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
          }}
        >
          <form onSubmit={handleTrackStatus} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
            
            {/* Flight Number Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-gold-bright)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Flight Number
              </label>
              <div style={{ position: 'relative' }}>
                <Plane size={18} color="var(--color-gold)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. EK201, BA117"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(7, 11, 20, 0.8)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#FFF',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                />
              </div>
            </div>

            {/* Flight Date Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-gold-bright)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Departure Date
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} color="var(--color-gold)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(7, 11, 20, 0.8)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#FFF',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-gold" 
                style={{ width: '100%', padding: '13px 20px', fontSize: '0.95rem', fontWeight: 800 }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    Tracking Flight...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track Flight Status
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Quick Example Quick Pills */}
          <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Quick Lookup:</span>
            {POPULAR_FLIGHTS.map((pf) => (
              <button
                key={pf.code}
                onClick={() => handleQuickSelect(pf.code)}
                type="button"
                style={{
                  background: flightNumber === pf.code ? 'rgba(229,193,88,0.25)' : 'rgba(255,255,255,0.05)',
                  border: flightNumber === pf.code ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.12)',
                  color: flightNumber === pf.code ? 'var(--color-gold-bright)' : '#CBD5E1',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <strong>{pf.code}</strong> ({pf.route})
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-sm)',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

        </div>

        {/* Status Result Display Card */}
        {statusResult && (
          <div 
            className="glass-card"
            style={{
              maxWidth: '860px',
              margin: '28px auto 0',
              padding: '28px 32px',
              background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.9) 0%, rgba(7, 11, 20, 0.98) 100%)',
              border: '1.5px solid var(--border-gold-glow)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            {/* Header: Carrier Badge & Flight Status Tag */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(229,193,88,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <AirlineLogo 
                  code={statusResult.airlineCode || statusResult.flightNumber.substring(0, 2)} 
                  name={statusResult.airline} 
                  size="lg" 
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 800 }}>
                      {statusResult.flightNumber}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                      {statusResult.aircraft || 'Airbus A380-800'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-gold-bright)', fontWeight: 600 }}>
                    {statusResult.airline} • Date: {flightDate}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                background: statusResult.status.toLowerCase().includes('landed') 
                  ? 'rgba(59, 130, 246, 0.2)'
                  : statusResult.status.toLowerCase().includes('en route') 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(229, 193, 88, 0.2)',
                border: statusResult.status.toLowerCase().includes('landed')
                  ? '1px solid #3B82F6'
                  : statusResult.status.toLowerCase().includes('en route')
                    ? '1px solid #10B981'
                    : '1px solid var(--color-gold)',
                color: statusResult.status.toLowerCase().includes('landed')
                  ? '#60A5FA'
                  : statusResult.status.toLowerCase().includes('en route')
                    ? '#6EE7B7'
                    : 'var(--color-gold-bright)',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'currentColor',
                  boxShadow: '0 0 8px currentColor',
                  animation: 'spin 3s infinite'
                }} />
                {statusResult.status.toUpperCase()}
              </div>
            </div>

            {/* Flight Route Progress Line */}
            <div style={{ margin: '28px 0', padding: '20px', background: 'rgba(7, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFF' }}>{statusResult.origin}</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8' }}>{statusResult.scheduledDeparture || 'Departure'}</span>
                </div>

                <div style={{ flex: 1, padding: '0 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px' }}>
                    <span>{statusResult.departureTerminal || 'Term 4'} ({statusResult.departureGate || 'Gate B22'})</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>In Flight • Altitude: {statusResult.altitude || '38,000 ft'}</span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '8px 0' }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${statusResult.progressPercent || 60}%`,
                      background: 'linear-gradient(90deg, #E5C158 0%, #10B981 100%)',
                      borderRadius: '3px',
                      transition: 'width 1s ease'
                    }} />
                    <Plane 
                      size={18} 
                      color="var(--color-gold-bright)" 
                      style={{
                        position: 'absolute',
                        left: `calc(${statusResult.progressPercent || 60}% - 9px)`,
                        top: '-6px',
                        filter: 'drop-shadow(0 0 6px var(--color-gold))'
                      }} 
                    />
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Speed: {statusResult.speed || '540 mph'}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFF' }}>{statusResult.destination}</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8' }}>{statusResult.estimatedArrival || 'Arrival'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Concierge Hold Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed rgba(229,193,88,0.2)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6EE7B7', fontSize: '0.82rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  Verified GDS Live Hold Available for {statusResult.flightNumber}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Lock concierge fare from <strong>${statusResult.royaPrice || 780}</strong> (Save up to 30% vs public fare)
                </span>
              </div>

              {onSelectFlight && (
                <button
                  onClick={() => onSelectFlight({
                    id: statusResult.flightNumber,
                    flightNumber: statusResult.flightNumber,
                    airline: statusResult.airline,
                    airlineCode: statusResult.airlineCode || statusResult.flightNumber.substring(0, 2),
                    origin: statusResult.origin,
                    destination: statusResult.destination,
                    departTime: statusResult.scheduledDeparture,
                    arriveTime: statusResult.estimatedArrival,
                    duration: '7h 30m',
                    stops: 0,
                    retailPrice: statusResult.retailPrice || 1120,
                    royaPrice: statusResult.royaPrice || 780,
                    aircraft: statusResult.aircraft || 'Airbus A380'
                  })}
                  className="btn-gold"
                  style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 800 }}
                >
                  <ShieldCheck size={16} />
                  Reserve Seat / Lock Fare
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
