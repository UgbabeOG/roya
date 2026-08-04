import React from 'react';
import { Plane, ShieldCheck, Sparkles, Clock, DollarSign, MessageCircle, ArrowRight, Star, Globe2 } from 'lucide-react';
import AirlineLogos from './AirlineLogos';

export default function Hero({ onStartSearch, onOpenChat }) {
  return (
    <section style={{
      position: 'relative',
      minHeight: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingTop: 'clamp(80px, 12vw, 130px)',
      paddingBottom: 'clamp(35px, 6vw, 70px)',
      backgroundImage: `linear-gradient(180deg, rgba(5, 8, 17, 0.72) 0%, rgba(5, 8, 17, 0.88) 60%, rgba(5, 8, 17, 1) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2200&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'scroll',
      overflow: 'hidden'
    }}>
      
      {/* Ambient Glowing Orbs */}
      <div className="glow-bg" style={{
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(700px, 90vw)',
        height: '350px',
        background: 'radial-gradient(circle, rgba(229, 193, 88, 0.25) 0%, rgba(0,0,0,0) 70%)'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        
        {/* Floating Aircraft Graphic Asset over Beach Visual */}
        <div style={{
          marginBottom: '14px',
          display: 'inline-block',
          position: 'relative'
        }}>
          <div className="animate-plane" style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'clamp(64px, 14vw, 90px)',
            height: 'clamp(64px, 14vw, 90px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 193, 88, 0.35) 0%, rgba(10, 15, 30, 0.9) 100%)',
            border: '2px solid var(--color-gold)',
            boxShadow: '0 0 25px rgba(229, 193, 88, 0.4)'
          }}>
            <Plane style={{
              width: 'clamp(32px, 7vw, 48px)',
              height: 'clamp(32px, 7vw, 48px)',
              transform: 'rotate(-25deg)',
              color: 'var(--color-gold-bright)',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
            }} />
          </div>

          {/* Floating Micro Badge */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-20px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#FFF',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap'
          }}>
            ✈ LIVE FLIGHT HOLDS
          </div>
        </div>

        {/* Top Announcement Badge */}
        <div style={{ marginBottom: '14px' }}>
          <span className="gold-badge" style={{ fontSize: 'clamp(0.72rem, 2.5vw, 0.82rem)', padding: '4px 12px' }}>
            <Sparkles size={14} color="var(--color-gold-bright)" />
            Worldwide Flight Concierge • Domestic & International
          </span>
        </div>

        {/* Main Title - ROYABRIDGE TRAVELS */}
        <h1 className="font-royal" style={{
          fontSize: 'clamp(1.85rem, 6.5vw, 5.2rem)',
          fontWeight: 900,
          letterSpacing: '0.03em',
          color: '#FFF',
          textShadow: '0 6px 35px rgba(0,0,0,0.9)',
          marginBottom: '4px',
          lineHeight: 1.15,
          wordBreak: 'break-word'
        }}>
          <span className="gold-gradient-text">ROYABRIDGE TRAVELS</span>
        </h1>

        {/* Brand Subtitle: "Create Unforgettable Memories" */}
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(1.05rem, 2.8vw, 1.85rem)',
          fontWeight: 300,
          color: '#F8FAFC',
          marginBottom: '22px',
          letterSpacing: '0.06em',
          textShadow: '0 2px 12px rgba(0,0,0,0.7)',
          fontStyle: 'italic'
        }}>
          Create Unforgettable Memories
        </p>

        {/* Hero Offer Glass Card */}
        <div className="glass-card" style={{
          maxWidth: '880px',
          margin: '0 auto 28px',
          padding: 'clamp(16px, 4vw, 32px)',
          background: 'linear-gradient(180deg, rgba(12, 18, 34, 0.88) 0%, rgba(5, 8, 17, 0.94) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.05rem, 3.2vw, 1.85rem)',
            fontWeight: 800,
            color: 'var(--color-gold-bright)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            lineHeight: 1.3
          }}>
            SAVE UP TO 30% ON FLIGHTS TO ANY DESTINATION WORLDWIDE
          </h2>
          <p style={{
            color: '#CBD5E1',
            fontSize: 'clamp(0.88rem, 2vw, 1.05rem)',
            marginTop: '8px',
            fontWeight: 500,
            lineHeight: 1.45
          }}>
            Discover the World, Save Big and Travel Better with our Private Airfare Concierge.
          </p>

          {/* Value Feature Badges with Micro-Animations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            marginTop: '20px'
          }}>
            <div style={badgeItemStyle}>
              <Clock size={16} color="var(--color-gold)" />
              <span>Fast Assistance</span>
            </div>
            <div style={badgeItemStyle}>
              <DollarSign size={16} color="var(--color-gold)" />
              <span>Wholesale Airfares</span>
            </div>
            <div style={badgeItemStyle}>
              <ShieldCheck size={16} color="var(--color-gold)" />
              <span>Reserve Before Payment</span>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={onStartSearch}
            className="btn-gold pulse-glow"
            style={{ padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 38px)', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}
          >
            <Plane size={18} />
            Search & Reserve Flights
            <ArrowRight size={16} />
          </button>

          <button 
            onClick={onOpenChat}
            className="btn-outline-gold"
            style={{ padding: 'clamp(12px, 3vw, 15px) clamp(18px, 4vw, 34px)', fontSize: 'clamp(0.88rem, 2.5vw, 1.02rem)' }}
          >
            <MessageCircle size={18} />
            Send Us A Message
          </button>
        </div>

        {/* Bottom Micro Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(16px, 4vw, 48px)',
          marginTop: 'clamp(28px, 5vw, 50px)',
          flexWrap: 'wrap',
          color: 'var(--color-text-muted)',
          fontSize: 'clamp(0.78rem, 2vw, 0.9rem)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', flexShrink: 0 }} />
            <span><strong>100% Valid PNR</strong> Embassy Flight Holds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={15} fill="var(--color-gold)" color="var(--color-gold)" style={{ flexShrink: 0 }} />
            <span><strong>4.95 / 5.0 Rating</strong> Verified Reviews</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe2 size={15} color="var(--color-gold)" style={{ flexShrink: 0 }} />
            <span><strong>Global Support</strong> 24/7 Assistance</span>
          </div>
        </div>

      </div>

      {/* Airline Partner Logos Showcase Bar */}
      <div style={{ marginTop: '20px' }}>
        <AirlineLogos />
      </div>

    </section>
  );
}

const badgeItemStyle = {
  background: 'rgba(5, 8, 17, 0.75)',
  border: '1px solid rgba(229, 193, 88, 0.3)',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: '#E2E8F0',
  fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
  fontWeight: '600',
  transition: 'all 0.3s ease'
};
