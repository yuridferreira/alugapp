import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CadastroInquilinoScreen from '../screens/CadastroInquilinoScreen';
import ListaInquilinosScreen from '../screens/ListaInquilinosScreen';
import ListaUsuariosScreen from '../screens/ListaUsuariosScreen';
import CadastroContratoScreen from '../screens/CadastroContratoScreen';
import CadastroImovelScreen from '../screens/CadastroImovelScreen';
import ListaContratosScreen from '../screens/ListaContratosScreen';
import ListaImoveisScreen from '../screens/ListaImoveisScreen';
import PagamentosScreen from '../screens/PagamentosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import ConfiguracaoDetalheScreen from '../screens/ConfiguracaoDetalheScreen';
import AjudaScreen from '../screens/AjudaScreen';
import DashboardIA from '../screens/DashboardIA';
import CadastroUsuarioScreen from '../screens/CadastroUsuarioScreen';
import MeuContratoScreen from '../screens/MeuContratoScreen';
import MeusPagamentosScreen from '../screens/MeusPagamentosScreen';

const Stack = createNativeStackNavigator();

const ROUTES = {
  LOGIN: 'Login',
  HOME: 'Home',
  CADASTRO_USUARIO: 'CadastroUsuario',
  LISTA_USUARIOS: 'ListaUsuarios',
  DASHBOARD_IA: 'DashboardIA',
  CADASTRO_INQUILINO: 'CadastroInquilino',
  LISTA_INQUILINOS: 'ListaInquilinos',
  CADASTRO_IMOVEL: 'CadastroImovel',
  LISTA_IMOVEIS: 'ListaImoveis',
  CONTRATO: 'Contrato',
  LISTA_CONTRATOS: 'ListaContratos',
  PAGAMENTOS: 'Pagamentos',
  HISTORICO: 'Historico',
  CONFIGURACOES: 'Configuracoes',
  CONFIGURACAO_DETALHE: 'ConfiguracaoDetalhe',
  AJUDA: 'Ajuda',
  MEU_CONTRATO: 'MeuContrato',
  MEUS_PAGAMENTOS: 'MeusPagamentos',
};

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4F8EF7" />
    </View>
  );
}

export default function AppNavigator() {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user && (
          <>
            <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
            <Stack.Screen
              name={ROUTES.CADASTRO_USUARIO}
              component={CadastroUsuarioScreen}
            />
          </>
        )}

        {user && role === 'admin' && (
          <>
            <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
            <Stack.Screen
              name={ROUTES.CADASTRO_USUARIO}
              component={CadastroUsuarioScreen}
            />
            <Stack.Screen
              name={ROUTES.LISTA_USUARIOS}
              component={ListaUsuariosScreen}
            />
            <Stack.Screen
              name={ROUTES.DASHBOARD_IA}
              component={DashboardIA}
            />
            <Stack.Screen
              name={ROUTES.CADASTRO_INQUILINO}
              component={CadastroInquilinoScreen}
            />
            <Stack.Screen
              name={ROUTES.LISTA_INQUILINOS}
              component={ListaInquilinosScreen}
            />
            <Stack.Screen
              name={ROUTES.CADASTRO_IMOVEL}
              component={CadastroImovelScreen}
            />
            <Stack.Screen
              name={ROUTES.LISTA_IMOVEIS}
              component={ListaImoveisScreen}
            />
            <Stack.Screen
              name={ROUTES.CONTRATO}
              component={CadastroContratoScreen}
            />
            <Stack.Screen
              name={ROUTES.LISTA_CONTRATOS}
              component={ListaContratosScreen}
            />
            <Stack.Screen
              name={ROUTES.PAGAMENTOS}
              component={PagamentosScreen}
            />
            <Stack.Screen
              name={ROUTES.HISTORICO}
              component={HistoricoScreen}
            />
            <Stack.Screen
              name={ROUTES.CONFIGURACOES}
              component={ConfiguracoesScreen}
            />
            <Stack.Screen
              name={ROUTES.CONFIGURACAO_DETALHE}
              component={ConfiguracaoDetalheScreen}
            />
            <Stack.Screen name={ROUTES.AJUDA} component={AjudaScreen} />
          </>
        )}

        {user && role === 'usuario' && (
          <>
            <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
            <Stack.Screen
              name={ROUTES.MEU_CONTRATO}
              component={MeuContratoScreen}
            />
            <Stack.Screen
              name={ROUTES.MEUS_PAGAMENTOS}
              component={MeusPagamentosScreen}
            />
            <Stack.Screen
              name={ROUTES.HISTORICO}
              component={HistoricoScreen}
            />
            <Stack.Screen
              name={ROUTES.CONFIGURACOES}
              component={ConfiguracoesScreen}
            />
            <Stack.Screen
              name={ROUTES.CONFIGURACAO_DETALHE}
              component={ConfiguracaoDetalheScreen}
            />
            <Stack.Screen name={ROUTES.AJUDA} component={AjudaScreen} />
          </>
        )}

        {user && !role && (
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FF',
  },
});