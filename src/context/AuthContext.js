import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { auth, db } from '../../firebaseConfig.js';

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

          // Registrar token de notificação push (apenas mobile)
          if (Platform.OS !== 'web') {
            try {
              const token = await Notifications.getExpoPushTokenAsync();
              if (token) {
                const userRef = doc(db, 'usuarios', firebaseUser.uid);
                await updateDoc(userRef, { expoPushToken: token.data });
              }
            } catch (error) {
              console.log('Erro ao registrar token de notificação:', error);
            }
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
