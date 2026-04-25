"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/lib/firestore-service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userImage: string | null;
  setUserImage: (img: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userImage: null,
  setUserImage: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Fetch profile image once on sign-in
      if (firebaseUser) {
        try {
          const data = await userService.getSettings(firebaseUser.uid);
          if (data?.image) setUserImage(data.image);
          else if (firebaseUser.photoURL) setUserImage(firebaseUser.photoURL);
        } catch (_) {}
      } else {
        setUserImage(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userImage, setUserImage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
