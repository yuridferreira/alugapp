import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PagamentosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);
  const [statusPagamentos, setStatusPagamentos] = useState({});

  // 1) Carrega contratos ativos
  useEffect(() => {
    const carregarContratos = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const contratoKeys = keys.filter(k => k.startsWith('contrato_'));
      const entries = await AsyncStorage.multiGet(contratoKeys);

      const lista = entries.map(([_, v]) => {
        const contrato = JSON.parse(v);
        contrato.valor = Number(contrato.valor); // garante que seja número
        return contrato;
      });

      setContratos(lista);

      const estados = {};
      lista.forEach(c => {
        estados[c.id] = c.status || 'pendente';
      });
      setStatusPagamentos(estados);
    };

    carregarContratos();
  }, []);

  // 2) Salva no histórico
  const salvarHistorico = async (contrato) => {
    const dados = await AsyncStorage.getItem('historico_alugueis');
    const lista = dados ? JSON.parse(dados) : [];
    lista.push(contrato);
    await AsyncStorage.setItem('historico_alugueis', JSON.stringify(lista));
  };

  // 3) Atualiza status; se for "finalizado", move para o histórico
  const atualizarStatus = async (id, novoStatus) => {
    try {
      const idx = contratos.findIndex(c => c.id === id);
      if (idx < 0) return;

      const contrato = { ...contratos[idx], status: novoStatus };

      if (novoStatus === 'finalizado') {
        await salvarHistorico(contrato);
        await AsyncStorage.removeItem(`contrato_${id}`);
        setContratos(prev => prev.filter(c => c.id !== id));
        setStatusPagamentos(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      } else {
        await AsyncStorage.setItem(`contrato_${id}`, JSON.stringify(contrato));
        setContratos(prev => prev.map(c => c.id === id ? contrato : c));
        setStatusPagamentos(prev => ({ ...prev, [id]: novoStatus }));
      }
    } catch (err) {
      Alert.alert('Erro ao atualizar status');
      console.error(err);
    }
  };

  // 4) Renderiza cada item
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.label}>Contrato #{item.id}</Text>
      <Text>Inquilino: {item.inquilino}</Text>
      <Text>Imóvel: {item.imovel}</Text>
      <Text>
        Valor: R$ {typeof item.valor === 'number' && !isNaN(item.valor) ? item.valor.toFixed(2) : 'Valor inválido'}
      </Text>
      <Text>Status: {statusPagamentos[item.id] || 'pendente'}</Text>

      <View style={styles.botoes}>
        <Button title="PAGO"      color="#28a745" onPress={() => atualizarStatus(item.id, 'pago')} />
        <Button title="PENDENTE"  color="#ffc107" onPress={() => atualizarStatus(item.id, 'pendente')} />
        <Button title="ATRASADO"  color="#dc3545" onPress={() => atualizarStatus(item.id, 'atrasado')} />
        <Button title="FINALIZAR" color="#6c757d" onPress={() => atualizarStatus(item.id, 'finalizado')} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status de Pagamentos</Text>
      <FlatList
        data={contratos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:     { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  item:      { backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 15 },
  label:     { fontWeight: 'bold', marginBottom: 5 },
  botoes:    { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});