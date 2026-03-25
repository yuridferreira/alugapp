import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListaUsuariosScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const usuarioKeys = keys.filter(k => k.startsWith('usuario_'));

        const entries = await AsyncStorage.multiGet(usuarioKeys);
        const lista = entries.map(([key, value]) => JSON.parse(value));

        setUsuarios(lista);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    carregarUsuarios();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.email}>Email: {item.email}</Text>
      <Text style={styles.detalhe}>Senha: {item.senha}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>👥 Lista de Usuários</Text>

        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.email}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.fixedBottom}>
          <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1, padding: 20,
  },
  title: {
    fontSize: 24, marginBottom: 20, textAlign: 'center',
  },
  item: {
    backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 10,
  },
  email: {
    fontSize: 18, fontWeight: 'bold',
  },
  detalhe: {
    fontSize: 14,
    numberOfLines: 1,
    ellipsizeMode: 'tail'
  },
  vazio: {
    textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999',
  },
  listContainer: { paddingBottom: 80 },
  fixedBottom: { position: 'absolute', bottom: 16, left: 16, right: 16 },
});
