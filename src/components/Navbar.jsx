import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquare, PhoneCall, Menu, X, Phone, Mail, Share2, Lock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Navbar({ onOpenSearch, onOpenChat, onOpenTracker, onOpenContact, onOpenShare, onOpenAdmin }) {
  const { isAdmin } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const NAV_ITEMS = [
    { id: 'reserve', label: 'Reserve Flight' },
    { id: 'about', label: 'About Us' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Scroll Spy Logic
      const scrollPosition = window.scrollY + 200;
      let currentSection = '';

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = item.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(targetId);

    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const getNavLinkStyle = (isActive) => ({
    color: isActive ? 'var(--color-gold-bright)' : '#CBD5E1',
    textDecoration: 'none',
    fontSize: '0.84rem',
    fontWeight: isActive ? 800 : 600,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    padding: '6px 14px',
    borderRadius: '20px',
    background: isActive ? 'rgba(229, 193, 88, 0.16)' : 'transparent',
    border: isActive ? '1px solid var(--color-gold)' : '1px solid transparent',
    boxShadow: isActive ? '0 0 12px rgba(229, 193, 88, 0.25)' : 'none',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  });

  const getMobileNavLinkStyle = (isActive) => ({
    color: isActive ? 'var(--color-gold-bright)' : '#F8FAFC',
    textDecoration: 'none',
    fontSize: '1.05rem',
    fontWeight: isActive ? 800 : 600,
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    background: isActive ? 'rgba(229, 193, 88, 0.15)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--color-gold-bright)' : '3px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease'
  });

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled || mobileMenuOpen ? 'rgba(7, 11, 20, 0.95)' : 'rgba(7, 11, 20, 0.4)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled || mobileMenuOpen ? '1px solid rgba(229, 193, 88, 0.25)' : '1px solid transparent',
      padding: scrolled ? '12px 0' : '18px 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 193, 88, 0.3) 0%, rgba(11, 16, 29, 0.9) 100%)',
            border: '1.5px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(229, 193, 88, 0.3)',
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-gold)" strokeWidth="4" />
              <ellipse cx="50" cy="50" rx="44" ry="18" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
              <ellipse cx="50" cy="50" rx="18" ry="44" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
              <rect x="58" y="52" width="24" height="28" rx="4" fill="var(--color-gold)" stroke="#070B14" strokeWidth="2" />
              <path d="M 65 52 V 46 Q 65 43 70 43 Q 75 43 75 46 V 52" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
            </svg>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span className="font-royal" style={{
              fontSize: 'clamp(0.95rem, 3.8vw, 1.35rem)',
              fontWeight: 800,
              color: 'var(--color-gold-bright)',
              letterSpacing: '0.02em',
              display: 'block',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              ROYABRIDGE TRAVELS
            </span>
            <span style={{
              fontSize: '0.62rem',
              color: '#CBD5E1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 500,
              display: 'block',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              Flight Concierge & Booking
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="desktop-links">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                style={getNavLinkStyle(isActive)}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Action Buttons & Hamburger Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          
          {/* Contact Us Button - Desktop Only */}
          <button 
            onClick={onOpenContact}
            className="btn-outline-gold desktop-only"
            style={{ padding: '7px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <PhoneCall size={14} />
            Contact Us
          </button>

          {/* Track Reservation Button */}
          <button 
            onClick={onOpenTracker}
            className="btn-outline-gold desktop-only"
            style={{ padding: '7px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <ShieldCheck size={14} />
            Track
          </button>

          {/* Send Us A Message Button */}
          <button 
            onClick={onOpenChat}
            className="btn-gold desktop-only"
            style={{ padding: '7px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <MessageSquare size={14} />
            Message
          </button>


          {/* Hamburger Menu Toggle Button for Mobile/Tablet */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'rgba(229, 193, 88, 0.15)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-sm)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold-bright)',
              cursor: 'pointer'
            }}
            className="hamburger-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(7, 11, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1.5px solid var(--border-gold-glow)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                style={getMobileNavLinkStyle(isActive)}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span style={{ fontSize: '0.72rem', background: 'var(--color-gold-bright)', color: '#070B14', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                    ACTIVE
                  </span>
                )}
              </a>
            );
          })}

          <div style={{ height: '1px', background: 'rgba(229,193,88,0.15)', margin: '8px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="btn-gold"
              style={{ width: '100%', padding: '12px' }}
            >
              <PhoneCall size={16} />
              Contact Us (Email / Phone)
            </button>


            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenTracker(); }}
              className="btn-outline-gold"
              style={{ width: '100%', padding: '12px' }}
            >
              <ShieldCheck size={16} />
              Track Reservation
            </button>

            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
              className="btn-gold"
              style={{ width: '100%', padding: '12px' }}
            >
              <MessageSquare size={16} />
              Send Us A Message
            </button>
          </div>

        </div>
      )}

      <style>{`
        .desktop-links {
          display: none;
        }
        @media (min-width: 992px) {
          .desktop-links {
            display: flex !important;
            align-items: center;
            gap: 16px;
          }
          .hamburger-btn {
            display: none !important;
          }
        }
        @media (max-width: 991px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
