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
  apiKey: "firebase_api_key",
  authDomain: "firebase_auth_domain",
  projectId: "firebase_project_id",
  storageBucket: "########",
  messagingSenderId: "########",
  appId: "########",
  measurementId: "########",
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
