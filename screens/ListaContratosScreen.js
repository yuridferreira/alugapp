import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListaContratosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);

  const carregarContratos = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const contratoKeys = keys.filter(k => k.startsWith('contrato_'));
      const entries = await AsyncStorage.multiGet(contratoKeys);
      const lista = entries.map(([key, v]) => {
        const item = JSON.parse(v);
        if (!item.id) item.id = key.replace('contrato_', '');
        return item;
      });
      setContratos(lista);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    }
  };

  const excluirContrato = async (id) => {
    const execute = async () => {
      try {
        const chave = `contrato_${id}`;
        const exists = await AsyncStorage.getItem(chave);
        console.log(`Chave ${chave} existe?`, !!exists);

        if (!exists) {
          Platform.OS === 'web'
            ? alert(`Contrato ${chave} não encontrado.`)
            : Alert.alert('Erro', `Contrato ${chave} não encontrado.`);
          return;
        }

        await AsyncStorage.removeItem(chave);
        setContratos(prev => prev.filter(c => c.id !== id));
        console.log(`Contrato ${id} excluído com sucesso.`);
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja excluir este contrato?')) {
        await execute();
      }
    } else {
      Alert.alert('Confirmação', 'Deseja excluir este contrato?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: execute },
      ]);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarContratos);
    return unsubscribe;
  }, [navigation]);

  // Função para formatar a data para o formato DD/MM/YYYY
  const formatarData = (data) => {
    if (!data) return 'Não definida';
    const [ano, mes, dia] = data.split('-');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.titulo}>Contrato {item.id}</Text>
      <Text>Inquilino CPF: {item.inquilino}</Text>
      <Text>Imóvel ID: {item.imovel}</Text>
      <Text>Período: {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}</Text>
      <Text>Valor: R$ {item.valor}</Text>
      <View style={styles.botoes}>
        <Button title="Excluir" color="#d9534f" onPress={() => excluirContrato(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📃 Lista de Contratos</Text>
      <FlatList
        data={contratos}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum contrato cadastrado.</Text>}
      />
      <View style={styles.rodape}>
        <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  item: {
    backgroundColor: '#f1f1f1', padding: 15,
    borderRadius: 8, marginBottom: 10
  },
  titulo: {
    fontSize: 18, fontWeight: 'bold'
  },
  botoes: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  vazio: {
    textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999'
  },
  rodape: {
    marginTop: 20
  }
});