import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const carregarHistorico = async () => {
      const dados = await AsyncStorage.getItem('historico_alugueis');
      const lista = dados ? JSON.parse(dados) : [];
      setHistorico(lista);
    };

    carregarHistorico();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.label}>Contrato #{item.id}</Text>
      <Text>Inquilino: {item.inquilino}</Text>
      <Text>Imóvel: {item.imovel}</Text>
      <Text>Valor: R$ {item.valor}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Data de Início: {item.dataInicio}</Text>
      <Text>Data de Término: {item.dataTermino}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Aluguéis</Text>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  item: {
    backgroundColor: '#f1f1f1', padding: 15,
    borderRadius: 8, marginBottom: 15
  },
  label: { fontWeight: 'bold', marginBottom: 5 },
});
