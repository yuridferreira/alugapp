import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListaInquilinosScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);

  useEffect(() => {
    const carregarInquilinos = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const inquilinoKeys = keys.filter(k => k.startsWith('inquilino_'));

        const entries = await AsyncStorage.multiGet(inquilinoKeys);
        const lista = entries.map(([key, value]) => JSON.parse(value));

        setInquilinos(lista);
      } catch (error) {
        console.error('Erro ao carregar inquilinos:', error);
      }
    };

    carregarInquilinos();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.detalhe}>CPF: {item.cpf}</Text>
      <Text style={styles.detalhe}>Telefone: {item.telefone}</Text>
      <Text style={styles.detalhe}>Email: {item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Lista de Inquilinos</Text>

      <FlatList
        data={inquilinos}
        keyExtractor={(item) => item.cpf}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum inquilino cadastrado.</Text>}
      />

      <View style={styles.voltar}>
        <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff',
  },
  title: {
    fontSize: 24, marginBottom: 20, textAlign: 'center',
  },
  item: {
    backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 10,
  },
  nome: {
    fontSize: 18, fontWeight: 'bold',
  },
  detalhe: {
    fontSize: 14,
  },
  vazio: {
    textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999',
  },
  voltar: {
    marginTop: 20,
  },
});
