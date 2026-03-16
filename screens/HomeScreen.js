import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const screens = [
  { name: 'DashboardIA', label: 'IA', icon: 'robot-outline', adminOnly: false },
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
  { name: 'Configuracoes', label: 'Configurações', icon: 'settings-outline', adminOnly: false },
  { name: 'Ajuda', label: 'Ajuda', icon: 'help-circle-outline', adminOnly: false },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        if (item.adminOnly && role !== 'admin') {
          alert('Acesso restrito a administradores.');
        } else {
          navigation.navigate(item.name);
        }
      }}
    >
      <Ionicons name={item.icon} size={24} color="#fff" />
      <Text style={styles.buttonText}>{item.label}</Text>
    </TouchableOpacity>
  );

const filteredScreens = screens.filter(screen => !screen.adminOnly || role === 'admin');
  
return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Menu</Text>

      <Text style={styles.userText}>
        Logado como: {user?.email}
      </Text>
      <FlatList
        data={filteredScreens}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  userText: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#0066cc',
    margin: 6,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Dimensions.get('window').width / 3 - 20,
  },
  buttonText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#cc0000',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});