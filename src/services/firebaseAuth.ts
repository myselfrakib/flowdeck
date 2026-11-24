import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const firebaseSignIn = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const firebaseSignUp = async (email: string, pass: string, displayName?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

export const firebaseSignInWithGoogle = async () => {
  return await signInWithPopup(auth, googleAuthProvider);
};

export const firebaseSignOut = async () => {
  return await signOut(auth);
};

export const firebaseResetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const onFirebaseAuthStateChanged = (
  callback: (user: FirebaseUser | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

