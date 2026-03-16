import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const docRef = doc(db, 'usuarios', firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          setUser(firebaseUser);

          if (docSnap.exists()) {
            setRole(docSnap.data().role || 'user'); // fallback seguro
          } else {
            // Se não existir documento, assume user
            setRole('user');
          }
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