import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, ShieldAlert, Key, RefreshCw, UserCheck, UserX, 
  Search, Filter, CheckCircle2, Clock, Plane, FileText, AlertCircle, 
  Lock, Copy, ExternalLink, ArrowRight, DollarSign, Database, Plus,
  Trash2, Edit, MapPin, Sparkles, Layers, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  fetchAllBookingsForAdmin, 
  updateBookingStatusInDatabase, 
  updateBookingDetailsInDatabase,
  deleteBookingFromDatabase,
  saveBookingToDatabase 
} from '../lib/bookingsService';
import { 
  fetchDestinationsFromFirestore, 
  seedDestinationsToFirestore, 
  createDestinationInFirestore, 
  updateDestinationInFirestore, 
  deleteDestinationFromFirestore 
} from '../lib/destinationsService';

export default function AdminPortal({ isOpen, onClose, showToast, currency = 'USD' }) {
  const { user, isAdmin, idToken, tokenClaims, grantAdminRole, revokeAdminRole, refreshToken } = useAuth();

  const [activeTab, setActiveTab] = useState('BOOKINGS'); // 'BOOKINGS' | 'DESTINATIONS' | 'SECURITY'
  
  // Admin Login Authentication State
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  
  // Destinations state
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destRegionFilter, setDestRegionFilter] = useState('All');
  const [destSearchQuery, setDestSearchQuery] = useState('');

  // Security test result
  const [securityTestResult, setSecurityTestResult] = useState(null);
  const [testingAccess, setTestingAccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState('');

  // Modals for CRUD operations
  const [isCreateDestinationOpen, setIsCreateDestinationOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Auto load when modal opens and authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminBookings();
      loadAdminDestinations();
    }
  }, [isOpen, isAuthenticated, isAdmin, idToken]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setAuthenticating(true);

    const validUsernames = ['admin', 'royabridge', 'executive', 'concierge'];
    const validPasswords = ['royabridge2026', 'admin123', 'roya2026', 'admin'];

    const u = adminUsernameInput.trim().toLowerCase();
    const p = adminPasswordInput.trim();

    if (validUsernames.includes(u) && validPasswords.includes(p)) {
      try {
        await grantAdminRole();
        setIsAuthenticated(true);
        if (showToast) {
          showToast({
            type: 'success',
            title: 'Admin Session Authenticated',
            message: 'Executive Admin Portal unlocked with Firestore access.'
          });
        }
      } catch (err) {
        setIsAuthenticated(true); // Grant access locally if auth mock
      } finally {
        setAuthenticating(false);
      }
    } else {
      setAuthenticating(false);
      setLoginError('Invalid admin username or password. Please verify your credentials.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setAdminUsernameInput('');
    setAdminPasswordInput('');
    if (revokeAdminRole) revokeAdminRole();
    if (showToast) {
      showToast({
        type: 'info',
        title: 'Admin Logged Out',
        message: 'Executive Admin session locked.'
      });
    }
  };

  const loadAdminBookings = async () => {
    setBookingsLoading(true);
    setSecurityTestResult(null);
    try {
      const res = await fetchAllBookingsForAdmin(idToken, isAdmin);
      setBookings(res.bookings || []);
      setSecurityTestResult({
        success: true,
        firestoreSuccess: res.firestoreSuccess,
        apiSuccess: res.apiSuccess,
        message: 'Database read verified successfully with token.admin === true'
      });
    } catch (err) {
      console.warn('[Admin Portal] Database access restricted:', err);
      setBookings([]);
      setSecurityTestResult({
        success: false,
        error: err.message || 'Database Access Denied: Token does not contain admin === true',
        firestoreError: err.firestoreError,
        apiError: err.apiError
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadAdminDestinations = async () => {
    setDestinationsLoading(true);
    try {
      const data = await fetchDestinationsFromFirestore();
      setDestinations(data || []);
    } catch (err) {
      console.warn('Error loading destinations:', err);
    } finally {
      setDestinationsLoading(false);
    }
  };

  const handleSeedDestinations = async () => {
    setActionLoading(true);
    try {
      await seedDestinationsToFirestore();
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Destinations Seeded to Firebase',
          message: 'All 24 global luxury routes successfully synced to Firestore database.'
        });
      }
      await loadAdminDestinations();
    } catch (e) {
      if (showToast) showToast({ type: 'error', title: 'Seeding Failed', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Roles & Tokens handlers
  const handleGrantRole = async () => {
    setActionLoading(true);
    try {
      await grantAdminRole();
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Admin Role Granted!',
          message: 'Client ID Token refreshed immediately. token.admin === true acquired.'
        });
      }
      await loadAdminBookings();
      await loadAdminDestinations();
    } catch (err) {
      if (showToast) showToast({ type: 'error', title: 'Role Grant Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeRole = async () => {
    setActionLoading(true);
    try {
      await revokeAdminRole();
      if (showToast) {
        showToast({
          type: 'info',
          title: 'Admin Role Revoked',
          message: 'Client ID Token refreshed immediately.'
        });
      }
      await loadAdminBookings();
    } catch (err) {
      if (showToast) showToast({ type: 'error', title: 'Role Revoke Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualTokenRefresh = async () => {
    setActionLoading(true);
    try {
      const freshRes = await refreshToken();
      if (showToast) {
        showToast({
          type: 'success',
          title: 'ID Token Refreshed',
          message: `Fresh JWT fetched. Admin claim = ${Boolean(freshRes?.claims?.admin)}`
        });
      }
      await loadAdminBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestDatabaseAccess = async () => {
    setTestingAccess(true);
    await loadAdminBookings();
    setTestingAccess(false);
  };

  // BOOKING CRUD Operations
  const handleToggleBookingStatus = async (pnr, currentStatus) => {
    const nextStatus = currentStatus === 'CONFIRMED_HOLD' ? 'TICKETED' : 'CONFIRMED_HOLD';
    await updateBookingStatusInDatabase(pnr, nextStatus);
    setBookings(prev => prev.map(b => b.pnr === pnr ? { ...b, status: nextStatus } : b));
    if (showToast) {
      showToast({
        type: 'success',
        title: `PNR ${pnr} Updated`,
        message: `Booking status changed to ${nextStatus}`
      });
    }
  };

  const handleDeleteBooking = async (pnr) => {
    if (!window.confirm(`Are you sure you want to delete booking PNR ${pnr}?`)) return;
    try {
      await deleteBookingFromDatabase(pnr);
      setBookings(prev => prev.filter(b => b.pnr !== pnr));
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Booking Deleted',
          message: `PNR ${pnr} removed from Firebase Store database.`
        });
      }
    } catch (e) {
      if (showToast) showToast({ type: 'error', title: 'Delete Failed', message: e.message });
    }
  };

  const handleSaveBookingForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookingData = {
      pnr: formData.get('pnr') ? formData.get('pnr').toUpperCase() : undefined,
      passengerName: formData.get('passengerName'),
      passengerEmail: formData.get('passengerEmail'),
      passengerPhone: formData.get('passengerPhone'),
      airline: formData.get('airline'),
      flightNumber: formData.get('flightNumber'),
      origin: formData.get('origin').toUpperCase(),
      originCity: formData.get('originCity') || formData.get('origin'),
      destination: formData.get('destination').toUpperCase(),
      destinationCity: formData.get('destinationCity') || formData.get('destination'),
      departDate: formData.get('departDate'),
      returnDate: formData.get('returnDate') || null,
      cabinClass: formData.get('cabinClass'),
      passengersCount: Number(formData.get('passengersCount')) || 1,
      retailPrice: Number(formData.get('retailPrice')) || 1200,
      royaPrice: Number(formData.get('royaPrice')) || 840,
      savings: (Number(formData.get('retailPrice')) || 1200) - (Number(formData.get('royaPrice')) || 840),
      status: formData.get('status')
    };

    setActionLoading(true);
    try {
      if (editingBooking) {
        await updateBookingDetailsInDatabase(editingBooking.pnr, bookingData);
        if (showToast) showToast({ type: 'success', title: 'Booking Updated', message: `PNR ${editingBooking.pnr} saved.` });
        setEditingBooking(null);
      } else {
        const created = await saveBookingToDatabase(bookingData);
        if (showToast) showToast({ type: 'success', title: 'Booking Created', message: `New booking ${created.pnr} saved to Firebase Store.` });
        setIsCreateBookingOpen(false);
      }
      await loadAdminBookings();
    } catch (err) {
      if (showToast) showToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // DESTINATION CRUD Operations
  const handleDeleteDestination = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete destination "${name}" (${id})?`)) return;
    try {
      await deleteDestinationFromFirestore(id);
      setDestinations(prev => prev.filter(d => d.id !== id));
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Destination Deleted',
          message: `Destination ${name} removed from Firestore.`
        });
      }
    } catch (e) {
      if (showToast) showToast({ type: 'error', title: 'Delete Failed', message: e.message });
    }
  };

  const handleSaveDestinationForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const destData = {
      id: formData.get('id') || `dest_${Date.now()}`,
      name: formData.get('name'),
      airport: formData.get('airport').toUpperCase(),
      region: formData.get('region'),
      image: formData.get('image') || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      retailPrice: Number(formData.get('retailPrice')) || 1000,
      royaPrice: Number(formData.get('royaPrice')) || 700,
      discount: formData.get('discount') || '30%',
      popular: formData.get('popular') === 'on' || formData.get('popular') === 'true',
      tagline: formData.get('tagline'),
      bestTimeToVisit: formData.get('bestTimeToVisit'),
      visaRequirement: formData.get('visaRequirement'),
      currency: formData.get('currency'),
      language: formData.get('language'),
      averageFlightDuration: formData.get('averageFlightDuration'),
      highlights: (formData.get('highlights') || '').split(',').map(s => s.trim()).filter(Boolean)
    };

    setActionLoading(true);
    try {
      if (editingDestination) {
        await updateDestinationInFirestore(editingDestination.id, destData);
        if (showToast) showToast({ type: 'success', title: 'Destination Updated', message: `${destData.name} updated in Firestore.` });
        setEditingDestination(null);
      } else {
        await createDestinationInFirestore(destData);
        if (showToast) showToast({ type: 'success', title: 'Destination Created', message: `${destData.name} added to Firebase Store.` });
        setIsCreateDestinationOpen(false);
      }
      await loadAdminDestinations();
    } catch (err) {
      if (showToast) showToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const copyPnrToClipboard = (pnr) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(''), 2000);
  };

  if (!isOpen) return null;

  // Render Admin Password Authentication Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-portal-backdrop" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        background: 'rgba(5, 8, 16, 0.94)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div className="glass-card" style={{
          maxWidth: '440px',
          width: '100%',
          background: 'linear-gradient(180deg, rgba(14, 21, 38, 0.98) 0%, rgba(7, 11, 20, 0.98) 100%)',
          border: '1.5px solid var(--border-gold-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
          position: 'relative'
        }}>
          {/* Close Modal */}
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

          {/* Security Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(229, 193, 88, 0.15)',
              border: '1.5px solid var(--color-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold-bright)',
              marginBottom: '12px'
            }}>
              <Lock size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', margin: '0 0 6px 0' }}>
              Staff Admin Gate
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
              Enter administrator username and password to unlock reservation controls & Firestore CRUD access.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loginError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: '#FCA5A5',
                fontSize: '0.84rem',
                fontWeight: 600
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-gold-bright)', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Admin Username
              </label>
              <input 
                type="text" 
                placeholder="e.g. admin"
                value={adminUsernameInput}
                onChange={(e) => { setAdminUsernameInput(e.target.value); setLoginError(''); }}
                required
                style={{
                  width: '100%',
                  background: 'rgba(7, 11, 20, 0.8)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-gold-bright)', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Security Password
              </label>
              <input 
                type="password" 
                placeholder="Enter admin password"
                value={adminPasswordInput}
                onChange={(e) => { setAdminPasswordInput(e.target.value); setLoginError(''); }}
                required
                style={{
                  width: '100%',
                  background: 'rgba(7, 11, 20, 0.8)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-gold" 
              disabled={authenticating}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 800, marginTop: '8px' }}
            >
              {authenticating ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={18} />}
              {authenticating ? 'Authenticating Credentials...' : 'Unlock Executive Portal'}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#64748B' }}>
            🔐 Default Admin: <strong style={{ color: 'var(--color-gold)' }}>admin</strong> | Password: <strong style={{ color: 'var(--color-gold)' }}>royabridge2026</strong>
          </div>
        </div>
      </div>
    );
  }

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'CONFIRMED_HOLD' && b.status === 'CONFIRMED_HOLD') ||
      (filterStatus === 'TICKETED' && b.status === 'TICKETED');

    const cleanQuery = bookingSearchQuery.trim().toLowerCase();
    const matchesSearch = !cleanQuery || 
      b.pnr?.toLowerCase().includes(cleanQuery) ||
      b.passengerName?.toLowerCase().includes(cleanQuery) ||
      b.passengerEmail?.toLowerCase().includes(cleanQuery) ||
      b.flightNumber?.toLowerCase().includes(cleanQuery) ||
      b.airline?.toLowerCase().includes(cleanQuery);

    return matchesStatus && matchesSearch;
  });

  // Filter Destinations
  const filteredDestinations = destinations.filter(d => {
    const matchesRegion = destRegionFilter === 'All' || d.region === destRegionFilter;
    const q = destSearchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      d.name?.toLowerCase().includes(q) ||
      d.airport?.toLowerCase().includes(q) ||
      d.tagline?.toLowerCase().includes(q)
    );
    return matchesRegion && matchesQuery;
  });

  const totalReserved = bookings.filter(b => b.status === 'CONFIRMED_HOLD').length;
  const totalBooked = bookings.filter(b => b.status === 'TICKETED').length;
  const totalVolume = bookings.reduce((sum, b) => sum + (Number(b.royaPrice || b.totalFare) || 0), 0);

  return (
    <div className="admin-portal-backdrop" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 220,
      background: 'rgba(5, 8, 16, 0.94)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div className="glass-card admin-portal-modal" style={{
        maxWidth: '1280px',
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
        background: '#090F1E',
        border: '1.5px solid var(--border-gold-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
      }}>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
          paddingBottom: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="gold-badge" style={{ fontSize: '0.78rem' }}>
                <ShieldCheck size={14} color="var(--color-gold)" />
                Executive Concierge & Admin CRUD Portal
              </span>

              {/* Security Admin Role Indicator Badge */}
              {isAdmin ? (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#6EE7B7',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <CheckCircle2 size={13} />
                  ADMIN TOKEN VERIFIED (admin === true)
                </span>
              ) : (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#FCA5A5',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <ShieldAlert size={13} />
                  REGULAR USER MODE
                </span>
              )}
            </div>

            <h2 className="font-royal" style={{ color: '#FFF', fontSize: '1.75rem', margin: 0 }}>
              Firebase Store Admin Dashboard (CRUD Operations)
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={handleAdminLogout}
              className="btn-outline-gold"
              style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
              title="Lock & Exit Admin Portal Session"
            >
              <Lock size={14} />
              Lock Session
            </button>

            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
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
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'BOOKINGS' ? 'linear-gradient(135deg, rgba(229,193,88,0.25) 0%, rgba(184,144,37,0.15) 100%)' : 'rgba(15,23,42,0.6)',
                color: activeTab === 'BOOKINGS' ? 'var(--color-gold-bright)' : '#94A3B8',
                border: activeTab === 'BOOKINGS' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <FileSpreadsheet size={16} />
              Bookings & Holds ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('DESTINATIONS')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'DESTINATIONS' ? 'linear-gradient(135deg, rgba(229,193,88,0.25) 0%, rgba(184,144,37,0.15) 100%)' : 'rgba(15,23,42,0.6)',
                color: activeTab === 'DESTINATIONS' ? 'var(--color-gold-bright)' : '#94A3B8',
                border: activeTab === 'DESTINATIONS' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <MapPin size={16} />
              Destinations Inventory ({destinations.length})
            </button>

            <button
              onClick={() => setActiveTab('SECURITY')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'SECURITY' ? 'linear-gradient(135deg, rgba(229,193,88,0.25) 0%, rgba(184,144,37,0.15) 100%)' : 'rgba(15,23,42,0.6)',
                color: activeTab === 'SECURITY' ? 'var(--color-gold-bright)' : '#94A3B8',
                border: activeTab === 'SECURITY' ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Key size={16} />
              Role & Claims Controller
            </button>
          </div>

          {!isAdmin && (
            <button
              type="button"
              onClick={handleGrantRole}
              disabled={actionLoading}
              className="btn-gold"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <UserCheck size={14} />
              Claim Admin Access
            </button>
          )}
        </div>

        {/* TAB 1: BOOKINGS & HOLDS MANAGEMENT */}
        {activeTab === 'BOOKINGS' && (
          <div>
            {/* Top Action Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFF', margin: 0 }}>
                  Flight Reservations & PNR Holds (Admin CRUD)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                  Manage, edit details, change statuses, or delete booking records in Firestore.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsCreateBookingOpen(true)}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <Plus size={15} />
                  Add New Booking Record
                </button>
                <button
                  onClick={loadAdminBookings}
                  className="btn-outline-gold"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} className={bookingsLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={metricCardStyle}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Total Bookings</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>{bookings.length}</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-bright)' }}>Firestore `bookings` collection</span>
              </div>
              <div style={metricCardStyle}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Reserved Holds</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold-bright)', marginTop: '2px' }}>{totalReserved}</div>
                <span style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>Status: CONFIRMED_HOLD</span>
              </div>
              <div style={metricCardStyle}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Ticketed Flights</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6EE7B7', marginTop: '2px' }}>{totalBooked}</div>
                <span style={{ fontSize: '0.72rem', color: '#38BDF8' }}>Status: TICKETED</span>
              </div>
              <div style={metricCardStyle}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Gross Volume</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>${totalVolume.toLocaleString()}</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}>Total fare value</span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(7,11,20,0.6)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { id: 'ALL', label: `All (${bookings.length})` },
                  { id: 'CONFIRMED_HOLD', label: `Holds (${totalReserved})` },
                  { id: 'TICKETED', label: `Ticketed (${totalBooked})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: filterStatus === tab.id ? 800 : 600,
                      color: filterStatus === tab.id ? 'var(--color-gold-bright)' : '#94A3B8',
                      background: filterStatus === tab.id ? 'rgba(229, 193, 88, 0.18)' : 'transparent',
                      border: filterStatus === tab.id ? '1px solid var(--color-gold)' : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search PNR, Passenger, Email..."
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(7,11,20,0.8)',
                    border: '1px solid var(--border-gold)',
                    color: '#FFF',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Bookings Table */}
            <div style={{ background: 'rgba(7, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
              {bookingsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                  <RefreshCw size={24} className="animate-spin" color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
                  <div>Fetching user bookings from Firebase Store...</div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                  <FileText size={32} color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
                  <div>No booking records match your current filter.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid rgba(229,193,88,0.2)', background: 'rgba(15, 23, 42, 0.9)', color: 'var(--color-gold-bright)' }}>
                      <th style={thStyle}>PNR REF</th>
                      <th style={thStyle}>PASSENGER</th>
                      <th style={thStyle}>FLIGHT & ROUTE</th>
                      <th style={thStyle}>CABIN & PAX</th>
                      <th style={thStyle}>DEPARTURE</th>
                      <th style={thStyle}>STATUS</th>
                      <th style={thStyle}>FARE</th>
                      <th style={thStyle}>ADMIN ACTIONS (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, idx) => {
                      const isHold = b.status === 'CONFIRMED_HOLD';
                      return (
                        <tr key={b.pnr || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#FFF', letterSpacing: '0.08em' }}>{b.pnr}</strong>
                              <button type="button" onClick={() => copyPnrToClipboard(b.pnr)} style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', padding: '2px' }}>
                                {copiedPnr === b.pnr ? <CheckCircle2 size={13} color="#10B981" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <strong style={{ color: '#FFF', display: 'block' }}>{b.passenger || b.passengerName}</strong>
                            <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{b.email || b.passengerEmail}</span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ color: '#FFF', fontWeight: 700 }}>{b.airline} • {b.flightNumber}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--color-gold-bright)' }}>{b.route || `${b.origin} → ${b.destination}`}</div>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ color: '#CBD5E1', display: 'block' }}>{b.cabin || b.cabinClass}</span>
                            <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{b.passengers || b.passengersCount} Pax</span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ color: '#FFF' }}>{b.departDate}</span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              background: isHold ? 'rgba(229, 193, 88, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              border: isHold ? '1px solid var(--color-gold)' : '1px solid #10B981',
                              color: isHold ? 'var(--color-gold-bright)' : '#6EE7B7',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isHold ? 'HOLD' : 'TICKETED'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <strong style={{ color: '#6EE7B7' }}>${(b.totalFare || b.royaPrice || 840).toLocaleString()}</strong>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleBookingStatus(b.pnr, b.status)}
                                style={{
                                  background: isHold ? 'rgba(16, 185, 129, 0.15)' : 'rgba(229, 193, 88, 0.15)',
                                  border: isHold ? '1px solid #10B981' : '1px solid var(--color-gold)',
                                  color: isHold ? '#6EE7B7' : 'var(--color-gold-bright)',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {isHold ? 'Mark Ticketed' : 'Mark Hold'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingBooking(b)}
                                title="Edit Booking"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                <Edit size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b.pnr)}
                                title="Delete Booking"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DESTINATIONS INVENTORY MANAGEMENT */}
        {activeTab === 'DESTINATIONS' && (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFF', margin: 0 }}>
                  Global Destinations Inventory (Firebase Store CRUD)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                  Create new travel routes, update prices/insights, or remove destination documents from Firestore.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSeedDestinations}
                  disabled={actionLoading}
                  className="btn-outline-gold"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <Database size={15} />
                  Reseed Default Inventory
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateDestinationOpen(true)}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <Plus size={15} />
                  Add New Destination
                </button>
              </div>
            </div>

            {/* Region & Search Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Americas', 'Asia', 'Europe', 'Middle East', 'Africa'].map(reg => (
                  <button
                    key={reg}
                    onClick={() => setDestRegionFilter(reg)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: destRegionFilter === reg ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                      background: destRegionFilter === reg ? 'rgba(229, 193, 88, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: destRegionFilter === reg ? 'var(--color-gold-bright)' : '#94A3B8',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search city or airport (e.g. Dubai, LHR)..."
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(7,11,20,0.8)',
                    border: '1px solid var(--border-gold)',
                    color: '#FFF',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Destinations Grid */}
            {destinationsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                <RefreshCw size={24} className="animate-spin" color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
                <div>Loading destinations inventory from Firestore...</div>
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: 'rgba(7,11,20,0.6)', borderRadius: '12px' }}>
                <MapPin size={32} color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
                <div>No destinations found. Click "Reseed Default Inventory" or "Add New Destination".</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredDestinations.map(d => (
                  <div key={d.id} className="glass-card" style={{ padding: '16px', border: '1px solid rgba(212, 175, 55, 0.25)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ height: '120px', borderRadius: '8px', backgroundImage: `url('${d.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(7,11,20,0.85)', color: 'var(--color-gold-bright)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {d.region}
                      </span>
                      <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--color-gold)', color: '#070B14', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                        SAVE UP TO {d.discount?.toLowerCase().includes('up to') ? d.discount.replace(/up to\s*/i, '') : d.discount}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ color: '#FFF', fontSize: '1.1rem', margin: 0 }}>{d.name}</h4>
                      <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', fontWeight: 600 }}>Airport: {d.airport}</span>
                      <p style={{ color: '#94A3B8', fontSize: '0.76rem', margin: '4px 0 0 0', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{d.tagline}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>${d.retailPrice}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6EE7B7', marginLeft: '6px' }}>${d.royaPrice}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#38BDF8' }}>{d.averageFlightDuration || 'Flight: 7h'}</span>
                    </div>

                    {/* Admin Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingDestination(d)}
                        className="btn-outline-gold"
                        style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }}
                      >
                        <Edit size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDestination(d.id, d.name)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid #EF4444',
                          color: '#FCA5A5',
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ROLE & SECURITY CLAIMS CONTROLLER */}
        {activeTab === 'SECURITY' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 29, 0.9) 100%)',
              border: '1.5px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--color-gold-bright)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={18} />
                    Admin Custom Claim & Auth Token Management
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                    Calls server endpoint `/api/admin/set-role` to persist claims and forces immediate client token refresh via `getIdTokenResult(true)`.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {!isAdmin ? (
                    <button
                      type="button"
                      onClick={handleGrantRole}
                      disabled={actionLoading}
                      className="btn-gold"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <UserCheck size={16} />
                      {actionLoading ? 'Granting Role...' : 'Grant Admin Role (admin === true)'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRevokeRole}
                      disabled={actionLoading}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #EF4444',
                        color: '#FCA5A5',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <UserX size={16} />
                      {actionLoading ? 'Revoking Role...' : 'Revoke Admin Role'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleManualTokenRefresh}
                    disabled={actionLoading}
                    className="btn-outline-gold"
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    <RefreshCw size={15} className={actionLoading ? 'animate-spin' : ''} />
                    Force Token Refresh
                  </button>
                </div>
              </div>

              {/* Session Token Details */}
              <div style={{
                background: 'rgba(7, 11, 20, 0.7)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: '#94A3B8' }}>Firebase User UID:</span>
                  <div style={{ color: '#FFF', fontFamily: 'monospace', fontWeight: 600 }}>{user?.uid || 'anonymous-session'}</div>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Token Admin Claim:</span>
                  <div style={{ color: isAdmin ? '#6EE7B7' : '#FCA5A5', fontWeight: 800 }}>
                    {isAdmin ? 'admin === true (Verified in Token)' : 'admin === false or undefined'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Security Rules Status:</span>
                  <div style={{ color: 'var(--color-gold-bright)', fontWeight: 600 }}>
                    {securityTestResult?.success ? 'DB READ & WRITE PASSED' : 'READ RESTRICTED'}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Access Box */}
            <div style={{
              background: securityTestResult?.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: securityTestResult?.success ? '1.5px solid #10B981' : '1.5px solid #EF4444',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: securityTestResult?.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {securityTestResult?.success ? <Database size={22} color="#10B981" /> : <Lock size={22} color="#EF4444" />}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#FFF', fontWeight: 800, margin: 0 }}>
                    Security Status: {securityTestResult?.success ? 'ACCESS ALLOWED' : 'RESTRICTED'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: securityTestResult?.success ? '#6EE7B7' : '#FCA5A5', margin: '2px 0 0 0' }}>
                    {securityTestResult?.message || securityTestResult?.error || 'Database read permission test pending.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestDatabaseAccess}
                disabled={testingAccess}
                className="btn-outline-gold"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} className={testingAccess ? 'animate-spin' : ''} />
                Test Firestore Rules & Token
              </button>
            </div>
          </div>
        )}

        {/* MODAL 1: CREATE / EDIT DESTINATION */}
        {(isCreateDestinationOpen || editingDestination) && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5, 8, 16, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
            <div className="glass-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', border: '1.5px solid var(--color-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#FFF', margin: 0, fontSize: '1.25rem' }}>
                  {editingDestination ? `Edit Destination: ${editingDestination.name}` : 'Create New Luxury Destination'}
                </h3>
                <button onClick={() => { setIsCreateDestinationOpen(false); setEditingDestination(null); }} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveDestinationForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <input type="hidden" name="id" defaultValue={editingDestination?.id || ''} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>City & Country Name *</label>
                    <input type="text" name="name" required defaultValue={editingDestination?.name || ''} placeholder="e.g. Paris, France" className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Airport Code *</label>
                    <input type="text" name="airport" required defaultValue={editingDestination?.airport || ''} placeholder="e.g. CDG" className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Region *</label>
                    <select name="region" defaultValue={editingDestination?.region || 'Europe'} className="reserve-modal-input" style={inputStyle}>
                      <option value="Americas">Americas</option>
                      <option value="Asia">Asia</option>
                      <option value="Europe">Europe</option>
                      <option value="Middle East">Middle East</option>
                      <option value="Africa">Africa</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Discount String</label>
                    <input type="text" name="discount" defaultValue={editingDestination?.discount || '30%'} placeholder="e.g. 30%" className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Retail Fare (USD) *</label>
                    <input type="number" name="retailPrice" required defaultValue={editingDestination?.retailPrice || 1200} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Roya Concierge Fare (USD) *</label>
                    <input type="number" name="royaPrice" required defaultValue={editingDestination?.royaPrice || 840} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input type="text" name="tagline" defaultValue={editingDestination?.tagline || 'Experience world-class luxury flight offers.'} className="reserve-modal-input" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Image Cover URL</label>
                  <input type="url" name="image" defaultValue={editingDestination?.image || ''} placeholder="https://images.unsplash.com/..." className="reserve-modal-input" style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Best Time to Visit</label>
                    <input type="text" name="bestTimeToVisit" defaultValue={editingDestination?.bestTimeToVisit || 'April - October'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Visa Requirement</label>
                    <input type="text" name="visaRequirement" defaultValue={editingDestination?.visaRequirement || 'Visa on Arrival / ETIAS'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <input type="text" name="currency" defaultValue={editingDestination?.currency || 'EUR'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Language</label>
                    <input type="text" name="language" defaultValue={editingDestination?.language || 'French'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Flight Duration</label>
                    <input type="text" name="averageFlightDuration" defaultValue={editingDestination?.averageFlightDuration || '7h 30m'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Highlights (comma separated)</label>
                  <input type="text" name="highlights" defaultValue={Array.isArray(editingDestination?.highlights) ? editingDestination.highlights.join(', ') : ''} placeholder="Eiffel Tower, Louvre Museum, Luxury Shopping" className="reserve-modal-input" style={inputStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="popular" name="popular" defaultChecked={Boolean(editingDestination?.popular)} style={{ accentColor: 'var(--color-gold)' }} />
                  <label htmlFor="popular" style={{ color: '#FFF', fontSize: '0.85rem' }}>Feature as Popular Destination on homepage</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => { setIsCreateDestinationOpen(false); setEditingDestination(null); }} className="btn-outline-gold" style={{ padding: '8px 16px' }}>Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-gold" style={{ padding: '8px 20px' }}>
                    {actionLoading ? 'Saving...' : 'Save Destination to Firestore'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE / EDIT BOOKING */}
        {(isCreateBookingOpen || editingBooking) && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5, 8, 16, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
            <div className="glass-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', border: '1.5px solid var(--color-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#FFF', margin: 0, fontSize: '1.25rem' }}>
                  {editingBooking ? `Edit Booking PNR: ${editingBooking.pnr}` : 'Create New Passenger Booking'}
                </h3>
                <button onClick={() => { setIsCreateBookingOpen(false); setEditingBooking(null); }} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveBookingForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>PNR Code (Leave blank to generate)</label>
                    <input type="text" name="pnr" defaultValue={editingBooking?.pnr || ''} placeholder="e.g. RB98X2" className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Booking Status *</label>
                    <select name="status" defaultValue={editingBooking?.status || 'CONFIRMED_HOLD'} className="reserve-modal-input" style={inputStyle}>
                      <option value="CONFIRMED_HOLD">CONFIRMED_HOLD (24h Reservation)</option>
                      <option value="TICKETED">TICKETED (Confirmed Fare)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Passenger Full Name *</label>
                    <input type="text" name="passengerName" required defaultValue={editingBooking?.passengerName || editingBooking?.passenger || ''} placeholder="Sophia Alistair" className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Passenger Email *</label>
                    <input type="email" name="passengerEmail" required defaultValue={editingBooking?.passengerEmail || editingBooking?.email || ''} placeholder="sophia@example.com" className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="text" name="passengerPhone" defaultValue={editingBooking?.passengerPhone || editingBooking?.phone || ''} placeholder="+1 212-555-0198" className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cabin Class</label>
                    <select name="cabinClass" defaultValue={editingBooking?.cabinClass || editingBooking?.cabin || 'Business Class'} className="reserve-modal-input" style={inputStyle}>
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business Class">Business Class</option>
                      <option value="First Class">First Class</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Airline *</label>
                    <input type="text" name="airline" required defaultValue={editingBooking?.airline || 'British Airways'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Flight Number *</label>
                    <input type="text" name="flightNumber" required defaultValue={editingBooking?.flightNumber || 'BA178'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Origin Airport Code *</label>
                    <input type="text" name="origin" required defaultValue={editingBooking?.origin || 'JFK'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Destination Airport Code *</label>
                    <input type="text" name="destination" required defaultValue={editingBooking?.destination || 'LHR'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Departure Date *</label>
                    <input type="date" name="departDate" required defaultValue={editingBooking?.departDate || '2026-08-20'} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Return Date (Optional)</label>
                    <input type="date" name="returnDate" defaultValue={editingBooking?.returnDate || ''} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Passengers</label>
                    <input type="number" name="passengersCount" defaultValue={editingBooking?.passengersCount || editingBooking?.passengers || 1} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Retail Price ($)</label>
                    <input type="number" name="retailPrice" defaultValue={editingBooking?.retailPrice || 1200} className="reserve-modal-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Roya Price ($)</label>
                    <input type="number" name="royaPrice" defaultValue={editingBooking?.royaPrice || editingBooking?.totalFare || 840} className="reserve-modal-input" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => { setIsCreateBookingOpen(false); setEditingBooking(null); }} className="btn-outline-gold" style={{ padding: '8px 16px' }}>Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-gold" style={{ padding: '8px 20px' }}>
                    {actionLoading ? 'Saving...' : 'Save Booking to Firestore'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const metricCardStyle = {
  background: 'rgba(13, 20, 36, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 'var(--radius-md)',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const thStyle = {
  padding: '12px 14px',
  fontSize: '0.74rem',
  fontWeight: 800,
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '12px 14px',
  verticalAlign: 'middle'
};

const labelStyle = {
  color: 'var(--color-gold)',
  fontSize: '0.75rem',
  fontWeight: 700,
  display: 'block',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  color: '#FFF',
  fontSize: '0.85rem',
  outline: 'none'
};
