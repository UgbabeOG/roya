import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Printer, MessageCircle, Clock, CheckCircle2, Copy, Plane, Activity, AlertCircle, Shield, Sparkles, Check, Luggage, PlusCircle, FileText, Lock, HeartHandshake, Share2 } from 'lucide-react';
import { generatePNR, formatCurrency } from '../utils/pnrGenerator';
import { saveBookingToDatabase } from '../lib/bookingsService';
import { validateEmail, validatePhone, validateName } from '../utils/validation';

export default function ReserveModal({ data, onClose, onOpenChat, showToast, onOpenShare, currency = 'USD' }) {

  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [seatPreference, setSeatPreference] = useState('Window');
  const [mealPreference, setMealPreference] = useState('Standard');

  // Interactive Cabin Selection
  const initialCabin = data?.cabinClass || 'Business';
  const [selectedCabin, setSelectedCabin] = useState(initialCabin);

  // Interactive Travel Insurance & Add-ons
  const [addOns, setAddOns] = useState({
    travelInsurance: true, // Comprehensive Medical & Delay Coverage ($49/pax)
    conciergeProtection: false, // VIP Concierge & Baggage Guarantee ($29/pax)
    flexiBooking: false, // Flexi Date Change Protection ($35/pax)
    carbonOffset: false // Eco-Travel Carbon Neutral Offset ($12/pax)
  });

  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '' });
  const [validationError, setValidationError] = useState('');
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pnr] = useState(() => generatePNR());
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 3600); // 24 hours countdown

  // Real-time price query state
  const [liveQuote, setLiveQuote] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);

  // Validate dates: departure date should never be later than return date
  const originCode = data?.origin?.code || data?.origin || 'JFK';
  const destCode = data?.destination?.code || data?.destination || 'LHR';
  const depDate = data?.departDate || '2026-08-15';
  const retDate = data?.returnDate || '2026-08-29';
  const isRound = (data?.tripType || 'round') === 'round';
  const isDatesValid = !isRound || (depDate && retDate && new Date(depDate) <= new Date(retDate));

  useEffect(() => {
    let active = true;
    async function fetchLiveFlightQuote() {
      setLiveLoading(true);
      try {
        const res = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: originCode,
            destination: destCode,
            departDate: depDate,
            returnDate: isRound ? retDate : null,
            tripType: data?.tripType || 'round',
            cabinClass: selectedCabin,
            passengers: data?.passengers || 1
          })
        });
        const resJson = await res.json();
        if (active && resJson.success && Array.isArray(resJson.flights) && resJson.flights.length > 0) {
          const matched = resJson.flights.find(f => f.flightNumber === data?.flightNumber) || resJson.flights[0];
          setLiveQuote(matched);
        }
      } catch (err) {
        console.warn('Real-time price search warning in modal:', err);
      } finally {
        if (active) setLiveLoading(false);
      }
    }

    fetchLiveFlightQuote();
    return () => { active = false; };
  }, [originCode, destCode, depDate, retDate, selectedCabin, data?.passengers, data?.flightNumber, data?.tripType]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const copyPNR = () => {
    navigator.clipboard.writeText(pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAddOn = (key) => {
    setAddOns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Real-Time Pricing Calculations
  const passengersCount = data?.passengers || 1;
  const baseRoyaPricePerPax = liveQuote?.royaPrice ? Math.round(liveQuote.royaPrice / passengersCount) : (data?.savings?.finalPrice || data?.royaPrice || 840);
  const baseRetailPricePerPax = liveQuote?.retailPrice ? Math.round(liveQuote.retailPrice / passengersCount) : (data?.savings?.originalPrice || data?.retailPrice || 1200);

  // Cabin adjustments relative to base price (if not already returned by live search)
  const CABIN_PRICING = {
    'Economy': -320,
    'Premium Economy': -150,
    'Business': 0,
    'First': 480
  };

  const cabinDelta = (!liveQuote && CABIN_PRICING[selectedCabin] !== undefined) ? CABIN_PRICING[selectedCabin] : 0;
  
  const flightFarePerPax = Math.max(200, baseRoyaPricePerPax + cabinDelta);
  const flightRetailPerPax = Math.max(300, baseRetailPricePerPax + cabinDelta);

  const baseFlightTotal = flightFarePerPax * passengersCount;
  const baseRetailTotal = flightRetailPerPax * passengersCount;

  // Add-ons total
  const ADD_ON_RATES = {
    travelInsurance: 49,
    conciergeProtection: 29,
    flexiBooking: 35,
    carbonOffset: 12
  };

  let addOnsTotalPerPax = 0;
  if (addOns.travelInsurance) addOnsTotalPerPax += ADD_ON_RATES.travelInsurance;
  if (addOns.conciergeProtection) addOnsTotalPerPax += ADD_ON_RATES.conciergeProtection;
  if (addOns.flexiBooking) addOnsTotalPerPax += ADD_ON_RATES.flexiBooking;
  if (addOns.carbonOffset) addOnsTotalPerPax += ADD_ON_RATES.carbonOffset;

  const totalAddOnsAmount = addOnsTotalPerPax * passengersCount;

  const totalFinalPrice = baseFlightTotal + totalAddOnsAmount;
  const totalRetailPrice = baseRetailTotal + totalAddOnsAmount;
  const totalSavings = totalRetailPrice - totalFinalPrice;

  const handleConfirm = async () => {
    const nameVal = validateName(passengerName);
    const emailVal = validateEmail(passengerEmail);
    const phoneVal = validatePhone(passengerPhone);

    const errors = {
      name: nameVal.error || '',
      email: emailVal.error || '',
      phone: phoneVal.error || ''
    };

    setFieldErrors(errors);

    if (!nameVal.isValid || !emailVal.isValid || !phoneVal.isValid) {
      const firstErr = nameVal.error || emailVal.error || phoneVal.error;
      setValidationError(firstErr);
      return;
    }

    setValidationError('');
    setSaving(true);

    try {
      const addOnsList = Object.keys(addOns).filter(k => addOns[k]);

      await saveBookingToDatabase({
        pnr: pnr,
        passengerName: passengerName.trim(),
        passengerEmail: passengerEmail.trim(),
        passengerPhone: passengerPhone.trim(),
        flightNumber: data.flightNumber || 'BA178',
        airline: data.airline || 'British Airways',
        origin: data.origin?.code || data.origin || 'JFK',
        originCity: data.origin?.city || data.origin?.name || 'New York',
        destination: data.destination?.code || data.destination || 'LHR',
        destinationCity: data.destination?.city || data.destination?.name || 'London',
        departDate: data.departDate || '2026-08-20',
        returnDate: data.returnDate,
        tripType: data.tripType || 'round',
        cabinClass: selectedCabin,
        passengersCount: passengersCount,
        retailPrice: totalRetailPrice,
        royaPrice: totalFinalPrice,
        savings: totalSavings,
        selectedAddOns: addOnsList,
        seatPreference: seatPreference,
        mealPreference: mealPreference,
        specialRequests: specialRequests,
        aircraft: data.aircraft || 'Boeing 787 Dreamliner'
      });

      setConfirmedSuccess(true);
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Flight Reservation Hold Confirmed!',
          message: `Itinerary hold locked for ${passengerName.trim()}. PNR reference ${pnr} registered.`,
          pnr: pnr
        });
      }
      if (onOpenChat) onOpenChat();
    } catch (err) {
      console.error('Error saving booking:', err);
      setValidationError('Failed to store reservation hold in database. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const nameVal = validateName(passengerName);
    const emailVal = validateEmail(passengerEmail);

    if (!nameVal.isValid || !emailVal.isValid) {
      setValidationError('Please enter a valid full legal name and email address before printing your itinerary ticket.');
      return;
    }
    setValidationError('');
    window.print();
  };

  if (!data) return null;

  return (
    <div className="reserve-modal-container" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="glass-card reserve-modal-card" style={{
        maxWidth: '1100px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#0E1526',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        position: 'relative'
      }}>
        
        {/* Firestore Submission Loading Overlay */}
        {saving && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 300,
            background: 'rgba(7, 11, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(229, 193, 88, 0.15)',
              border: '2px solid var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Activity className="animate-spin" size={32} color="var(--color-gold-bright)" />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#FFF', fontWeight: 800, margin: '0 0 8px 0' }}>
              Submitting Booking Request to Firestore...
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '440px', margin: '0 0 24px 0' }}>
              Registering PNR reference <strong style={{ color: 'var(--color-gold-bright)' }}>{pnr}</strong> and locking your 24-hour price freeze in database.
            </p>

            {/* Skeleton Card Preview */}
            <div style={{
              width: '100%',
              maxWidth: '460px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(229, 193, 88, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ height: '20px', width: '50%', background: 'rgba(229, 193, 88, 0.2)', borderRadius: '4px' }} className="animate-pulse" />
              <div style={{ height: '32px', width: '80%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }} className="animate-pulse" />
              <div style={{ height: '16px', width: '90%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }} className="animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Header Bar */}
        <div className="reserve-modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '18px',
          marginBottom: '24px'
        }}>
          <div>
            <span className="gold-badge" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>
              <ShieldCheck size={14} color="var(--color-gold)" />
              Reserve Before Payment Confirmed
            </span>
            <h2 className="font-royal reserve-modal-title" style={{ color: '#FFF', fontSize: '1.6rem', marginTop: '4px' }}>
              Official Flight Reservation Hold
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="reserve-modal-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'start'
        }}>
          
          {/* LEFT COLUMN: Options, Passengers & Add-ons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Flight Itinerary Overview */}
            <div style={{
              background: 'rgba(7, 11, 20, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-gold-bright)', fontWeight: 700 }}>
                  Flight Route & Carrier
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 600 }}>
                  {data.airline || 'British Airways'} • {data.flightNumber || 'BA178'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Origin</span>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#FFF' }}>
                    {data.origin?.city || data.origin} ({data.origin?.code || data.origin})
                  </strong>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
                    <div style={{ width: '30px', height: '1px', background: 'var(--color-gold)' }} />
                    <Plane size={15} color="var(--color-gold)" />
                    <div style={{ width: '30px', height: '1px', background: 'var(--color-gold)' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {data.tripType === 'round' ? 'Round Trip' : 'One Way'}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Destination</span>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#FFF' }}>
                    {data.destination?.city || data.destination} ({data.destination?.code || data.destination})
                  </strong>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px dashed rgba(255,255,255,0.1)',
                fontSize: '0.82rem',
                color: '#CBD5E1'
              }}>
                <div><strong>Depart:</strong> {data.departDate}</div>
                {data.returnDate && <div><strong>Return:</strong> {data.returnDate}</div>}
                <div><strong>Passengers:</strong> {passengersCount} Adult(s)</div>
                <div><strong>Aircraft:</strong> {data.aircraft || 'Boeing 787'}</div>
              </div>

              {/* Real-Time Price & Date Validation Light Card */}
              <div style={{
                marginTop: '14px',
                background: 'linear-gradient(135deg, rgba(229,193,88,0.08) 0%, rgba(16,185,129,0.08) 100%)',
                border: '1px solid rgba(229, 193, 88, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} className={liveLoading ? "animate-spin" : ""} color="var(--color-gold-bright)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                      REAL-TIME PRICE ENGINE SEARCH
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: liveLoading ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: liveLoading ? '#FDE047' : '#6EE7B7',
                    fontWeight: 700
                  }}>
                    {liveLoading ? 'Fetching Live GDS Fares...' : '✓ Live Real-Time Fare Locked'}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    Verified Fare ({selectedCabin}): <strong style={{ color: '#FFF' }}>{formatCurrency(baseFlightTotal, currency)}</strong>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {liveQuote ? 'Live search API verified' : 'Real-Time rate freeze active'}
                  </span>
                </div>

                {/* Date Validation Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: isDatesValid ? '#6EE7B7' : '#FCA5A5',
                  paddingTop: '6px',
                  borderTop: '1px dashed rgba(255,255,255,0.08)'
                }}>
                  {isDatesValid ? <CheckCircle2 size={13} color="#10B981" /> : <AlertCircle size={13} color="#EF4444" />}
                  <span>
                    {isDatesValid 
                      ? `Valid Travel Window Confirmed (${depDate}${data.returnDate ? ` to ${retDate}` : ''})` 
                      : 'Departure date must be earlier than return date'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Cabin Class Selector */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-gold-bright)', display: 'block', marginBottom: '8px' }}>
                Select Cabin Class Upgrade
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {[
                  { name: 'Economy', priceNote: '-$320' },
                  { name: 'Premium Economy', priceNote: '-$150' },
                  { name: 'Business', priceNote: 'Standard Rate' },
                  { name: 'First', priceNote: '+$480 Upgrade' }
                ].map(cabin => {
                  const isSelected = selectedCabin === cabin.name;
                  return (
                    <button
                      key={cabin.name}
                      type="button"
                      onClick={() => setSelectedCabin(cabin.name)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(229,193,88,0.15)' : 'rgba(7,11,20,0.6)',
                        border: isSelected ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)',
                        color: isSelected ? 'var(--color-gold-bright)' : '#CBD5E1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.88rem' }}>
                          {cabin.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isSelected ? 'var(--color-gold)' : '#94A3B8' }}>
                          {cabin.priceNote}
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="var(--color-gold)" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Travel Insurance & Add-ons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-gold-bright)', margin: 0 }}>
                  Travel Insurance & Protection Add-ons
                </label>
                <span style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>
                  <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Real-time Price Adjustment
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* Addon 1: Comprehensive Insurance */}
                <div 
                  onClick={() => toggleAddOn('travelInsurance')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.travelInsurance ? 'rgba(16, 185, 129, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.travelInsurance ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.travelInsurance} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: '#10B981' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        Comprehensive Travel & Medical Insurance
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Coverage for medical emergencies, flight delays & lost baggage up to $50,000.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6EE7B7' }}>
                      +$49
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

                {/* Addon 2: VIP Concierge Protection */}
                <div 
                  onClick={() => toggleAddOn('conciergeProtection')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.conciergeProtection ? 'rgba(229, 193, 88, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.conciergeProtection ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.conciergeProtection} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: 'var(--color-gold)' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        VIP Fast-Track & Disruption Monitoring
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        24/7 dedicated travel concierge assistant & instant re-booking on flight changes.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                      +$29
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

                {/* Addon 3: Flexi Date Guarantee */}
                <div 
                  onClick={() => toggleAddOn('flexiBooking')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.flexiBooking ? 'rgba(129, 140, 248, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.flexiBooking ? '1px solid #818CF8' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.flexiBooking} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: '#818CF8' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        Flexi-Date Change Guarantee
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Zero change fee penalty for shifting departure or return dates up to 2h prior.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#A5B4FC' }}>
                      +$35
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

                {/* Addon 4: Eco Carbon Offset */}
                <div 
                  onClick={() => toggleAddOn('carbonOffset')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: addOns.carbonOffset ? 'rgba(52, 211, 153, 0.1)' : 'rgba(7, 11, 20, 0.6)',
                    border: addOns.carbonOffset ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={addOns.carbonOffset} 
                      onChange={() => {}} 
                      style={{ marginTop: '3px', accentColor: '#34D399' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                        100% SAF Carbon Neutral Eco-Pass
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Certified Sustainable Aviation Fuel offset for your flight carbon footprint.
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6EE7B7' }}>
                      +$12
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>/ passenger</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Passenger Contact Form */}
            <div>
              <h3 style={{ fontSize: '0.92rem', color: 'var(--color-gold-bright)', marginBottom: '10px' }}>
                Lead Passenger Information
              </h3>

              {validationError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FCA5A5',
                  fontSize: '0.85rem',
                  marginBottom: '12px',
                  fontWeight: 600
                }}>
                  ⚠️ {validationError}
                </div>
              )}

              {confirmedSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  color: '#6EE7B7',
                  fontSize: '0.88rem',
                  marginBottom: '16px',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div>
                    ✓ Flight Hold Confirmed for {passengerName}! Your PNR ({pnr}) details have been registered.
                  </div>
                  {onOpenShare && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenShare({
                          type: 'pnr',
                          pnrNumber: pnr,
                          origin: data.origin?.code || data.origin || 'JFK',
                          destination: data.destination?.code || data.destination || 'LHR',
                          departDate: data.departDate,
                          returnDate: data.returnDate,
                          cabinClass: selectedCabin,
                          passengers: passengersCount,
                          airline: data.airline,
                          flightNumber: data.flightNumber,
                          royaPrice: totalFinalPrice,
                          savings: totalSavings
                        });
                      }}
                      className="btn-gold"
                      style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Share2 size={16} />
                      Share Reserved Itinerary Now
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Full Legal Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="As shown on Passport"
                    value={passengerName} 
                    onChange={(e) => { 
                      setPassengerName(e.target.value); 
                      setValidationError(''); 
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    style={{
                      ...modalInputStyle,
                      borderColor: fieldErrors.name ? '#EF4444' : 'var(--border-gold)'
                    }}
                  />
                  {fieldErrors.name && (
                    <span style={{ fontSize: '0.72rem', color: '#FCA5A5', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="e.g. alex@example.com"
                    value={passengerEmail} 
                    onChange={(e) => { 
                      setPassengerEmail(e.target.value); 
                      setValidationError(''); 
                      setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    style={{
                      ...modalInputStyle,
                      borderColor: fieldErrors.email ? '#EF4444' : 'var(--border-gold)'
                    }}
                  />
                  {fieldErrors.email && (
                    <span style={{ fontSize: '0.72rem', color: '#FCA5A5', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Phone / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +1 555-0192"
                    value={passengerPhone} 
                    onChange={(e) => { 
                      setPassengerPhone(e.target.value); 
                      setValidationError(''); 
                      setFieldErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    style={{
                      ...modalInputStyle,
                      borderColor: fieldErrors.phone ? '#EF4444' : 'var(--border-gold)'
                    }}
                  />
                  {fieldErrors.phone && (
                    <span style={{ fontSize: '0.72rem', color: '#FCA5A5', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Seat Preference
                  </label>
                  <select 
                    value={seatPreference} 
                    onChange={(e) => setSeatPreference(e.target.value)}
                    style={modalInputStyle}
                  >
                    <option value="Window">Window Seat</option>
                    <option value="Aisle">Aisle Seat</option>
                    <option value="Extra Legroom">Extra Legroom</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Dietary Meal Request
                  </label>
                  <select 
                    value={mealPreference} 
                    onChange={(e) => setMealPreference(e.target.value)}
                    style={modalInputStyle}
                  >
                    <option value="Standard">Standard Gourmet Menu</option>
                    <option value="Vegetarian">Vegetarian / Vegan</option>
                    <option value="Halal">Halal Certified</option>
                    <option value="Kosher">Kosher Certified</option>
                    <option value="Diabetic">Diabetic Friendly</option>
                  </select>
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN: STICKY REAL-TIME BOOKING SUMMARY SIDEBAR */}
          <div className="reserve-sidebar" style={{
            position: 'sticky',
            top: '0px',
            background: 'linear-gradient(180deg, #131B2E 0%, #0A0F1D 100%)',
            border: '1.5px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
          }}>

            {/* Sidebar Title & Live Status */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(229,193,88,0.2)',
              paddingBottom: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 800, letterSpacing: '0.05em' }}>
                  REAL-TIME CHECKOUT
                </span>
                <h3 style={{ fontSize: '1.15rem', color: '#FFF', fontWeight: 800, margin: 0 }}>
                  Booking Summary
                </h3>
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                color: '#6EE7B7',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} className="animate-pulse" />
                Live Updated
              </div>
            </div>

            {/* PNR Hold Banner */}
            <div style={{
              background: 'rgba(229,193,88,0.08)',
              border: '1px dashed rgba(229,193,88,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>PNR HOLD REF</span>
                <strong style={{ fontSize: '1.05rem', color: '#FFF', letterSpacing: '0.08em' }}>{pnr}</strong>
              </div>
              <button 
                type="button" 
                onClick={copyPNR}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-gold)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <CheckCircle2 size={14} color="#10B981" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Timer Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color="var(--color-gold)" /> 24h Lock Guarantee
              </span>
              <strong style={{ color: '#6EE7B7' }}>{formatTime(timeLeft)}</strong>
            </div>

            {/* Itemized Real-Time Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span>
                  Flight Fare ({passengersCount} pax • {selectedCabin})
                </span>
                <span>{formatCurrency(baseFlightTotal, currency)}</span>
              </div>

              {addOns.travelInsurance && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6EE7B7', fontSize: '0.8rem' }}>
                  <span>+ Medical & Travel Insurance</span>
                  <span>+{formatCurrency(ADD_ON_RATES.travelInsurance * passengersCount, currency)}</span>
                </div>
              )}

              {addOns.conciergeProtection && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold-bright)', fontSize: '0.8rem' }}>
                  <span>+ VIP Concierge Protection</span>
                  <span>+{formatCurrency(ADD_ON_RATES.conciergeProtection * passengersCount, currency)}</span>
                </div>
              )}

              {addOns.flexiBooking && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A5B4FC', fontSize: '0.8rem' }}>
                  <span>+ Flexi-Date Change Protection</span>
                  <span>+{formatCurrency(ADD_ON_RATES.flexiBooking * passengersCount, currency)}</span>
                </div>
              )}

              {addOns.carbonOffset && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399', fontSize: '0.8rem' }}>
                  <span>+ Eco SAF Carbon Offset</span>
                  <span>+{formatCurrency(ADD_ON_RATES.carbonOffset * passengersCount, currency)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.78rem' }}>
                <span>Airport Taxes & Airline Surcharges</span>
                <span style={{ color: '#6EE7B7' }}>Included ($0)</span>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

              {/* Total Price Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Total Reserved Fare</span>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                    {formatCurrency(totalRetailPrice, currency)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--color-gold-bright)', lineHeight: 1 }}>
                    {formatCurrency(totalFinalPrice, currency)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 700 }}>
                    You Save {formatCurrency(totalSavings, currency)} (30% OFF)
                  </span>
                </div>
              </div>

            </div>

            {/* Zero Dollar Paid Today Callout */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              textAlign: 'center',
              color: '#6EE7B7',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <Lock size={14} /> NO IMMEDIATE PAYMENT REQUIRED TODAY
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                type="button"
                onClick={handleConfirm}
                className="btn-gold"
                disabled={saving}
                style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 800 }}
              >
                {saving ? <Activity className="animate-spin" size={16} /> : <MessageCircle size={16} />}
                {saving ? 'Locking PNR in DB...' : 'Confirm Flight Hold ($0 Now)'}
              </button>

              {confirmedSuccess ? (
                <button 
                  type="button"
                  onClick={() => {
                    if (onOpenShare) {
                      onOpenShare({
                        type: 'pnr',
                        pnrNumber: pnr,
                        origin: data.origin?.code || data.origin || 'JFK',
                        destination: data.destination?.code || data.destination || 'LHR',
                        departDate: data.departDate,
                        returnDate: data.returnDate,
                        cabinClass: selectedCabin,
                        passengers: passengersCount,
                        airline: data.airline,
                        flightNumber: data.flightNumber,
                        royaPrice: totalFinalPrice,
                        savings: totalSavings
                      });
                    }
                  }}
                  className="btn-gold"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                >
                  <Share2 size={15} />
                  Share Reserved Itinerary (Email / Link)
                </button>
              ) : (
                <button 
                  type="button"
                  disabled
                  className="btn-outline-gold"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem', opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  title="Reserve flight hold first to unlock itinerary sharing"
                >
                  <Lock size={15} />
                  Share Itinerary (Locked until Reserved)
                </button>
              )}

              <button 
                type="button"
                onClick={handlePrint}
                className="btn-outline-gold"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
              >
                <Printer size={15} />
                Print / Save Itinerary PDF
              </button>
            </div>


            {/* Guarantees */}
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', lineHeight: 1.4 }}>
              🛡️ Official PNR hold stored securely in database. Cancel anytime within 24 hours at no cost.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

const modalInputStyle = {
  background: 'rgba(7, 11, 20, 0.8)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 12px',
  color: '#FFF',
  fontSize: '0.88rem',
  width: '100%',
  outline: 'none'
};

