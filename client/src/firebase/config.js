import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// these will be given by firebase on adding your web app
const firebaseConfig = {
  apiKey: "[GCP_API_KEY]",
  authDomain: "airesume-d26e1.firebaseapp.com",
  projectId: "airesume-54tge",
  storageBucket: "airesume-d26e1.firebasestorage.app",
  messagingSenderId: "280835018374",
  appId: "1:534635452341363464:web:66et34y45244f335d8e3",
  measurementId: "G-8Y0995464P",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Explicitly keep the auth session in localStorage so it survives
// tab switches, page refreshes, and browser restarts.
setPersistence(auth, browserLocalPersistence).catch(console.error);


// Firestore with IndexedDB offline persistence — auto-caches on device
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
