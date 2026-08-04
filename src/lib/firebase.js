import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  getIdToken, 
  getIdTokenResult,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export { 
  doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, limit,
  signInAnonymously, onAuthStateChanged, getIdToken, getIdTokenResult, signOut
};

