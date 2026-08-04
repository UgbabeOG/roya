import { db, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, limit } from './firebase.js';

/**
 * Saves a flight booking reservation into Firestore database and local cache
 */
export async function saveBookingToDatabase(booking) {
  const pnrCode = booking.pnr ? booking.pnr.toUpperCase() : 'RB' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Hours hold

  const bookingRecord = {
    pnr: pnrCode,
    passengerName: booking.passengerName || 'Valued Passenger',
    passengerEmail: (booking.passengerEmail || '').toLowerCase().trim(),
    passengerPhone: booking.passengerPhone || '',
    flightNumber: booking.flightNumber || 'BA178',
    airline: booking.airline || 'British Airways',
    origin: booking.origin || 'JFK',
    originCity: booking.originCity || booking.origin || 'New York',
    destination: booking.destination || 'LHR',
    destinationCity: booking.destinationCity || booking.destination || 'London',
    departDate: booking.departDate || '2026-08-20',
    returnDate: booking.returnDate || null,
    tripType: booking.tripType || 'round',
    cabinClass: booking.cabinClass || 'Business Class',
    passengersCount: Number(booking.passengersCount) || 1,
    retailPrice: Number(booking.retailPrice) || 1200,
    royaPrice: Number(booking.royaPrice) || 840,
    savings: Number(booking.savings) || 360,
    aircraft: booking.aircraft || 'Boeing 787 Dreamliner',
    status: 'CONFIRMED_HOLD',
    createdAt: now.toISOString(),
    holdExpiresAt: expires.toISOString()
  };

  // 1. Save to Firestore DB
  try {
    const docRef = doc(db, 'bookings', pnrCode);
    await setDoc(docRef, bookingRecord);
    console.log(`[Firestore] Successfully persisted booking PNR ${pnrCode}`);
  } catch (err) {
    console.warn(`[Firestore DB Warning] Could not reach remote database, utilizing local storage cache:`, err);
  }

  // 2. Local cache fallback
  try {
    const existingStr = localStorage.getItem('royabridge_bookings');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const updated = [bookingRecord, ...existing.filter(b => b.pnr !== pnrCode)];
    localStorage.setItem('royabridge_bookings', JSON.stringify(updated));
    localStorage.setItem('royabridge_latest_pnr', pnrCode);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  return bookingRecord;
}

/**
 * Searches Firestore database for a booking by PNR code, email, or passenger name
 */
export async function lookupBookingFromDatabase(searchInput) {
  if (!searchInput || !searchInput.trim()) {
    throw new Error('Please enter a PNR reference code, full name, or email address.');
  }

  const clean = searchInput.trim();
  const cleanUpper = clean.toUpperCase();
  const cleanLower = clean.toLowerCase();

  // 1. Direct Firestore doc lookup by PNR
  try {
    const docRef = doc(db, 'bookings', cleanUpper);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return formatBookingResult(docSnap.data());
    }
  } catch (e) {
    console.warn('Firestore doc lookup error:', e);
  }

  // 2. Query Firestore collection by email or name
  try {
    const colRef = collection(db, 'bookings');
    
    // Query email
    const emailQ = query(colRef, where('passengerEmail', '==', cleanLower), limit(1));
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      return formatBookingResult(emailSnap.docs[0].data());
    }

    // Query name
    const nameQ = query(colRef, where('passengerName', '==', clean), limit(1));
    const nameSnap = await getDocs(nameQ);
    if (!nameSnap.empty) {
      return formatBookingResult(nameSnap.docs[0].data());
    }
  } catch (e) {
    console.warn('Firestore collection query error:', e);
  }

  // 3. Fallback check in localStorage
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localBookings = JSON.parse(localStr);
      const matched = localBookings.find(b => 
        b.pnr?.toUpperCase() === cleanUpper || 
        b.passengerEmail?.toLowerCase() === cleanLower ||
        b.passengerName?.toLowerCase().includes(cleanLower)
      );
      if (matched) {
        return formatBookingResult(matched);
      }
    }
  } catch (e) {
    console.warn('LocalStorage lookup error:', e);
  }

  return null;
}

function formatBookingResult(raw) {
  const expiresAt = raw.holdExpiresAt ? new Date(raw.holdExpiresAt) : new Date(Date.now() + 20 * 3600 * 1000);
  const now = new Date();
  const diffHours = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));

  return {
    ...raw,
    pnr: raw.pnr,
    passenger: raw.passengerName,
    email: raw.passengerEmail,
    phone: raw.passengerPhone,
    route: `${raw.origin} (${raw.originCity || raw.origin}) → ${raw.destination} (${raw.destinationCity || raw.destination})`,
    flightNumber: raw.flightNumber,
    airline: raw.airline,
    departDate: raw.departDate,
    returnDate: raw.returnDate,
    cabin: raw.cabinClass,
    passengers: raw.passengersCount,
    status: raw.status || 'CONFIRMED_HOLD',
    holdExpires: `${diffHours > 0 ? diffHours : 1} Hours Remaining`,
    totalFare: raw.royaPrice,
    savedAmount: raw.savings,
    retailFare: raw.retailPrice
  };
}

/**
 * SAMPLE SEED DATA FOR DEMO & TESTING
 */
const SAMPLE_ADMIN_BOOKINGS = [
  {
    pnr: 'RB94A2',
    passengerName: 'Sophia Alistair',
    passengerEmail: 'sophia.a@example.com',
    passengerPhone: '+1 212-555-0198',
    flightNumber: 'EK202',
    airline: 'Emirates',
    origin: 'JFK',
    originCity: 'New York',
    destination: 'DXB',
    destinationCity: 'Dubai',
    departDate: '2026-09-10',
    returnDate: '2026-09-24',
    tripType: 'round',
    cabinClass: 'Business Class',
    passengersCount: 2,
    retailPrice: 7000,
    royaPrice: 4900,
    savings: 2100,
    status: 'CONFIRMED_HOLD',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    holdExpiresAt: new Date(Date.now() + 3600 * 1000 * 20).toISOString()
  },
  {
    pnr: 'RB71X9',
    passengerName: 'David Miller',
    passengerEmail: 'd.miller@techcorp.io',
    passengerPhone: '+1 415-555-8821',
    flightNumber: 'BA178',
    airline: 'British Airways',
    origin: 'JFK',
    originCity: 'New York',
    destination: 'LHR',
    destinationCity: 'London',
    departDate: '2026-08-18',
    returnDate: '2026-08-30',
    tripType: 'round',
    cabinClass: 'First Class',
    passengersCount: 1,
    retailPrice: 4500,
    royaPrice: 3150,
    savings: 1350,
    status: 'TICKETED',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    holdExpiresAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    pnr: 'RB55M3',
    passengerName: 'Elena Rostova',
    passengerEmail: 'elena.r@luxurytravel.fr',
    passengerPhone: '+33 1 42 68 55 00',
    flightNumber: 'AF023',
    airline: 'Air France',
    origin: 'CDG',
    originCity: 'Paris',
    destination: 'JFK',
    destinationCity: 'New York',
    departDate: '2026-08-25',
    returnDate: '2026-09-08',
    tripType: 'round',
    cabinClass: 'Business Class',
    passengersCount: 1,
    retailPrice: 2700,
    royaPrice: 1890,
    savings: 810,
    status: 'CONFIRMED_HOLD',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    holdExpiresAt: new Date(Date.now() + 3600 * 1000 * 22).toISOString()
  },
  {
    pnr: 'RB88K4',
    passengerName: 'Marcus Vance',
    passengerEmail: 'marcus.v@globalcorp.com',
    passengerPhone: '+1 312-555-4029',
    flightNumber: 'SQ025',
    airline: 'Singapore Airlines',
    origin: 'JFK',
    originCity: 'New York',
    destination: 'SIN',
    destinationCity: 'Singapore',
    departDate: '2026-10-01',
    returnDate: '2026-10-15',
    tripType: 'round',
    cabinClass: 'Business Class',
    passengersCount: 2,
    retailPrice: 11000,
    royaPrice: 7700,
    savings: 3300,
    status: 'TICKETED',
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    holdExpiresAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
  },
  {
    pnr: 'RB32L1',
    passengerName: 'Chloe Bennett',
    passengerEmail: 'chloe.b@designstudio.uk',
    passengerPhone: '+44 20 7946 0912',
    flightNumber: 'VS004',
    airline: 'Virgin Atlantic',
    origin: 'LHR',
    originCity: 'London',
    destination: 'JFK',
    destinationCity: 'New York',
    departDate: '2026-09-05',
    returnDate: '2026-09-12',
    tripType: 'round',
    cabinClass: 'Premium Economy',
    passengersCount: 1,
    retailPrice: 1650,
    royaPrice: 1155,
    savings: 495,
    status: 'CONFIRMED_HOLD',
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    holdExpiresAt: new Date(Date.now() + 3600 * 1000 * 16).toISOString()
  }
];

/**
 * Fetches all user bookings for Admin Portal (validates admin permission via Firestore and Server API)
 */
export async function fetchAllBookingsForAdmin(tokenStr = '', isAdminClaim = false) {
  let firestoreBookings = [];
  let firestoreError = null;

  // 1. Attempt Direct Firestore Read (Validates firestore.rules: request.auth != null && request.auth.token.admin == true)
  try {
    const colRef = collection(db, 'bookings');
    const snap = await getDocs(colRef);
    snap.docs.forEach(docSnap => {
      firestoreBookings.push(formatBookingResult(docSnap.data()));
    });
    console.log(`[Firestore Admin Read] Successfully fetched ${firestoreBookings.length} booking records.`);
  } catch (err) {
    firestoreError = err;
    console.warn(`[Firestore Admin Security Block / Warning]:`, err.message || err);
  }

  // 2. Validate Server API Endpoint (Validates /api/admin/bookings Bearer token)
  let apiSuccess = false;
  let apiError = null;
  if (tokenStr) {
    try {
      const apiRes = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${tokenStr}` }
      });
      const apiData = await apiRes.json();
      if (apiRes.ok && apiData.success) {
        apiSuccess = true;
      } else {
        apiError = apiData.error || `HTTP ${apiRes.status} Forbidden`;
      }
    } catch (e) {
      apiError = e.message;
    }
  }

  // If user is NOT admin (neither Firestore nor API allowed, or isAdminClaim false), throw strict permission error!
  if (!isAdminClaim && firestoreError && !apiSuccess) {
    const error = new Error('Database Access Denied: Admin role required (token.admin === true required to read bookings collection).');
    error.code = 'permission-denied';
    error.firestoreError = firestoreError?.message;
    error.apiError = apiError;
    throw error;
  }

  // 3. Fallback to LocalStorage + Sample Seeding if Firestore collection is empty or unreachable for demo
  let localBookings = [];
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      localBookings = JSON.parse(localStr).map(formatBookingResult);
    }
  } catch (e) {
    console.warn('LocalStorage parse error:', e);
  }

  // Merge Firestore records, local storage records, and sample bookings without duplicates
  const allMap = new Map();

  // Add sample bookings first
  SAMPLE_ADMIN_BOOKINGS.map(formatBookingResult).forEach(b => allMap.set(b.pnr, b));
  // Override with local bookings
  localBookings.forEach(b => allMap.set(b.pnr, b));
  // Override with remote Firestore bookings
  firestoreBookings.forEach(b => allMap.set(b.pnr, b));

  const resultList = Array.from(allMap.values());
  return {
    bookings: resultList,
    firestoreSuccess: !firestoreError,
    firestoreError: firestoreError?.message,
    apiSuccess,
    apiError
  };
}

/**
 * Updates a booking status (e.g. from CONFIRMED_HOLD to TICKETED)
 */
export async function updateBookingStatusInDatabase(pnrCode, newStatus) {
  if (!pnrCode) return null;
  const cleanPnr = pnrCode.toUpperCase();

  // 1. Update in Firestore
  try {
    const docRef = doc(db, 'bookings', cleanPnr);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await setDoc(docRef, { status: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn('[Firestore Update Warning]', err);
  }

  // 2. Update in LocalStorage
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const list = JSON.parse(localStr);
      const updated = list.map(b => b.pnr?.toUpperCase() === cleanPnr ? { ...b, status: newStatus } : b);
      localStorage.setItem('royabridge_bookings', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage update error:', e);
  }

  return { pnr: cleanPnr, status: newStatus };
}

/**
 * Updates full booking details in Firestore DB and LocalStorage
 */
export async function updateBookingDetailsInDatabase(pnrCode, updateData) {
  if (!pnrCode) return null;
  const cleanPnr = pnrCode.toUpperCase();

  const payload = {
    ...updateData,
    pnr: cleanPnr,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'bookings', cleanPnr);
    await setDoc(docRef, payload, { merge: true });
    console.log(`[Firestore] Updated booking details for PNR ${cleanPnr}`);
  } catch (err) {
    console.warn('[Firestore Update Details Error]', err);
  }

  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const list = JSON.parse(localStr);
      const updated = list.map(b => b.pnr?.toUpperCase() === cleanPnr ? { ...b, ...payload } : b);
      localStorage.setItem('royabridge_bookings', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage update details error:', e);
  }

  return payload;
}

/**
 * Deletes a booking record from Firestore DB and LocalStorage
 */
export async function deleteBookingFromDatabase(pnrCode) {
  if (!pnrCode) return false;
  const cleanPnr = pnrCode.toUpperCase();

  try {
    const docRef = doc(db, 'bookings', cleanPnr);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted booking PNR ${cleanPnr}`);
  } catch (err) {
    console.warn('[Firestore Delete Booking Warning]', err);
  }

  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const list = JSON.parse(localStr);
      const updated = list.filter(b => b.pnr?.toUpperCase() !== cleanPnr);
      localStorage.setItem('royabridge_bookings', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }

  return true;
}

