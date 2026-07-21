import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase web config. The apiKey here is NOT a secret — it only identifies the
// project. Access is enforced by Firestore security rules (see firestore.rules)
// and the Authentication → Authorized domains list, so it's safe to commit.
//
// TODO: replace the placeholder values below with the config from your Firebase
// project (Firebase console → Project settings → Your apps → Web app → SDK
// setup and configuration). Until these are real, the "Sign in with Google"
// button will fail — the rest of the app works anonymously regardless.
const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

// True once real config has been filled in. Used to hide the sign-in UI while
// the project is still using placeholder values, so we never show a button that
// only errors.
export const firebaseConfigured = !Object.values(firebaseConfig).some((v) =>
  String(v).includes('REPLACE_ME')
);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
