import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CadastroInquilinoScreen from './screens/CadastroInquilinoScreen';
import ListaInquilinosScreen from './screens/ListaInquilinosScreen';
import ListaUsuariosScreen from './screens/ListaUsuariosScreen';
import CadastroContratoScreen from './screens/CadastroContratoScreen';
import CadastroImovelScreen from './screens/CadastroImovelScreen';
import ListaContratosScreen from './screens/ListaContratosScreen';
import ListaImoveisScreen from './screens/ListaImoveisScreen';
import PagamentosScreen from './screens/PagamentosScreen';
import HistoricoScreen from './screens/HistoricoScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import AjudaScreen from './screens/AjudaScreen';
import DashboardIA from './screens/DashboardIA';
import CadastroUsuarioScreen from './screens/CadastroUsuarioScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const solicitarPermissao = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão para notificações negada!');
      }
    };
    solicitarPermissao();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CadastroInquilino" component={CadastroInquilinoScreen} />
        <Stack.Screen name="CadastroUsuario" component={CadastroUsuarioScreen} />
        <Stack.Screen name="ListaInquilinos" component={ListaInquilinosScreen} />
        <Stack.Screen name="ListaUsuarios" component={ListaUsuariosScreen} />
        <Stack.Screen name="CadastroImovel" component={CadastroImovelScreen} />
        <Stack.Screen name="ListaImoveis" component={ListaImoveisScreen} />
        <Stack.Screen name="Contrato" component={CadastroContratoScreen} />
        <Stack.Screen name="ListaContratos" component={ListaContratosScreen} />
        <Stack.Screen name="Pagamentos" component={PagamentosScreen} />
        <Stack.Screen name="Historico" component={HistoricoScreen} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="Ajuda" component={AjudaScreen} />
        <Stack.Screen name="DashboardIA" component={DashboardIA} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
