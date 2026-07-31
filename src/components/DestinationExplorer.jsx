import React, { useState, useEffect } from 'react';
import { fetchDestinationsFromFirestore } from '../lib/destinationsService';
import { formatCurrency } from '../utils/pnrGenerator';
import { Plane, Calendar, FileCheck, Coins, Clock, Search, RefreshCw, Info, MapPin, CheckCircle2, X, Compass, Sparkles, Database } from 'lucide-react';

export default function DestinationExplorer({ onSelectDestination, currency = 'USD' }) {
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInsightsModal, setSelectedInsightsModal] = useState(null);

  useEffect(() => {
    async function loadStoreDestinations() {
      try {
        setLoading(true);
        const data = await fetchDestinationsFromFirestore();
        if (Array.isArray(data) && data.length > 0) {
          setDestinations(data);
        }
      } catch (err) {
        console.warn('Error loading destinations from Firebase Store:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStoreDestinations();
  }, []);


  const handleSelectWithValidation = async (dest) => {
    try {
      const valRes = await fetch('/api/destinations/validate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: dest.id,
          passengers: 1,
          cabinClass: 'Business'
        })
      });

      const valData = await valRes.json();
      if (valData.success && valData.pricing) {
        const validatedDest = {
          ...dest,
          retailPrice: valData.pricing.retailPrice,
          royaPrice: valData.pricing.royaPrice,
          serverVerified: true
        };
        onSelectDestination(validatedDest);
      } else {
        onSelectDestination(dest);
      }
    } catch (e) {
      onSelectDestination(dest);
    }
  };

  const filteredDestinations = destinations.filter(item => {
    // Region tab filter
    const matchesRegion = 
      filter === 'All' ? true :
      filter === 'Popular' ? item.popular :
      item.region === filter;

    // Search query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ? true : (
      item.name.toLowerCase().includes(query) ||
      item.airport.toLowerCase().includes(query) ||
      item.tagline.toLowerCase().includes(query) ||
      item.region.toLowerCase().includes(query)
    );

    return matchesRegion && matchesSearch;
  });

  return (
    <section id="destinations" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="gold-badge">Top Global Routes & Travel Insights</span>
          <h2>Top Global Routes with Up to 30% Savings & Travel Insights</h2>
          <p>
            Explore our curated luxury routes across Europe, Americas, Asia, Middle East, and Africa. Get real-time travel advice, best travel seasons, visa policies, and exclusive concierge fares.
          </p>
        </div>

        {/* Region Filter Tabs & Search Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Region Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {['All', 'Popular', 'Americas', 'Asia', 'Europe', 'Middle East', 'Africa'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: filter === tab ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: filter === tab ? 'linear-gradient(135deg, rgba(229, 193, 88, 0.25) 0%, rgba(184, 144, 37, 0.15) 100%)' : 'rgba(15, 23, 42, 0.6)',
                  color: filter === tab ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Quick Filter Search Bar */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Search route by city or airport code (e.g. Dubai, LAX, London)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="reserve-modal-input"
              style={{
                width: '100%',
                paddingLeft: '42px',
                paddingRight: searchQuery ? '36px' : '16px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-full)',
                color: '#FFF',
                fontSize: '0.88rem'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton Screen */}
        {loading ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px',
              marginBottom: '24px',
              background: 'rgba(229, 193, 88, 0.08)',
              border: '1px solid rgba(229, 193, 88, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-gold-bright)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              <RefreshCw className="animate-spin" size={18} />
              <span>Fetching Live Destinations & Route Inventory from Firestore...</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className="glass-card"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(13, 20, 36, 0.6)'
                  }}
                >
                  <div style={{ height: '180px', background: 'rgba(255,255,255,0.06)' }} className="animate-pulse" />
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ height: '16px', width: '40%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} className="animate-pulse" />
                    <div style={{ height: '24px', width: '70%', background: 'rgba(229,193,88,0.15)', borderRadius: '4px' }} className="animate-pulse" />
                    <div style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} className="animate-pulse" />
                    <div style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', marginTop: '8px' }} className="animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            <Compass size={36} color="var(--color-gold)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '1.05rem', color: '#FFF' }}>No routes found matching your filter.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Try searching for a different city or switching regions.</p>
            <button 
              onClick={() => { setFilter('All'); setSearchQuery(''); }}
              className="btn-outline-gold"
              style={{ marginTop: '16px', padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Destination Route Cards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredDestinations.map(dest => (
              <div 
                key={dest.id} 
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                {/* Route Cover Image & Pricing Header */}
                <div style={{
                  position: 'relative',
                  height: '210px',
                  backgroundImage: `url('${dest.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(7,11,20,0.92) 100%)'
                  }} />
                  
                  {/* Region & Discount Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--color-gold-bright)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      {dest.region}
                    </span>

                    <span style={{
                      background: 'linear-gradient(135deg, #F5D77F 0%, #E5C158 100%)',
                      color: '#070B14',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      SAVE UP TO {dest.discount?.toLowerCase().includes('up to') ? dest.discount.replace(/up to\s*/i, '') : dest.discount}
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '16px',
                    right: '16px'
                  }}>
                    <h3 style={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.2 }}>
                      {dest.name}
                    </h3>
                    <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', fontWeight: 600 }}>
                      Airport: {dest.airport}
                    </span>
                  </div>
                </div>

                {/* Main Card Content */}
                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Tagline */}
                  <p style={{ fontSize: '0.82rem', color: '#CBD5E1', fontStyle: 'italic', margin: 0 }}>
                    "{dest.tagline}"
                  </p>

                  {/* Integrated Travel Insights Pills */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {/* Best Time */}
                    {dest.bestTimeToVisit && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                        <Calendar size={14} color="var(--color-gold-bright)" style={{ flexShrink: 0 }} />
                        <span><strong>Best Time:</strong> {dest.bestTimeToVisit}</span>
                      </div>
                    )}

                    {/* Visa Requirement */}
                    {dest.visaRequirement && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                        <FileCheck size={14} color="#6EE7B7" style={{ flexShrink: 0 }} />
                        <span><strong>Visa:</strong> {dest.visaRequirement}</span>
                      </div>
                    )}

                    {/* Local Currency */}
                    {dest.currency && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                        <Coins size={14} color="var(--color-gold-bright)" style={{ flexShrink: 0 }} />
                        <span><strong>Currency:</strong> {dest.currency} • {dest.language}</span>
                      </div>
                    )}

                    {/* Flight Duration */}
                    {dest.averageFlightDuration && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                        <Clock size={14} color="#38BDF8" style={{ flexShrink: 0 }} />
                        <span><strong>Flight Time:</strong> {dest.averageFlightDuration}</span>
                      </div>
                    )}
                  </div>

                  {/* Highlights Tags */}
                  {Array.isArray(dest.highlights) && dest.highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {dest.highlights.map((hl, i) => (
                        <span key={i} style={{
                          fontSize: '0.72rem',
                          background: 'rgba(212, 175, 55, 0.12)',
                          color: 'var(--color-gold-bright)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(212, 175, 55, 0.2)'
                        }}>
                          ✨ {hl}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing & CTA */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                          Standard Fare: <strike>{formatCurrency(dest.retailPrice, currency)}</strike>
                        </span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                          {formatCurrency(dest.royaPrice, currency)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700, background: 'rgba(110, 231, 183, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                        Concierge Rate
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInsightsModal(dest);
                        }}
                        className="btn-outline-gold"
                        style={{ padding: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        <Info size={14} />
                        Insights Guide
                      </button>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectWithValidation(dest);
                        }}
                        className="btn-primary-gold"
                        style={{ padding: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        <Plane size={14} />
                        Reserve Fare
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Full Travel Insights Modal for Detailed Destination View */}
      {selectedInsightsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: 'rgba(7, 11, 20, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            border: '1px solid var(--color-gold)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedInsightsModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles color="var(--color-gold-bright)" size={20} />
              <span className="gold-badge" style={{ margin: 0 }}>Destination Insight Report</span>
            </div>

            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.6rem', marginBottom: '4px' }}>
              {selectedInsightsModal.name} ({selectedInsightsModal.airport})
            </h2>
            <p style={{ color: 'var(--color-gold)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Region: {selectedInsightsModal.region} • Tagline: {selectedInsightsModal.tagline}
            </p>

            <div style={{
              height: '180px',
              borderRadius: '12px',
              backgroundImage: `url('${selectedInsightsModal.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: '20px'
            }} />

            {/* Comprehensive Insight Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🗓️ Best Time to Visit
                </span>
                <span style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 600 }}>
                  {selectedInsightsModal.bestTimeToVisit}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🛂 Visa & Entry Policy
                </span>
                <span style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 600 }}>
                  {selectedInsightsModal.visaRequirement}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🪙 Currency & Language
                </span>
                <span style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 600 }}>
                  {selectedInsightsModal.currency} ({selectedInsightsModal.language})
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  ⏱️ Flight Times
                </span>
                <span style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 600 }}>
                  {selectedInsightsModal.averageFlightDuration}
                </span>
              </div>

            </div>

            {/* Highlights */}
            {Array.isArray(selectedInsightsModal.highlights) && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#FFF', fontSize: '0.95rem', marginBottom: '8px' }}>Top Route Highlights:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedInsightsModal.highlights.map((hl, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                      <CheckCircle2 size={15} color="#6EE7B7" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Lock Banner inside Modal */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.2) 0%, rgba(184, 144, 37, 0.1) 100%)',
              border: '1px solid var(--color-gold)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Exclusive Concierge Fare</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                  {formatCurrency(selectedInsightsModal.royaPrice, currency)}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6EE7B7', marginLeft: '10px' }}>
                  (Save up to {selectedInsightsModal.discount?.toLowerCase().includes('up to') ? selectedInsightsModal.discount.replace(/up to\s*/i, '') : selectedInsightsModal.discount})
                </span>
              </div>

              <button
                onClick={() => {
                  const targetDest = selectedInsightsModal;
                  setSelectedInsightsModal(null);
                  handleSelectWithValidation(targetDest);
                }}
                className="btn-primary-gold"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <Plane size={16} />
                Reserve {selectedInsightsModal.name}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
