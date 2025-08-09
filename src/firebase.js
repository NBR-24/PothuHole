import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIj9Cor5eZmn7GyzylSOImwL2O0waw9DA",
  authDomain: "pot-hole-rating.firebaseapp.com",
  projectId: "pot-hole-rating",
  // Firebase Storage bucket should be the appspot.com domain, not firebasestorage.app
  storageBucket: "pot-hole-rating.appspot.com",
  messagingSenderId: "337585738571",
  appId: "1:337585738571:web:d5bab7982b0572087bcece"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };

export const collections = {
  REPORTS: 'reports',
  USERS: 'users',
};

