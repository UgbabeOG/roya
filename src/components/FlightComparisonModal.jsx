import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap, Award, Sparkles, Luggage, Plane, Clock, Trash2 } from 'lucide-react';
import AirlineLogo from './AirlineLogo';
import { formatCurrency } from '../utils/pnrGenerator';

export default function FlightComparisonModal({
  selectedFlights = [],
  currency = 'USD',
  onClose,
  onSelectFlight,
  onRemoveFlight,
  onClearAll
}) {
  if (!selectedFlights || selectedFlights.length === 0) return null;

  // Find lowest price and fastest duration among selected flights
  const lowestPrice = Math.min(...selectedFlights.map(f => f.royaPrice));
  const fastestMinutes = Math.min(...selectedFlights.map(f => {
    // Parse duration like "7h 30m" into total minutes
    const durStr = f.duration || '';
    const hMatch = durStr.match(/(\d+)h/);
    const mMatch = durStr.match(/(\d+)m/);
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
    return (hours * 60) + mins || 999;
  }));

  const parseDurationMins = (durStr = '') => {
    const hMatch = durStr.match(/(\d+)h/);
    const mMatch = durStr.match(/(\d+)m/);
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
    return (hours * 60) + mins || 999;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(5, 8, 16, 0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: selectedFlights.length > 2 ? '1100px' : '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.98) 0%, rgba(7, 11, 20, 0.99) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
          padding: '28px 32px',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="gold-badge" style={{ fontSize: '0.78rem' }}>
                <Sparkles size={14} /> Side-by-Side Fare Matrix
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Comparing {selectedFlights.length} {selectedFlights.length === 1 ? 'Flight' : 'Flights'}
              </span>
            </div>
            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>
              Flight Offer Comparison
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onClearAll}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Trash2 size={14} /> Clear Selection
            </button>

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Close Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Comparison Table Grid Container */}
        <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '12px 0',
            minWidth: '600px'
          }}>
            <thead>
              <tr>
                <th style={{ width: '180px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#94A3B8', textAlign: 'left', paddingBottom: '16px' }}>
                  Features / Flight
                </th>
                {selectedFlights.map((flight) => (
                  <th key={flight.id || flight.flightNumber} style={{ width: `${80 / selectedFlights.length}%`, verticalAlign: 'top', paddingBottom: '16px' }}>
                    <div style={{
                      background: 'rgba(7, 11, 20, 0.8)',
                      border: '1.5px solid var(--border-gold)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      position: 'relative',
                      textAlign: 'center'
                    }}>
                      <button
                        onClick={() => onRemoveFlight(flight.id || flight.flightNumber)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: 'none',
                          borderRadius: '50%',
                          color: '#CBD5E1',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove flight"
                      >
                        <X size={14} />
                      </button>

                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <AirlineLogo code={flight.airlineCode} name={flight.airline} size="lg" />
                      </div>

                      <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block' }}>
                        {flight.airline}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                        {flight.flightNumber}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Row 1: Total Price (Concierge Rate) */}
              <tr>
                <td style={{ padding: '16px 12px', color: 'var(--color-gold-bright)', fontWeight: 800, fontSize: '0.85rem', verticalAlign: 'middle' }}>
                  Concierge Price
                </td>
                {selectedFlights.map((flight) => {
                  const isCheapest = flight.royaPrice === lowestPrice && selectedFlights.length > 1;
                  return (
                    <td key={`price-${flight.id || flight.flightNumber}`} style={{
                      padding: '16px',
                      background: isCheapest ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCheapest ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'center'
                    }}>
                      {isCheapest && (
                        <span style={{ fontSize: '0.68rem', background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, display: 'inline-block', marginBottom: '4px' }}>
                          ★ LOWEST PRICE
                        </span>
                      )}
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-gold-bright)' }}>
                        {formatCurrency(flight.royaPrice, currency)}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Public Retail Price */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                  Public Fare
                </td>
                {selectedFlights.map((flight) => (
                  <td key={`retail-${flight.id || flight.flightNumber}`} style={{ padding: '14px', textAlign: 'center', color: '#F87171', textDecoration: 'line-through', fontWeight: 700 }}>
                    {formatCurrency(flight.retailPrice, currency)}
                  </td>
                ))}
              </tr>

              {/* Row 3: Discount Savings */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#6EE7B7', fontWeight: 700, fontSize: '0.82rem' }}>
                  Total Savings
                </td>
                {selectedFlights.map((flight) => (
                  <td key={`save-${flight.id || flight.flightNumber}`} style={{ padding: '14px', textAlign: 'center', color: '#6EE7B7', fontWeight: 800 }}>
                    Save {formatCurrency(flight.retailPrice - flight.royaPrice, currency)} (30%)
                  </td>
                ))}
              </tr>

              {/* Row 4: Flight Duration */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#CBD5E1', fontWeight: 700, fontSize: '0.82rem' }}>
                  Flight Duration
                </td>
                {selectedFlights.map((flight) => {
                  const flightMins = parseDurationMins(flight.duration);
                  const isFastest = flightMins === fastestMinutes && selectedFlights.length > 1;
                  return (
                    <td key={`dur-${flight.id || flight.flightNumber}`} style={{
                      padding: '14px',
                      textAlign: 'center',
                      background: isFastest ? 'rgba(229, 193, 88, 0.12)' : 'transparent',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {isFastest && (
                        <span style={{ fontSize: '0.68rem', background: 'var(--color-gold)', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, display: 'inline-block', marginBottom: '4px' }}>
                          ⚡ FASTEST
                        </span>
                      )}
                      <div style={{ color: '#FFF', fontWeight: 800, fontSize: '1rem' }}>
                        {flight.duration}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Stops & Layover */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#CBD5E1', fontWeight: 700, fontSize: '0.82rem' }}>
                  Stops & Routing
                </td>
                {selectedFlights.map((flight) => (
                  <td key={`stops-${flight.id || flight.flightNumber}`} style={{ padding: '14px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: flight.stops === 0 ? '#10B981' : '#F59E0B',
                      background: flight.stops === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      {flight.stops === 0 ? 'Direct Nonstop' : `1 Stop (${flight.stopLocation || 'Transit'})`}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 6: Departure & Arrival Times */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#CBD5E1', fontWeight: 700, fontSize: '0.82rem' }}>
                  Schedule
                </td>
                {selectedFlights.map((flight) => (
                  <td key={`sched-${flight.id || flight.flightNumber}`} style={{ padding: '14px', textAlign: 'center', color: '#FFF', fontSize: '0.88rem' }}>
                    <strong>{flight.departTime}</strong> ({flight.origin})
                    <ArrowRight size={12} style={{ margin: '0 6px', color: 'var(--color-gold)' }} />
                    <strong>{flight.arriveTime}</strong> ({flight.destination})
                  </td>
                ))}
              </tr>

              {/* Row 7: Aircraft Type */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                  Aircraft
                </td>
                {selectedFlights.map((flight) => (
                  <td key={`air-${flight.id || flight.flightNumber}`} style={{ padding: '14px', textAlign: 'center', color: '#CBD5E1', fontSize: '0.82rem' }}>
                    {flight.aircraft || 'Boeing 787-9 Dreamliner'}
                  </td>
                ))}
              </tr>

              {/* Row 8: Baggage Allowance */}
              <tr>
                <td style={{ padding: '14px 12px', color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                  Baggage
                </td>
                {selectedFlights.map((flight) => (
                  <td key={`bag-${flight.id || flight.flightNumber}`} style={{ padding: '14px', textAlign: 'center', color: '#6EE7B7', fontSize: '0.82rem', fontWeight: 600 }}>
                    <Luggage size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {flight.baggageIncluded || '2x 23kg Checked Included'}
                  </td>
                ))}
              </tr>

              {/* Row 9: Reserve Action CTA */}
              <tr>
                <td style={{ padding: '20px 12px 10px' }}></td>
                {selectedFlights.map((flight) => (
                  <td key={`cta-${flight.id || flight.flightNumber}`} style={{ padding: '20px 8px 10px', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectFlight(flight);
                      }}
                      className="btn-gold"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        justifyContent: 'center'
                      }}
                    >
                      <ShieldCheck size={16} />
                      Reserve This Flight
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
