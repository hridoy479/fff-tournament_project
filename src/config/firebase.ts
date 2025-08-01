// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ Import Firestore


const firebaseConfig = {
  apiKey: "AIzaSyCHIPPj-0EZ1IGRjf6juQlLVqxDkvcZg1w",
  authDomain: "fff-tournament-daf19.firebaseapp.com",
  projectId: "fff-tournament-daf19",
  storageBucket: "fff-tournament-daf19.appspot.com",
  messagingSenderId: "553646512878",
  appId: "1:553646512878:web:5b23f6a6911cc8876331ff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // ✅ Initialize Firestore

export { app, auth, provider, db }; // ✅ Export `db`
