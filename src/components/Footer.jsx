import React from 'react';
import { Phone, Mail, MapPin, ArrowUp, Facebook, Instagram, Twitter, MessageCircle, Lock } from 'lucide-react';

export default function Footer({ onOpenChat, onOpenContact, onOpenAdmin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: '#04070D',
      borderTop: '1px solid rgba(229, 193, 88, 0.2)',
      paddingTop: '64px',
      paddingBottom: '32px',
      position: 'relative'
    }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#070B14',
                fontWeight: 900
              }}>
                RB
              </div>
              <span className="font-royal" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                ROYABRIDGE TRAVELS
              </span>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Discover the World, Save Big and Travel Better. Premier concierge flight booking service offering up to 30% savings on domestic & international flights worldwide with reserve before payment guarantees.
            </p>

            {/* Social Media Icons (Facebook, Instagram, Twitter, WhatsApp) */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <a 
                href="https://facebook.com/royabridgetravels" 
                target="_blank" 
                rel="noreferrer"
                style={socialIconStyle}
                title="Follow RoyaBridge Travels on Facebook"
              >
                <Facebook size={18} />
              </a>

              <a 
                href="https://instagram.com/royabridgetravels" 
                target="_blank" 
                rel="noreferrer"
                style={socialIconStyle}
                title="Follow RoyaBridge Travels on Instagram"
              >
                <Instagram size={18} />
              </a>

              <a 
                href="https://twitter.com/royabridgetravel" 
                target="_blank" 
                rel="noreferrer"
                style={socialIconStyle}
                title="Follow RoyaBridge Travels on Twitter"
              >
                <Twitter size={18} />
              </a>

              <button 
                onClick={onOpenChat}
                style={socialIconStyle}
                title="Chat via WhatsApp / Live Concierge"
              >
                <MessageCircle size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onOpenContact} className="btn-outline-gold" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Contact Us
              </button>
              <button onClick={onOpenChat} className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                Send Us A Message
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Concierge Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><a href="#reserve" style={footerLinkStyle}>Reserve Flight Before Payment</a></li>
              <li><a href="#destinations" style={footerLinkStyle}>Domestic & International Routes</a></li>
              <li><a href="#savings" style={footerLinkStyle}>Up to 30% Off Airfares</a></li>
              <li><a href="#about" style={footerLinkStyle}>Fast Booking Assistance</a></li>
              <li><a href="#faq" style={footerLinkStyle}>Embassy / Visa Flight Holds</a></li>
            </ul>
          </div>

          {/* Targeted SEO Keyword Directory */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Top Flight Routes
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><a href="#destinations" style={footerLinkStyle}>London to Dubai Flight Hold</a></li>
              <li><a href="#destinations" style={footerLinkStyle}>Dubai Business Class Concierge</a></li>
              <li><a href="#destinations" style={footerLinkStyle}>New York & Toronto Airfares</a></li>
              <li><a href="#destinations" style={footerLinkStyle}>Tokyo & Bali Luxury Flights</a></li>
              <li><a href="#destinations" style={footerLinkStyle}>Paris & Europe Flight Reservation</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="var(--color-gold)" />
                <span>+1 (800) 769-2274 / 24/7 Phone</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--color-gold)" />
                <span>concierge@royabridgetravels.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="var(--color-gold)" />
                <span>Worldwide Travel Concierge Headquarters</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.82rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>RoyaBridge Travels</strong>. All Rights Reserved. Discover the World, Save Big and Travel Better.
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/sitemap.xml" style={{ color: '#64748B', textDecoration: 'none' }}>Sitemap</a>
            <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>Terms of Service</a>
            {onOpenAdmin && (
              <button 
                type="button"
                onClick={onOpenAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-gold)'}
                onMouseLeave={(e) => e.target.style.color = '#475569'}
                title="Executive Staff Admin Portal"
              >
                <Lock size={12} /> Staff Access
              </button>
            )}
          </div>

          <button 
            onClick={scrollToTop}
            style={{
              background: 'rgba(229,193,88,0.1)',
              border: '1px solid var(--border-gold)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'var(--color-gold-bright)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Back to Top"
          >
            <ArrowUp size={16} />
          </button>
        </div>

      </div>
    </footer>
  );
}

const footerLinkStyle = {
  color: '#94A3B8',
  textDecoration: 'none',
  transition: 'color 0.2s ease'
};

const socialIconStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'rgba(229, 193, 88, 0.12)',
  border: '1px solid var(--border-gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-gold-bright)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  textDecoration: 'none'
};
