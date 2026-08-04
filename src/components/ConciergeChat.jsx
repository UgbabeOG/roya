import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, ShieldCheck, Check, Phone } from 'lucide-react';

export default function ConciergeChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Welcome to RoyaBridge Travels! I'm your dedicated Flight Concierge Assistant. How can I help you save up to 30% or reserve your flight before payment today?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "How does Reserve Before Payment work?",
    "Check price discount for my route",
    "Request custom Business Class deal",
    "Can I use this hold for a Visa?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent concierge response after 800ms
    setTimeout(() => {
      let botResponse = "Thank you for reaching out to RoyaBridge Travels! A senior flight concierge agent is reviewing your inquiry. You can also lock in a 24-hour flight hold with zero upfront payment right on our homepage.";

      if (query.toLowerCase().includes('reserve') || query.toLowerCase().includes('payment')) {
        botResponse = "With our 'Reserve Before Payment' feature, we lock your flight seats with an official airline PNR reference for 24-48 hours. Zero payment is needed until you inspect and approve your itinerary!";
      } else if (query.toLowerCase().includes('price') || query.toLowerCase().includes('discount') || query.toLowerCase().includes('30%')) {
        botResponse = "RoyaBridge Travels accesses wholesale airline fares. We offer up to 30% savings compared to standard online search engines for Economy, Business, and First Class seats.";
      } else if (query.toLowerCase().includes('visa')) {
        botResponse = "Yes! Our official flight reservation hold provides a verifiable PNR itinerary that fulfills all embassy and consulate requirements for visa applications.";
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 350,
      width: 'min(420px, calc(100vw - 32px))',
      height: '560px',
      background: '#0E1526',
      border: '1.5px solid var(--border-gold-glow)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Chat Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.2) 0%, rgba(14, 21, 38, 0.95) 100%)',
        borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#070B14'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700 }}>
              RoyaBridge Live Concierge
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Agents Online • Fast Assistance
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #F5D77F 0%, #E5C158 100%)' : 'rgba(15, 23, 42, 0.9)',
              color: msg.sender === 'user' ? '#070B14' : '#F1F5F9',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: msg.sender === 'user' ? 'none' : '1px solid rgba(229, 193, 88, 0.2)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              fontWeight: msg.sender === 'user' ? '600' : '400'
            }}
          >
            <p>{msg.text}</p>
            <span style={{
              fontSize: '0.7rem',
              display: 'block',
              textAlign: 'right',
              marginTop: '4px',
              opacity: 0.7
            }}>
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Suggestions */}
      <div style={{
        padding: '8px 12px',
        background: 'rgba(7, 11, 20, 0.6)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-gold)',
              background: 'rgba(229,193,88,0.08)',
              color: 'var(--color-gold-bright)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          padding: '12px 16px',
          background: '#070B14',
          borderTop: '1px solid rgba(229, 193, 88, 0.2)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <input 
          type="text"
          placeholder="Send us a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-full)',
            padding: '10px 16px',
            color: '#FFF',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button 
          type="submit"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--color-gold)',
            border: 'none',
            color: '#070B14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
}
