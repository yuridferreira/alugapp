import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { db } from './src/services/localdb/db';
import { toastConfig } from './src/utils/toast';

export default function App() {

  useEffect(() => {
    const inicializar = async () => {
      if (db?.init) {
        await db.init();
      }

      if (Platform.OS === 'web') {
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão para notificações negada!');
      }
    };

    inicializar();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
