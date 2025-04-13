import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const screens = [
    { name: 'DashboardIA', label: 'IA', icon: 'robot-outline' },
    { name: 'CadastroInquilino', label: 'Inquilino', icon: 'person-add-outline' },
    { name: 'ListaInquilinos', label: 'Inquilinos', icon: 'people-outline' },
    { name: 'CadastroUsuario', label: 'Novo Usuário', icon: 'person-circle-outline' },
    { name: 'ListaUsuarios', label: 'Usuários', icon: 'list-circle-outline' },
    { name: 'Contrato', label: 'Novo Contrato', icon: 'document-text-outline' },
    { name: 'ListaContratos', label: 'Contratos', icon: 'list-circle-outline' },
    { name: 'CadastroImovel', label: 'Imóvel', icon: 'home-outline' },
    { name: 'ListaImoveis', label: 'Imóveis', icon: 'home-sharp' },
    { name: 'Pagamentos', label: 'Pagamentos', icon: 'card-outline' },
    { name: 'Historico', label: 'Histórico', icon: 'time-outline' },
    { name: 'Configuracoes', label: 'Configurações', icon: 'settings-outline' },
    { name: 'Ajuda', label: 'Ajuda', icon: 'help-circle-outline' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate(item.name)}
    >
      <Ionicons name={item.icon} size={24} color="#fff" />
      <Text style={styles.buttonText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Menu</Text>
      <FlatList
        data={screens}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', paddingTop: 30,
  },
  title: {
    fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12,
  },
  grid: {
    paddingHorizontal: 10, paddingBottom: 16,
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
    color: '#fff', marginTop: 4, fontSize: 12, textAlign: 'center',
  },
});
