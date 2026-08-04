import React, { useState, useEffect, useRef } from 'react';
import { REVIEWS, REVIEW_STATS } from '../data/reviews';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, MessageSquarePlus, Pause, Play, Quote, CheckCircle2, X, Plane, DollarSign } from 'lucide-react';

export default function UserReviews({ onOpenChat }) {
  const [reviewsList, setReviewsList] = useState(REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const autoPlayTimerRef = useRef(null);

  const [newReview, setNewReview] = useState({
    name: '',
    role: 'Verified Traveler',
    location: '',
    rating: 5,
    title: '',
    comment: '',
    route: '',
    airline: ''
  });

  // Carousel Navigation
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? reviewsList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === reviewsList.length - 1 ? 0 : prev + 1));
  };

  // Autoplay Logic
  useEffect(() => {
    if (isAutoplay && !isModalOpen) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev === reviewsList.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoplay, reviewsList.length, isModalOpen]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const created = {
      id: Date.now(),
      name: newReview.name,
      role: newReview.role || 'Verified Traveler',
      location: newReview.location || 'Worldwide',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
      rating: newReview.rating,
      date: 'Just now',
      verified: true,
      title: newReview.title || 'Exceptional Concierge Experience!',
      comment: newReview.comment,
      route: newReview.route || 'Worldwide Route',
      airline: newReview.airline || 'Partner Airline',
      savedAmount: '$1,200+'
    };

    const updated = [created, ...reviewsList];
    setReviewsList(updated);
    setCurrentIndex(0);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
      setNewReview({ name: '', role: 'Verified Traveler', location: '', rating: 5, title: '', comment: '', route: '', airline: '' });
    }, 2000);
  };

  const activeReview = reviewsList[currentIndex] || reviewsList[0];

  return (
    <section id="reviews" style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Ambient Glow */}
      <div className="glow-bg" style={{
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '650px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(229, 193, 88, 0.15) 0%, rgba(0,0,0,0) 70%)'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        
        {/* Section Header */}
        <div className="section-header">
          <span className="gold-badge">
            <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
            Verified Client Testimonials
          </span>
          <h2>What Global Travelers Say About RoyaBridge</h2>
          <p>
            Experience authentic client reviews showcasing verified 24-48h flight holds, 30% airfare savings, and world-class concierge service.
          </p>
        </div>

        {/* Aggregate Stats Summary Bar */}
        <div className="glass-card" style={{
          padding: '20px 28px',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.12) 0%, rgba(14, 21, 38, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={18} fill="var(--color-gold)" color="var(--color-gold)" />
                ))}
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#FFF', display: 'block', lineHeight: 1 }}>{REVIEW_STATS.averageRating} / 5.0</strong>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />

            <div>
              <span style={{ fontSize: '0.88rem', color: '#FFF', fontWeight: 700, display: 'block' }}>
                {REVIEW_STATS.totalReviews.toLocaleString()}+ Verified Reviews
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 600 }}>
                ✓ {REVIEW_STATS.recommendationPercentage}% Satisfaction Rate
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>
                CLIENT SAVINGS DELIVERED
              </span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--color-gold-bright)', letterSpacing: '-0.02em' }}>
                {REVIEW_STATS.savingsTotal}
              </strong>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-gold"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <MessageSquarePlus size={16} />
              Write A Review
            </button>
          </div>
        </div>

        {/* Main Glass-Morphism Testimonial Carousel Spotlight Box */}
        <div 
          className="glass-card"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.82) 0%, rgba(7, 11, 20, 0.94) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid var(--border-gold-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(24px, 5vw, 44px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Subtle Watermark Quote Symbol */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '28px',
            opacity: 0.08,
            color: 'var(--color-gold)',
            pointerEvents: 'none'
          }}>
            <Quote size={120} />
          </div>

          {/* Top Carousel Bar: Slide Counter & Autoplay Badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(229, 193, 88, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="gold-badge" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                Review {currentIndex + 1} of {reviewsList.length}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {activeReview.date}
              </span>
            </div>


          </div>

          {/* Carousel Slide Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            
            {/* Left Column: Reviewer Profile & Verified Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                  src={activeReview.avatar} 
                  alt={activeReview.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--color-gold)',
                    boxShadow: '0 0 20px rgba(229, 193, 88, 0.3)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <h3 style={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>
                    {activeReview.name}
                  </h3>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-gold-bright)', fontWeight: 600, display: 'block', marginTop: '3px' }}>
                    {activeReview.role}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    📍 {activeReview.location}
                  </span>
                </div>
              </div>

              {/* Star Rating & Verified Hold Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(activeReview.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="var(--color-gold)" color="var(--color-gold)" />
                  ))}
                </div>

                {activeReview.verified && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6EE7B7',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={13} />
                    Verified Reservation
                  </span>
                )}
              </div>

              {/* Route & Airline Info Box */}
              <div style={{
                background: 'rgba(7, 11, 20, 0.7)',
                border: '1px solid rgba(229, 193, 88, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontSize: '0.88rem', fontWeight: 700 }}>
                  <Plane size={15} color="var(--color-gold)" />
                  <span>{activeReview.route}</span>
                </div>
                {activeReview.airline && (
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Airline: {activeReview.airline}</span>
                    {activeReview.savedAmount && (
                      <span style={{ color: '#6EE7B7', fontWeight: 700 }}>Saved {activeReview.savedAmount}</span>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Title Quote & Testimonial Details */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{
                color: 'var(--color-gold-bright)',
                fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
                fontWeight: 800,
                lineHeight: 1.3,
                marginBottom: '14px',
                letterSpacing: '-0.01em'
              }}>
                "{activeReview.title}"
              </h4>

              <p style={{
                color: '#E2E8F0',
                fontSize: '1.02rem',
                lineHeight: 1.65,
                fontWeight: 400,
                fontStyle: 'italic'
              }}>
                "{activeReview.comment}"
              </p>
            </div>

          </div>

          {/* Carousel Controls Bar (Dot Navigation) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            
            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {reviewsList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: currentIndex === idx ? '28px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: currentIndex === idx ? 'var(--color-gold-bright)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

        {/* Scrollable Thumbnails Strip for Quick Direct Review Selection */}
        <div 
          className="no-scrollbar"
          style={{
            marginTop: '24px',
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}
        >
          {reviewsList.map((rev, idx) => (
            <button
              key={rev.id || idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                background: currentIndex === idx 
                  ? 'rgba(229, 193, 88, 0.18)' 
                  : 'rgba(14, 21, 38, 0.6)',
                border: currentIndex === idx 
                  ? '1.5px solid var(--color-gold-bright)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <img 
                src={rev.avatar} 
                alt={rev.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#FFF', fontWeight: 700, display: 'block', whiteSpace: 'nowrap' }}>
                  {rev.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: currentIndex === idx ? 'var(--color-gold-bright)' : '#94A3B8', display: 'block', whiteSpace: 'nowrap' }}>
                  {rev.route}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Submit Review Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            background: 'rgba(7, 11, 20, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              maxWidth: '520px',
              width: '100%',
              background: '#0E1526',
              border: '1.5px solid var(--border-gold-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="font-royal" style={{ color: '#FFF', fontSize: '1.3rem' }}>
                  Share Your RoyaBridge Experience
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {submittedMessage ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
                  <h4 style={{ color: '#FFF', fontSize: '1.2rem' }}>Thank You For Your Review!</h4>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', marginTop: '8px' }}>
                    Your feedback has been added directly to our client testimonial showcase!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={reviewLabelStyle}>Your Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      style={reviewInputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={reviewLabelStyle}>City / Country</label>
                      <input 
                        type="text" 
                        placeholder="e.g. London, UK"
                        value={newReview.location}
                        onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                        style={reviewInputStyle}
                      />
                    </div>
                    <div>
                      <label style={reviewLabelStyle}>Flight Route</label>
                      <input 
                        type="text" 
                        placeholder="e.g. London → Dubai"
                        value={newReview.route}
                        onChange={(e) => setNewReview({ ...newReview, route: e.target.value })}
                        style={reviewInputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={reviewLabelStyle}>Airline Flown</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Emirates Airlines"
                      value={newReview.airline}
                      onChange={(e) => setNewReview({ ...newReview, airline: e.target.value })}
                      style={reviewInputStyle}
                    />
                  </div>

                  <div>
                    <label style={reviewLabelStyle}>Review Headline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Saved $1,200 on my Business Class flight!"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      style={reviewInputStyle}
                    />
                  </div>

                  <div>
                    <label style={reviewLabelStyle}>Your Review Comments *</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Tell us about your flight booking & PNR hold experience..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      style={{ ...reviewInputStyle, resize: 'none' }}
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ marginTop: '10px', padding: '12px' }}>
                    Submit Verified Review
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

const reviewLabelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  color: 'var(--color-gold-bright)',
  fontWeight: '600',
  marginBottom: '4px'
};

const reviewInputStyle = {
  background: 'rgba(7, 11, 20, 0.8)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 12px',
  color: '#FFF',
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none'
};
