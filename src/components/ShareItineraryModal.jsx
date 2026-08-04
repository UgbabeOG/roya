import React, { useState } from 'react';
import { Share2, Copy, Check, Mail, MessageSquare, Link, X, Globe, Plane, ShieldCheck, Printer } from 'lucide-react';
import { formatCurrency } from '../utils/pnrGenerator';

export default function ShareItineraryModal({ isOpen, onClose, shareData, currency = 'USD' }) {
  if (!isOpen || !shareData) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Extract itinerary details
  const { 
    type = 'search', // 'search', 'flight', 'pnr'
    origin = 'JFK', 
    destination = 'LHR', 
    departDate = '2026-08-15', 
    returnDate = null, 
    cabinClass = 'Business', 
    passengers = 1,
    pnrNumber = null,
    airline = null,
    flightNumber = null,
    royaPrice = null,
    savings = null,
    segments = null
  } = shareData;

  // Construct URL for sharing
  const baseUrl = window.location.origin + window.location.pathname;
  const searchParams = new URLSearchParams();
  searchParams.set('share', 'true');
  searchParams.set('origin', origin);
  searchParams.set('destination', destination);
  searchParams.set('departDate', departDate);
  if (returnDate) searchParams.set('returnDate', returnDate);
  searchParams.set('cabinClass', cabinClass);
  searchParams.set('passengers', passengers.toString());
  if (pnrNumber) searchParams.set('pnr', pnrNumber);

  const shareableUrl = `${baseUrl}?${searchParams.toString()}`;

  // Email formatted body
  const emailSubject = pnrNumber 
    ? `RoyaBridge Travels Held Reservation: PNR #${pnrNumber} (${origin} to ${destination})`
    : `Flight Itinerary & Fare Quote: ${origin} to ${destination} (${cabinClass})`;

  const emailBody = `RoyaBridge Travels - Concierge Flight Itinerary

--------------------------------------------------
ROUTE DETAILS:
Origin: ${origin}
Destination: ${destination}
Departure Date: ${departDate}
${returnDate ? `Return Date: ${returnDate}\n` : ''}Passengers: ${passengers} (${cabinClass} Class)
${segments && segments.length > 0 ? `Multi-City Legs:\n${segments.map((s, i) => `  Leg ${i + 1}: ${s.origin} → ${s.destination} on ${s.date}`).join('\n')}\n` : ''}
${pnrNumber ? `RESERVATION PNR #: ${pnrNumber}\nSTATUS: 24h Free Hold Confirmed\n` : ''}
${flightNumber ? `FLIGHT OPTION: ${airline || 'Partner Carrier'} #${flightNumber}\n` : ''}
${royaPrice ? `CONCIERGE FARE: ${formatCurrency(royaPrice, currency)}\n` : ''}
${savings ? `ESTIMATED SAVINGS: ${formatCurrency(savings, currency)} (Up to 30% OFF)\n` : ''}
--------------------------------------------------
View & Lock In This Itinerary Online:
${shareableUrl}

RoyaBridge Travels Concierge Desk
Seamless Flight Holds & Exclusive Airfares
`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${emailSubject}\n\n${shareableUrl}`)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmailText = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'linear-gradient(180deg, rgba(14, 21, 38, 0.98) 0%, rgba(7, 11, 20, 0.98) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#FFF',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            background: 'rgba(229, 193, 88, 0.2)',
            border: '1px solid var(--color-gold)',
            borderRadius: '12px',
            padding: '10px',
            color: 'var(--color-gold-bright)'
          }}>
            <Share2 size={24} />
          </div>
          <div>
            <h3 style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              Share My Itinerary
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Send this trip query, fare quote, or held reservation to colleagues or family
            </span>
          </div>
        </div>

        {/* Itinerary Summary Preview Card */}
        <div style={{
          background: 'rgba(7, 11, 20, 0.8)',
          border: '1px solid rgba(229, 193, 88, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-bright)', fontWeight: 700, textTransform: 'uppercase' }}>
              {pnrNumber ? `Hold Reservation #${pnrNumber}` : 'Selected Flight Itinerary'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 600 }}>
              {passengers} Pax • {cabinClass} Class
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFF', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>{origin}</span>
            <Plane size={18} color="var(--color-gold)" />
            <span>{destination}</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '6px' }}>
            Depart: {departDate} {returnDate ? `| Return: ${returnDate}` : ''}
          </div>

          {royaPrice && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>RoyaBridge Fare:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                {formatCurrency(royaPrice, currency)}
              </span>
            </div>
          )}
        </div>

        {/* Channel 1: Shareable Web Link */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--color-gold-bright)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            1. Copy Shareable Direct Web Link
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              background: 'rgba(7, 11, 20, 0.9)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              flex: 1,
              color: '#94A3B8',
              fontSize: '0.82rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {shareableUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="btn-gold"
              style={{ padding: '10px 18px', fontSize: '0.85rem', flexShrink: 0 }}
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Channel 2: WhatsApp & Quick Messaging */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              background: '#25D366',
              color: '#FFF',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <MessageSquare size={18} />
            Share on WhatsApp
          </a>

          <a
            href={mailtoLink}
            style={{
              flex: 1,
              background: 'rgba(229, 193, 88, 0.2)',
              border: '1px solid var(--color-gold)',
              color: 'var(--color-gold-bright)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <Mail size={18} />
            Send via Email Client
          </a>
        </div>

        {/* Channel 3: Email Format Text Box */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--color-gold-bright)', fontWeight: 700, textTransform: 'uppercase' }}>
              Formatted Email / Message Text
            </label>
            <button
              onClick={handleCopyEmailText}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-gold-bright)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
              {copiedEmail ? 'Copied Email Text!' : 'Copy Formatted Text'}
            </button>
          </div>

          <textarea
            readOnly
            value={emailBody}
            rows={6}
            style={{
              width: '100%',
              background: 'rgba(7, 11, 20, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: '#E2E8F0',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        {/* Action Bar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFF',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={15} />
            Print / Save as PDF
          </button>

          <button
            onClick={onClose}
            className="btn-outline-gold"
            style={{ padding: '8px 24px', fontSize: '0.88rem' }}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
