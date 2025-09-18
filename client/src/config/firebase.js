// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyyL7LDD2DeZmfetNvzdY8QZ5-eUJqHwU",
  authDomain: "urbansprout-bc137.firebaseapp.com",
  projectId: "urbansprout-bc137",
  storageBucket: "urbansprout-bc137.firebasestorage.app",
  messagingSenderId: "793698516798",
  appId: "1:793698516798:web:e87815785ae0b3575d766f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign In helper
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Sign Out helper
export const signOutUser = () => signOut(auth);

export default app;