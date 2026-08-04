import React from 'react';
import { Globe2, Zap, Tag, Headphones, ShieldCheck, Compass, HeartHandshake } from 'lucide-react';

export default function FeatureGrid({ onOpenSearch, onOpenChat }) {
  const features = [
    {
      icon: <Globe2 size={28} color="var(--color-gold-bright)" />,
      title: "Domestic & International Flights",
      description: "Fly seamlessly across major airlines worldwide with access to exclusive route allocations and private global inventories."
    },
    {
      icon: <Zap size={28} color="var(--color-gold-bright)" />,
      title: "Fast Booking Assistance",
      description: "Our concierge team processes custom flight requests, seat locks, and itinerary setups in under 15 minutes."
    },
    {
      icon: <Tag size={28} color="var(--color-gold-bright)" />,
      title: "Competitive Airfares (Up to 30% Off)",
      description: "Save up to 30% off published retail airline prices through our direct corporate and travel agency wholesale connections."
    },
    {
      icon: <ShieldCheck size={28} color="var(--color-gold-bright)" />,
      title: "Reserve Your Flight Before Payment",
      description: "Lock in your flight itinerary with a 24-48 hour valid airline PNR hold. Zero payment required until you confirm."
    },
    {
      icon: <Headphones size={28} color="var(--color-gold-bright)" />,
      title: "Friendly Customer Support",
      description: "24/7 dedicated travel concierge agents available via WhatsApp, phone, or live chat to resolve any schedule updates."
    },
    {
      icon: <Compass size={28} color="var(--color-gold-bright)" />,
      title: "Discover the World, Save Big & Travel Better",
      description: "Tailored luxury travel solutions designed to make every journey memorable, stress-free, and cost-effective."
    }
  ];

  return (
    <section id="about" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="gold-badge">Why Choose RoyaBridge Travels</span>
          <h2>The Gold Standard in Flight Concierge</h2>
          <p>
            We combine personal travel assistance with wholesale airline rates to give you unbeatable savings and maximum flexibility.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {features.map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '32px 28px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(229, 193, 88, 0.12)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '10px' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Highlight Card */}
        <div className="glass-card" style={{
          marginTop: '48px',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.15) 0%, rgba(14, 21, 38, 0.95) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          border: '1.5px solid var(--border-gold-glow)'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <span className="gold-badge" style={{ marginBottom: '12px' }}>
              <HeartHandshake size={14} color="var(--color-gold)" />
              Zero Risk Guarantee
            </span>
            <h3 className="font-royal" style={{ fontSize: '1.8rem', color: '#FFF', marginTop: '8px', marginBottom: '10px' }}>
              Reserve Flight Holds Free For Up To 48 Hours
            </h3>
            <p style={{ color: '#CBD5E1', fontSize: '1.02rem' }}>
              Need a valid flight reservation for visa processing or travel approval? We generate verified GDS / airline PNR itineraries with zero upfront payment required.
            </p>
          </div>
          <button 
            onClick={onOpenSearch}
            className="btn-gold"
            style={{ padding: '14px 32px', fontSize: '1rem' }}
          >
            Reserve Your Flight Now
          </button>
        </div>

      </div>
    </section>
  );
}
