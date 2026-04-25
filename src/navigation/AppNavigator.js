import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ROUTES } from './routes';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroUsuarioScreen from '../screens/auth/CadastroUsuarioScreen';

// Admin screens
import HomeScreen from '../screens/admin/HomeScreen';
import CadastroInquilinoScreen from '../screens/admin/CadastroInquilinoScreen';
import ListaInquilinosScreen from '../screens/admin/ListaInquilinosScreen';
import CadastroImovelScreen from '../screens/admin/CadastroImovelScreen';
import ListaImoveisScreen from '../screens/admin/ListaImoveisScreen';
import CadastroContratoScreen from '../screens/admin/CadastroContratoScreen';
import ListaContratosScreen from '../screens/admin/ListaContratosScreen';
import ListaUsuariosScreen from '../screens/admin/ListaUsuariosScreen';
import PagamentosScreen from '../screens/admin/PagamentosScreen';
import HistoricoScreen from '../screens/admin/HistoricoScreen';
import DashboardIA from '../screens/admin/DashboardIA';
import ConfiguracoesScreen from '../screens/admin/ConfiguracoesScreen';
import ConfiguracaoDetalheScreen from '../screens/admin/ConfiguracaoDetalheScreen';
import AjudaScreen from '../screens/admin/AjudaScreen';

// Tenant screens
import MeuContratoScreen from '../screens/tenant/MeuContratoScreen';
import MeusPagamentosScreen from '../screens/tenant/MeusPagamentosScreen';

const Stack = createNativeStackNavigator();

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