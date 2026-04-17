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

  const screens = [
    { name: 'CadastroInquilino', label: 'Inquilino', icon: UserPlus, adminOnly: false },
    { name: 'ListaInquilinos', label: 'Inquilinos', icon: Users, adminOnly: false },
    { name: 'CadastroUsuario', label: 'Novo Usuário', icon: CircleUser, adminOnly: true },
    { name: 'ListaUsuarios', label: 'Usuários', icon: ListChecks, adminOnly: true },
    { name: 'Contrato', label: 'Novo Contrato', icon: FileText, adminOnly: false },
    { name: 'ListaContratos', label: 'Contratos', icon: ListChecks, adminOnly: false },
    { name: 'CadastroImovel', label: 'Imóvel', icon: HousePlus, adminOnly: false },
    { name: 'ListaImoveis', label: 'Imóveis', icon: House, adminOnly: false },
    { name: 'Pagamentos', label: 'Pagamentos', icon: CreditCard, adminOnly: false },
    { name: 'Historico', label: 'Histórico', icon: Clock3, adminOnly: false },
    { name: 'DashboardIA', label: 'IA', icon: Cpu, adminOnly: false },
    { name: 'Configuracoes', label: 'Configurações', icon: Settings2, adminOnly: false },
    { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark, adminOnly: false },
  ];

  const filteredScreens = screens.filter(screen => !screen.adminOnly || role === 'admin');

  const renderButtons = () => {
    const rows = [];
    for (let i = 0; i < filteredScreens.length; i += numColumns) {
      rows.push(filteredScreens.slice(i, i + numColumns));
    }
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.button}
            onPress={() => {
              if (item.adminOnly && role !== 'admin') {
                alert('Acesso restrito a administradores.');
              } else {
                navigation.navigate(item.name);
              }
            }}
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
