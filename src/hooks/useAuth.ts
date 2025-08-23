import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import axios from 'axios';

export interface CustomUser {
  firebaseUser: User;
  username?: string;
  emailVerified?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await axios.get('/api/user/status', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          if (response.data) {
            setUser({ firebaseUser, ...response.data });
          } else {
            setUser({ firebaseUser });
          }
        } catch (error) {
          console.error("Failed to fetch user data from backend:", error);
          setUser({ firebaseUser }); // Fallback to just Firebase user if backend fetch fails
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}