import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHIPPj-0EZ1IGRjf6juQlLVqxDkvcZg1w",
  authDomain: "fff-tournament-daf19.firebaseapp.com", // ✅ correct this!
  projectId: "fff-tournament-daf19",
  storageBucket: "fff-tournament-daf19.appspot.com", // ✅ use .appspot.com not .app
  messagingSenderId: "553646512878",
  appId: "1:553646512878:web:5b23f6a6911cc8876331ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
