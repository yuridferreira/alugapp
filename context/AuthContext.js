import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const AuthContext = createContext({});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getProfileWithRetry = async (userId, attempts = 5) => {
  for (let index = 0; index < attempts; index += 1) {
    const docRef = doc(db, 'usuarios', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    if (index < attempts - 1) {
      await wait(400);
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profile = await getProfileWithRetry(firebaseUser.uid);
          setRole(profile?.role || null);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.log('Erro ao buscar role:', error);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
