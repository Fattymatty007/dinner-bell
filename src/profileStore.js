import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Per-user profile lives at users/{uid}. Shape:
//   { dinners: [...], language, weekSize, updatedAt }
// See firestore.rules — a user may only read/write their own document.

function userDoc(uid) {
  return doc(db, 'users', uid);
}

// Returns the stored profile, or null if the user has none yet.
export async function loadProfile(uid) {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? snap.data() : null;
}

// Merge-writes the given fields (dinners / language / weekSize) plus a server
// timestamp. Merge so a partial write never clobbers other fields.
export async function saveProfile(uid, data) {
  await setDoc(userDoc(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
