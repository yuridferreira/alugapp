import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PagamentosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);
  const [statusPagamentos, setStatusPagamentos] = useState({});

  useEffect(() => {
    const carregarContratos = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const contratoKeys = keys.filter(k => k.startsWith('contrato_'));
      const entries = await AsyncStorage.multiGet(contratoKeys);
      const lista = entries.map(([_, v]) => JSON.parse(v));
      setContratos(lista);

      const estados = {};
      lista.forEach(c => {
        estados[c.id] = 'pendente'; // valor inicial padrão
      });
      setStatusPagamentos(estados);
    };

    carregarContratos();
  }, []);

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const contrato = contratos.find(c => c.id === id);
      if (!contrato) return;

      contrato.status = novoStatus;
      await AsyncStorage.setItem(`contrato_${id}`, JSON.stringify(contrato));

      setStatusPagamentos(prev => ({ ...prev, [id]: novoStatus }));
    } catch (err) {
      Alert.alert('Erro ao atualizar status');
      console.error(err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.label}>Contrato #{item.id}</Text>
      <Text>Inquilino: {item.inquilino}</Text>
      <Text>Imóvel: {item.imovel}</Text>
      <Text>Valor: R$ {item.valor}</Text>
      <Text>Status atual: {statusPagamentos[item.id] || 'pendente'}</Text>

      <View style={styles.botoes}>
        <Button title="Pago" color="#28a745" onPress={() => atualizarStatus(item.id, 'pago')} />
        <Button title="Pendente" color="#ffc107" onPress={() => atualizarStatus(item.id, 'pendente')} />
        <Button title="Atrasado" color="#dc3545" onPress={() => atualizarStatus(item.id, 'atrasado')} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status de Pagamentos</Text>
      <FlatList
        data={contratos}
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
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  }
});

