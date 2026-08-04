import React, { useState } from 'react';
import { FAQS } from '../data/faq';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div className="section-header">
          <span className="gold-badge">Frequently Asked Questions</span>
          <h2>RoyaBridge Travels & Flight Concierge Guide</h2>
          <p>
            Learn more about how our concierge service works, our 30% savings promise, and how to reserve your flight before payment.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map((faq, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: openIndex === idx ? '1px solid var(--border-gold-glow)' : '1px solid var(--border-gold)'
              }}
            >
              <button
                onClick={() => toggle(idx)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: openIndex === idx ? 'rgba(229, 193, 88, 0.1)' : 'transparent',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#FFF',
                  textAlign: 'left',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={18} color="var(--color-gold)" />
                  {faq.question}
                </span>
                <ChevronDown 
                  size={20} 
                  color="var(--color-gold)" 
                  style={{
                    transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </button>

              {openIndex === idx && (
                <div style={{
                  padding: '0 24px 24px 54px',
                  color: '#CBD5E1',
                  fontSize: '0.98rem',
                  lineHeight: 1.7
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
