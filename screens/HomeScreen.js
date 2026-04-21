import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { commonStyles, colors } from '../styles/commonStyles';
import {
  UserPlus,
  Users,
  CircleUser,
  ListChecks,
  FileText,
  House,
  HousePlus,
  CreditCard,
  Clock3,
  Cpu,
  Settings2,
  CircleQuestionMark,
} from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth < 400 ? 2 : 3;

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Separar telas por role
  const screensAdmin = [
    { name: 'CadastroInquilino', label: 'Inquilino', icon: UserPlus },
    { name: 'ListaInquilinos', label: 'Inquilinos', icon: Users },
    { name: 'CadastroUsuario', label: 'Novo Usuário', icon: CircleUser },
    { name: 'ListaUsuarios', label: 'Usuários', icon: ListChecks },
    { name: 'Contrato', label: 'Novo Contrato', icon: FileText },
    { name: 'ListaContratos', label: 'Contratos', icon: ListChecks },
    { name: 'CadastroImovel', label: 'Imóvel', icon: HousePlus },
    { name: 'ListaImoveis', label: 'Imóveis', icon: House },
    { name: 'Pagamentos', label: 'Pagamentos', icon: CreditCard },
    { name: 'Historico', label: 'Histórico', icon: Clock3 },
    { name: 'DashboardIA', label: 'IA', icon: Cpu },
    { name: 'Configuracoes', label: 'Configurações', icon: Settings2 },
    { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark },
  ];

  const screensUsuario = [
    { name: 'MeuContrato', label: 'Meu Contrato', icon: FileText },
    { name: 'MeusPagamentos', label: 'Meus Pagamentos', icon: CreditCard },
    { name: 'Historico', label: 'Histórico', icon: Clock3 },
    { name: 'Configuracoes', label: 'Configurações', icon: Settings2 },
    { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark },
  ];

  // Selecionar telas baseado no role
  const screens = role === 'admin' ? screensAdmin : screensUsuario;

  const renderButtons = () => {
    const rows = [];
    for (let i = 0; i < screens.length; i += numColumns) {
      rows.push(screens.slice(i, i + numColumns));
    }
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.button}
            onPress={() => navigation.navigate(item.name)}
          >
            <item.icon size={28} color="#fff" />
            <Text style={styles.buttonText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer scrollable>
        <PageHeader title="Menu" subtitle={`Logado como: ${user?.email || 'Usuário'}`} />
        {renderButtons()}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    width: '100%',
  },
  button: {
    ...commonStyles.buttonPrimary,
    width: 160,
    margin: 8,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    ...commonStyles.buttonText,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  logoutContainer: {
    marginTop: 24,
    width: '100%',
  },
  logoutButton: {
    ...commonStyles.buttonSecondary,
    borderColor: colors.danger,
    backgroundColor: '#fff',
  },
  logoutText: {
    ...commonStyles.buttonTextSecondary,
    color: colors.danger,
  },
});
