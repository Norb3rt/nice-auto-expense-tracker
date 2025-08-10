import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9hfDx6qqbNIlpzYyzEl8wnqcNl84kmFw",
  authDomain: "nice-auto-tracker.firebaseapp.com",
  projectId: "nice-auto-tracker",
  storageBucket: "nice-auto-tracker.firebasestorage.app",
  messagingSenderId: "896030706111",
  appId: "1:896030706111:web:b80bf7f1e15b11bc9e790a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' && getAnalytics(app);



export default app;
