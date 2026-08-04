import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FlightSearchForm from './components/FlightSearchForm';
import RealTimeFlightResults from './components/RealTimeFlightResults';
import FeatureGrid from './components/FeatureGrid';
import DestinationExplorer from './components/DestinationExplorer';
import FlightStatusSection from './components/FlightStatusSection';
import UserReviews from './components/UserReviews';
import ReserveModal from './components/ReserveModal';
import ShareItineraryModal from './components/ShareItineraryModal';
import BookingTracker from './components/BookingTracker';
import ConciergeChat from './components/ConciergeChat';
import ContactModal from './components/ContactModal';
import AdminPortal from './components/AdminPortal';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';
import AnimatedSection from './components/AnimatedSection';
import { POPULAR_AIRPORTS as SEED_AIRPORTS } from './data/destinations';
import { fetchAirportsFromFirestore } from './lib/destinationsService';

export default function App() {
  const [airports, setAirports] = useState(SEED_AIRPORTS);
  const [currency, setCurrency] = useState('USD');
  const [reserveModalData, setReserveModalData] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    async function loadAirports() {
      try {
        const fetched = await fetchAirportsFromFirestore();
        if (Array.isArray(fetched) && fetched.length > 0) {
          setAirports(fetched);
        }
      } catch (e) {
        console.warn('Error fetching airports in App.jsx:', e);
      }
    }
    loadAirports();
  }, []);


  
  // Share Itinerary State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = 'success', title, message, pnr, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message, pnr, duration }]);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Real-time Flight Search API State
  const [searchQuery, setSearchQuery] = useState({
    origin: 'JFK',
    destination: 'LHR',
    departDate: '2026-08-15',
    returnDate: '2026-08-29',
    tripType: 'round',
    cabinClass: 'Business',
    passengers: 1
  });
  const [flights, setFlights] = useState([]);
  const [priceTrend, setPriceTrend] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Handle Share Modal Trigger
  const handleOpenShare = (customData) => {
    const payload = customData || {
      type: 'search',
      origin: searchQuery.origin,
      destination: searchQuery.destination,
      departDate: searchQuery.departDate,
      returnDate: searchQuery.returnDate,
      cabinClass: searchQuery.cabinClass,
      passengers: searchQuery.passengers,
      segments: searchQuery.segments
    };
    setShareData(payload);
    setIsShareModalOpen(true);
  };


  // Perform initial search on load
  useEffect(() => {
    executeFlightSearch(searchQuery);
  }, []);

  const [searchMeta, setSearchMeta] = useState({});

  const executeFlightSearch = async (query) => {
    setSearchLoading(true);
    setSearchError('');
    setSearchQuery(query);

    try {
      // Parallel API requests to flight search & price trends
      const [searchRes, trendRes] = await Promise.all([
        fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query)
        }),
        fetch('/api/flights/price-trend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: query.origin, destination: query.destination, cabinClass: query.cabinClass })
        })
      ]);

      const searchData = await searchRes.json();
      const trendData = await trendRes.json();

      if (searchData.success && searchData.flights) {
        setFlights(searchData.flights);
        setSearchMeta(searchData.meta || {});
      } else {
        setSearchError(searchData.error || 'No flights found for this route');
      }

      if (trendData.success) {
        setPriceTrend(trendData);
      }

    } catch (err) {
      console.error("Flight search API failed:", err);
      setSearchError("Failed to connect to real-time flight search API.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchFlights = (queryData) => {
    executeFlightSearch(queryData);
    
    // Smooth scroll down to real-time results
    setTimeout(() => {
      const el = document.getElementById('realtime-results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleSelectFlight = (flight) => {
    const originObj = airports.find(a => a.code === flight.origin) || { code: flight.origin, city: flight.origin, name: flight.origin };
    const destObj = airports.find(a => a.code === flight.destination) || { code: flight.destination, city: flight.destination, name: flight.destination };


    setReserveModalData({
      tripType: searchQuery.tripType || 'round',
      origin: originObj,
      destination: destObj,
      departDate: searchQuery.departDate || '2026-08-15',
      returnDate: searchQuery.returnDate || '2026-08-29',
      passengers: searchQuery.passengers || 1,
      cabinClass: flight.cabinClass || searchQuery.cabinClass || 'Business',
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      aircraft: flight.aircraft,
      reserveBeforePayment: true,
      savings: {
        originalPrice: flight.retailPrice,
        discountAmount: flight.savings || Math.round(flight.retailPrice * 0.30),
        finalPrice: flight.royaPrice,
        savingsPercentage: 30
      }
    });
  };

  const handleSelectDestination = (dest) => {
    const code = dest.airport.split(' ')[0];
    const newQuery = {
      origin: 'JFK',
      destination: code,
      departDate: '2026-08-20',
      returnDate: '2026-09-03',
      tripType: 'round',
      cabinClass: 'Business',
      passengers: 1
    };
    executeFlightSearch(newQuery);

    const el = document.getElementById('realtime-results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSearch = () => {
    const el = document.getElementById('reserve');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Navigation */}
      <Navbar 
        onOpenSearch={scrollToSearch}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenShare={handleOpenShare}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />


      {/* Main Hero */}
      <AnimatedSection animation="fade-in">
        <Hero 
          onStartSearch={scrollToSearch}
          onOpenChat={() => setIsChatOpen(true)}
        />
      </AnimatedSection>

      {/* Core Concierge Booking Search Engine */}
      <AnimatedSection animation="slide-up">
        <FlightSearchForm 
          onSearchFlights={handleSearchFlights}
          loading={searchLoading}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
      </AnimatedSection>

      {/* Real-Time Live Flight Search Results & Price Comparison */}
      <AnimatedSection animation="scale-up">
        <RealTimeFlightResults 
          flights={flights}
          searchQuery={searchQuery}
          loading={searchLoading}
          error={searchError}
          priceTrend={priceTrend}
          searchMeta={searchMeta}
          onSelectFlight={handleSelectFlight}
          currency={currency}
        />
      </AnimatedSection>

      {/* Brand Value Grid (Save up to 30%, Reserve before payment, etc.) */}
      <AnimatedSection animation="slide-up">
        <FeatureGrid 
          onOpenSearch={scrollToSearch}
          onOpenChat={() => setIsChatOpen(true)}
        />
      </AnimatedSection>

      {/* Destination & Savings Visualizer + Integrated Travel Insights */}
      <AnimatedSection animation="slide-up">
        <DestinationExplorer 
          onSelectDestination={handleSelectDestination}
          currency={currency}
        />
      </AnimatedSection>

      {/* Flight Status Lookup Section */}
      <AnimatedSection animation="slide-up">
        <FlightStatusSection 
          onSelectFlight={handleSelectFlight}
        />
      </AnimatedSection>

      {/* Customer Feedback & Reviews Section */}
      <AnimatedSection animation="slide-up">
        <UserReviews 
          onOpenChat={() => setIsChatOpen(true)}
        />
      </AnimatedSection>

      {/* FAQ Section with SEO JSON-LD Microdata support */}
      <AnimatedSection animation="slide-up">
        <FAQSection />
      </AnimatedSection>

      {/* Keyboard shortcut for Admin Access (Ctrl+Shift+A) */}
      {useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            setIsAdminOpen(true);
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [])}

      {/* Footer */}
      <Footer 
        onOpenChat={() => setIsChatOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Reserve Before Payment Itinerary Hold Modal */}
      {reserveModalData && (
        <ReserveModal 
          data={reserveModalData}
          currency={currency}
          showToast={showToast}
          onClose={() => setReserveModalData(null)}
          onOpenShare={handleOpenShare}
          onOpenChat={() => {
            setReserveModalData(null);
            setIsChatOpen(true);
          }}
        />
      )}

      {/* Share Itinerary Modal */}
      <ShareItineraryModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareData={shareData}
        currency={currency}
      />


      {/* PNR Booking Tracker & Live Flight Status Modal */}
      <BookingTracker 
        isOpen={isTrackerOpen}
        currency={currency}
        showToast={showToast}
        onClose={() => setIsTrackerOpen(false)}
        onOpenShare={handleOpenShare}
        onOpenChat={() => {
          setIsTrackerOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Contact Us Dialog (Phone & Email options) */}
      <ContactModal 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onOpenChat={() => {
          setIsContactOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Concierge Messaging Assistant ("Send us a message") */}
      <ConciergeChat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Executive Concierge & Reservation Admin Portal Modal */}
      <AdminPortal 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        showToast={showToast}
        currency={currency}
      />

      {/* Toast Notification Container */}
      <ToastNotification 
        toasts={toasts} 
        onDismiss={handleDismissToast} 
      />


    </div>
  );
}
