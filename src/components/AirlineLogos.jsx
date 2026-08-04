import React from 'react';
import { ShieldCheck, Award, Sparkles } from 'lucide-react';
import AirlineLogo from './AirlineLogo';

export const PARTNER_AIRLINES = [
  { code: 'EK', name: 'Emirates', tagline: 'First & Business Holds', discount: 'Save up to 30%' },
  { code: 'QR', name: 'Qatar Airways', tagline: 'World’s Best Airline 2026', discount: 'Qsuite Concierge' },
  { code: 'SQ', name: 'Singapore Airlines', tagline: '5-Star Global Service', discount: 'Wholesale Rates' },
  { code: 'BA', name: 'British Airways', tagline: 'Club World Holds', discount: 'Save $1,200+' },
  { code: 'LH', name: 'Lufthansa Group', tagline: 'Premium Hubs', discount: 'Free 24h PNR Hold' },
  { code: 'DL', name: 'Delta Air Lines', tagline: 'Delta One Access', discount: 'Global Rate Lock' },
  { code: 'AF', name: 'Air France', tagline: 'La Première Class', discount: 'Visa Itineraries' },
  { code: 'EY', name: 'Etihad Airways', tagline: 'Luxury Business', discount: 'Instant Reserve' },
  { code: 'QF', name: 'Qantas', tagline: 'Pacific & Asia Routes', discount: 'Verified Live Seats' },
  { code: 'TK', name: 'Turkish Airlines', tagline: 'Fly 120+ Countries', discount: '30% Off Concierge' },
  { code: 'UA', name: 'United Airlines', tagline: 'Polaris Business', discount: 'Instant PNR Hold' },
  { code: 'VS', name: 'Virgin Atlantic', tagline: 'Upper Class Suite', discount: 'Exclusive Fares' }
];

export default function AirlineLogos() {
  // Duplicate list to achieve a seamless loop for autoplay marquee
  const extendedList = [...PARTNER_AIRLINES, ...PARTNER_AIRLINES];

  return (
    <div style={{
      width: '100%',
      padding: '20px 0 28px',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container">
        
        {/* Header Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-gold-bright)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} color="var(--color-gold-bright)" />
            Official Concierge Partner Ticketing & 400+ Global Carrier Access
          </span>
        </div>

        {/* Autoplay Infinite Marquee Carousel */}
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {extendedList.map((airline, idx) => (
              <div
                key={`${airline.code}-${idx}`}
                className="glass-card"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.85) 0%, rgba(7, 11, 20, 0.95) 100%)',
                  border: '1.5px solid var(--border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                <AirlineLogo code={airline.code} name={airline.name} size="md" showName={false} />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 800 }}>
                      {airline.name}
                    </strong>
                    <span style={{
                      fontSize: '0.65rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#6EE7B7',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      Hold ✓
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-bright)', display: 'block', fontWeight: 600, marginTop: '2px' }}>
                    {airline.discount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Micro Footer Trust Strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          marginTop: '16px',
          fontSize: '0.76rem',
          color: '#94A3B8',
          flexWrap: 'wrap'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={13} color="#10B981" /> Direct GDS Reservation Engine
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Award size={13} color="var(--color-gold)" /> Verified Live Airline PNR Holds
          </span>
        </div>

      </div>
    </div>
  );
}

