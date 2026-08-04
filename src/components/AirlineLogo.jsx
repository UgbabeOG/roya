import React from 'react';

export const AIRLINE_BRAND_MAP = {
  EK: {
    code: 'EK',
    name: 'Emirates',
    color: '#D71921',
    accentColor: '#E5C158',
    bg: 'linear-gradient(135deg, #1A0406 0%, #0D0F1D 100%)',
    border: 'rgba(215, 25, 33, 0.5)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D71921" strokeWidth="2.2" strokeLinecap="round">
        <path d="M2 12h20M12 2v20M5 5l14 14M19 5L5 19" opacity="0.3" />
        <path d="M4 12c4-6 12-6 16 0c-4 6-12 6-16 0z" fill="#D71921" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="4" fill="#E5C158" />
      </svg>
    )
  },
  QR: {
    code: 'QR',
    name: 'Qatar Airways',
    color: '#5C0632',
    accentColor: '#F8DF8C',
    bg: 'linear-gradient(135deg, #18020D 0%, #0D0F1D 100%)',
    border: 'rgba(229, 193, 88, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#5C0632" />
        <path d="M8 12c1.5-3 4.5-4 7-2c-1 3-3.5 5-7 2z" fill="#F8DF8C" />
      </svg>
    )
  },
  BA: {
    code: 'BA',
    name: 'British Airways',
    color: '#EB2226',
    accentColor: '#38BDF8',
    bg: 'linear-gradient(135deg, #0A162B 0%, #0D0F1D 100%)',
    border: 'rgba(235, 34, 38, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 14c6-8 15-8 18 0" stroke="#EB2226" strokeWidth="3" strokeLinecap="round" />
        <path d="M7 11c4-5 10-5 12 0" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  DL: {
    code: 'DL',
    name: 'Delta Air Lines',
    color: '#E01931',
    accentColor: '#003A70',
    bg: 'linear-gradient(135deg, #020C1B 0%, #0D0F1D 100%)',
    border: 'rgba(224, 25, 49, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polygon points="12,3 2,21 12,17 22,21" fill="#E01931" />
        <polygon points="12,3 12,17 22,21" fill="#003A70" opacity="0.6" />
      </svg>
    )
  },
  SQ: {
    code: 'SQ',
    name: 'Singapore Airlines',
    color: '#FFB800',
    accentColor: '#002B49',
    bg: 'linear-gradient(135deg, #1A1402 0%, #0D0F1D 100%)',
    border: 'rgba(255, 184, 0, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 16l9-12l9 12l-9-4l-9 4z" fill="#FFB800" />
      </svg>
    )
  },
  LH: {
    code: 'LH',
    name: 'Lufthansa',
    color: '#FFAB00',
    accentColor: '#05164D',
    bg: 'linear-gradient(135deg, #1A1201 0%, #0D0F1D 100%)',
    border: 'rgba(255, 171, 0, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#05164D" stroke="#FFAB00" strokeWidth="1.8" />
        <path d="M7 14c3-4 8-6 10-2c-2 1-5 2-10 2z" fill="#FFAB00" />
      </svg>
    )
  },
  UA: {
    code: 'UA',
    name: 'United Airlines',
    color: '#005DAA',
    accentColor: '#00A3E0',
    bg: 'linear-gradient(135deg, #001224 0%, #0D0F1D 100%)',
    border: 'rgba(0, 163, 224, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#00A3E0" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="#005DAA" strokeWidth="1.5" />
        <path d="M12 3v18" stroke="#00A3E0" strokeWidth="1.5" />
      </svg>
    )
  },
  TK: {
    code: 'TK',
    name: 'Turkish Airlines',
    color: '#C8102E',
    accentColor: '#FFFFFF',
    bg: 'linear-gradient(135deg, #1A0206 0%, #0D0F1D 100%)',
    border: 'rgba(200, 16, 46, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#C8102E" />
        <path d="M8 12c2-3 6-3 8 0c-2 2-6 2-8 0z" fill="#FFF" />
      </svg>
    )
  },
  AF: {
    code: 'AF',
    name: 'Air France',
    color: '#002157',
    accentColor: '#ED2939',
    bg: 'linear-gradient(135deg, #020C1E 0%, #0D0F1D 100%)',
    border: 'rgba(56, 189, 248, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 18L20 6" stroke="#ED2939" strokeWidth="3" strokeLinecap="round" />
        <path d="M4 20L18 9" stroke="#002157" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  VS: {
    code: 'VS',
    name: 'Virgin Atlantic',
    color: '#C8102E',
    accentColor: '#E5C158',
    bg: 'linear-gradient(135deg, #1C0207 0%, #0D0F1D 100%)',
    border: 'rgba(229, 193, 88, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 6l8 12l8-12" stroke="#C8102E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="#E5C158" />
      </svg>
    )
  },
  EY: {
    code: 'EY',
    name: 'Etihad Airways',
    color: '#CBB26A',
    accentColor: '#806835',
    bg: 'linear-gradient(135deg, #171205 0%, #0D0F1D 100%)',
    border: 'rgba(203, 178, 106, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="#CBB26A" strokeWidth="2" />
        <polygon points="12,6 18,12 12,18 6,12" fill="#CBB26A" fillOpacity="0.4" />
      </svg>
    )
  },
  QF: {
    code: 'QF',
    name: 'Qantas',
    color: '#E40000',
    accentColor: '#FFFFFF',
    bg: 'linear-gradient(135deg, #1F0000 0%, #0D0F1D 100%)',
    border: 'rgba(228, 0, 0, 0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 18c6-10 14-8 16-2c-4 1-10 2-16 2z" fill="#E40000" />
      </svg>
    )
  }
};

export default function AirlineLogo({ code, name, size = 'md', showName = true }) {
  const cleanCode = (code || '').toUpperCase().trim();
  const brand = AIRLINE_BRAND_MAP[cleanCode] || {
    code: cleanCode || 'RB',
    name: name || 'Partner Carrier',
    color: 'var(--color-gold)',
    accentColor: '#F8DF8C',
    bg: 'linear-gradient(135deg, rgba(229, 193, 88, 0.15) 0%, rgba(10, 15, 30, 0.85) 100%)',
    border: 'rgba(229, 193, 88, 0.4)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2">
        <path d="M17.8 19.2L16 11l3.5-3.5C20 7 20 5.5 19 4.5s-2.5-1-3 0L12.5 8 4.3 6.2c-.5-.1-.9.1-1.1.5l-.3.7c-.2.5 0 1 .4 1.3L8 12l-3 3-2.2-.6c-.3-.1-.7 0-.9.3l-.2.3c-.2.3-.1.7.1.9l2.5 2.5 2.5 2.5c.2.2.6.3.9.1l.3-.2c.3-.2.4-.6.3-.9L7.5 17l3-3 3.3 4.7c.3.4.8.6 1.3.4l.7-.3c.4-.2.6-.6.5-1.1z"/>
      </svg>
    )
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const badgeSize = isSmall ? '28px' : isLarge ? '48px' : '38px';
  const fontSize = isSmall ? '0.72rem' : isLarge ? '1rem' : '0.85rem';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isSmall ? '6px' : '10px' }}>
      <div style={{
        width: badgeSize,
        height: badgeSize,
        borderRadius: '8px',
        background: brand.bg,
        border: `1.5px solid ${brand.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        flexShrink: 0
      }}>
        {brand.icon}
      </div>

      {showName && (
        <div style={{ minWidth: 0 }}>
          <span style={{
            fontSize: fontSize,
            fontWeight: 800,
            color: '#FFF',
            display: 'block',
            lineHeight: 1.1,
            whiteSpace: 'nowrap'
          }}>
            {brand.name}
          </span>
          <span style={{
            fontSize: isSmall ? '0.62rem' : '0.7rem',
            color: 'var(--color-gold-bright)',
            fontWeight: 600,
            display: 'block',
            marginTop: '1px'
          }}>
            IATA: {brand.code}
          </span>
        </div>
      )}
    </div>
  );
}
