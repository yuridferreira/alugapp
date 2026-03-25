import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { commonStyles, colors } from '../styles/commonStyles';

export default function HomeScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth < 400 ? 2 : 3;

  const handleLogout = async () => {
    await signOut(auth);
  };

  const screens = [
    { name: 'CadastroInquilino', label: 'Inquilino', icon: 'person-add-outline', adminOnly: false },
    { name: 'ListaInquilinos', label: 'Inquilinos', icon: 'people-outline', adminOnly: false },
    { name: 'CadastroUsuario', label: 'Novo Usuário', icon: 'person-circle-outline', adminOnly: true },
    { name: 'ListaUsuarios', label: 'Usuários', icon: 'list-circle-outline', adminOnly: true },
    { name: 'Contrato', label: 'Novo Contrato', icon: 'document-text-outline', adminOnly: false },
    { name: 'ListaContratos', label: 'Contratos', icon: 'list-circle-outline', adminOnly: false },
    { name: 'CadastroImovel', label: 'Imóvel', icon: 'home-outline', adminOnly: false },
    { name: 'ListaImoveis', label: 'Imóveis', icon: 'home-sharp', adminOnly: false },
    { name: 'Pagamentos', label: 'Pagamentos', icon: 'card-outline', adminOnly: false },
    { name: 'Historico', label: 'Histórico', icon: 'time-outline', adminOnly: false },
    { name: 'DashboardIA', label: 'IA', icon: 'robot-outline', adminOnly: false },
    { name: 'Configuracoes', label: 'Configurações', icon: 'settings-outline', adminOnly: false },
    { name: 'Ajuda', label: 'Ajuda', icon: 'help-circle-outline', adminOnly: false },
  ];

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
            <Ionicons name={item.icon} size={28} color="#fff" />
            <Text style={styles.buttonText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

const filteredScreens = screens.filter(screen => !screen.adminOnly || role === 'admin');
  
return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Menu</Text>

        <Text style={styles.userText}>
          Logado como: {user?.email}
        </Text>

        {renderButtons()}

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: commonStyles.safeArea,
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  title: commonStyles.title,
  userText: commonStyles.subtitle,
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  button: {
    ...commonStyles.button,
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 20,
  },
  buttonText: {
    ...commonStyles.buttonText,
    fontSize: 14,
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    ...commonStyles.button,
    backgroundColor: colors.danger,
    width: '80%',
  },
  logoutText: commonStyles.buttonText,
});