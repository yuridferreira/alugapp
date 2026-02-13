import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import db from '../db/db';

export default function ListaImoveisScreen({ navigation }) {
  const [imoveis, setImoveis] = useState([]);

  const carregarImoveis = async () => {
    try {
        await db.init();
        const lista = await db.getTodosImoveis();
        const mapped = lista.map(i => ({
          ...i,
          tipo: i.tipo || i.meta?.tipo || i.title,
          endereco: i.endereco || i.address || i.address || i.endereco || i.address,
        }));
        setImoveis(mapped);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    }
  };

  const excluirImovel = async (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este imóvel?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await db.deleteImovel(id);
            setImoveis(prev => prev.filter(i => i.id !== id));
          } catch (error) {
            console.error('Erro ao excluir imóvel:', error);
          }
        }
      }
    ]);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarImoveis);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.titulo}>{item.tipo}</Text>
      <Text>Endereço: {item.endereco}</Text>
      <Text>Andar: {item.andar}</Text>
      <Text>Completo: {item.completo}</Text>
      <Text>Torre: {item.torre}</Text>
      <View style={styles.botoes}>
        <Button title="Editar" onPress={() => navigation.navigate('CadastroImovel', { editar: item })} />
        <Button title="Excluir" color="#d9534f" onPress={() => excluirImovel(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📃 Lista de Imóveis</Text>
      <FlatList
        data={imoveis}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum imóvel cadastrado.</Text>}
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
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10
  },
  vazio: {
    textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999'
  },
  rodape: {
    marginTop: 20
  }
});
