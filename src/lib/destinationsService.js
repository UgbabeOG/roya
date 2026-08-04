import { db, doc, setDoc, getDoc, deleteDoc, collection, getDocs, query } from './firebase';
import { DESTINATIONS as SEED_DESTINATIONS, POPULAR_AIRPORTS as SEED_AIRPORTS } from '../data/destinations';

/**
 * Seeds all destination data into Firebase Firestore if not already present
 */
export async function seedDestinationsToFirestore() {
  console.log('[Firestore] Seeding destinations and airports data to Firebase Store...');
  let destinationsSeeded = 0;
  let airportsSeeded = 0;

  // 1. Seed Destinations
  try {
    for (const dest of SEED_DESTINATIONS) {
      const docRef = doc(db, 'destinations', dest.id);
      await setDoc(docRef, dest, { merge: true });
      destinationsSeeded++;
    }
    console.log(`[Firestore] Successfully seeded ${destinationsSeeded} destinations.`);
  } catch (err) {
    console.warn('[Firestore Seed Destinations Warning]:', err);
  }

  // 2. Seed Airports
  try {
    for (const airport of SEED_AIRPORTS) {
      const docRef = doc(db, 'airports', airport.code);
      await setDoc(docRef, airport, { merge: true });
      airportsSeeded++;
    }
    console.log(`[Firestore] Successfully seeded ${airportsSeeded} airports.`);
  } catch (err) {
    console.warn('[Firestore Seed Airports Warning]:', err);
  }

  return { destinationsSeeded, airportsSeeded };
}

/**
 * Creates a new destination in Firebase Firestore
 */
export async function createDestinationInFirestore(destinationData) {
  const id = destinationData.id || `dest_${Date.now()}`;
  const retailPrice = Number(destinationData.retailPrice) || 1000;
  const royaPrice = Number(destinationData.royaPrice) || Math.round(retailPrice * 0.7);
  const discount = destinationData.discount || `${Math.round(((retailPrice - royaPrice) / retailPrice) * 100)}%`;

  const record = {
    id,
    name: destinationData.name || 'New Destination',
    airport: destinationData.airport || 'JFK',
    region: destinationData.region || 'Americas',
    image: destinationData.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    retailPrice,
    royaPrice,
    discount,
    popular: Boolean(destinationData.popular),
    tagline: destinationData.tagline || 'Experience luxury flight deals.',
    bestTimeToVisit: destinationData.bestTimeToVisit || 'Year-round',
    visaRequirement: destinationData.visaRequirement || 'Visa on arrival / Electronic ETA',
    currency: destinationData.currency || 'USD',
    language: destinationData.language || 'English',
    averageFlightDuration: destinationData.averageFlightDuration || '7h 30m',
    highlights: Array.isArray(destinationData.highlights) ? destinationData.highlights : (destinationData.highlights ? destinationData.highlights.split(',').map(s => s.trim()) : ['Luxury Hotels', 'Concierge Perks']),
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'destinations', id);
    await setDoc(docRef, record, { merge: true });
    console.log(`[Firestore] Destination created successfully: ${id}`);
  } catch (err) {
    console.warn('[Firestore Create Destination Error]:', err);
  }

  return record;
}

/**
 * Updates an existing destination in Firebase Firestore
 */
export async function updateDestinationInFirestore(id, updateData) {
  if (!id) return null;

  try {
    const docRef = doc(db, 'destinations', id);
    await setDoc(docRef, { ...updateData, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[Firestore] Destination ${id} updated successfully.`);
    return { id, ...updateData };
  } catch (err) {
    console.warn(`[Firestore Update Destination Error]:`, err);
    throw err;
  }
}

/**
 * Deletes a destination record from Firebase Firestore
 */
export async function deleteDestinationFromFirestore(id) {
  if (!id) return false;

  try {
    const docRef = doc(db, 'destinations', id);
    await deleteDoc(docRef);
    console.log(`[Firestore] Destination ${id} deleted successfully.`);
    return true;
  } catch (err) {
    console.warn(`[Firestore Delete Destination Error]:`, err);
    throw err;
  }
}

/**
 * Fetches all destination records directly from Firebase Firestore
 */
export async function fetchDestinationsFromFirestore() {
  try {
    const colRef = collection(db, 'destinations');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const list = snap.docs.map(d => d.data());
      console.log(`[Firestore] Retrieved ${list.length} destinations directly from Firebase Store.`);
      return list;
    } else {
      // If collection is empty, trigger auto-seed and return seed list
      await seedDestinationsToFirestore();
      return SEED_DESTINATIONS;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching destinations, using server API fallback:', err);
    try {
      const apiRes = await fetch('/api/destinations');
      const apiData = await apiRes.json();
      if (apiData.success && Array.isArray(apiData.destinations)) {
        return apiData.destinations;
      }
    } catch (e) {
      console.warn('API fallback error:', e);
    }
    return SEED_DESTINATIONS;
  }
}

/**
 * Fetches all popular airports directly from Firebase Firestore
 */
export async function fetchAirportsFromFirestore() {
  try {
    const colRef = collection(db, 'airports');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const list = snap.docs.map(d => d.data());
      console.log(`[Firestore] Retrieved ${list.length} popular airports directly from Firebase Store.`);
      
      // Auto-update/seed if local configuration list has more airports
      if (list.length < SEED_AIRPORTS.length) {
        console.log(`[Firestore] Upgrading database with new global airports (db has ${list.length}, local has ${SEED_AIRPORTS.length})...`);
        await seedDestinationsToFirestore();
        return SEED_AIRPORTS;
      }
      return list;
    } else {
      await seedDestinationsToFirestore();
      return SEED_AIRPORTS;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching airports:', err);
    return SEED_AIRPORTS;
  }
}
