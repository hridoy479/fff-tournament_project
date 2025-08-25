import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebaseClient";
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface CustomUser {
  firebaseUser: User;
  username?: string;
}

export function useAuth() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
            const userData = response.data;
            setUser({ firebaseUser, ...userData });
          } else {
            setUser({ firebaseUser });
          }
        } catch (error) {
          console.error("Failed to fetch user data from backend:", error);
          setUser({ firebaseUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  return { user, loading };
}