import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, SafeAreaView } from 'react-native';
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
      <Text style={styles.text}>Endereço: {item.endereco}</Text>
      <Text style={styles.text}>Andar: {item.andar}</Text>
      <Text style={styles.text}>Completo: {item.completo}</Text>
      <Text style={styles.text}>Torre: {item.torre}</Text>
      <View style={styles.botoes}>
        <Button title="Editar" onPress={() => navigation.navigate('CadastroImovel', { editar: item })} />
        <Button title="Excluir" color="#d9534f" onPress={() => excluirImovel(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>🏢 Lista de Imóveis</Text>
        <FlatList
          data={imoveis}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum imóvel cadastrado.</Text>}
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
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  item: {
    backgroundColor: '#f1f1f1', padding: 15,
    borderRadius: 8, marginBottom: 10
  },
  titulo: {
    fontSize: 18, fontWeight: 'bold'
  },
  text: {
    flexWrap: 'wrap',
    numberOfLines: 2,
    ellipsizeMode: 'tail'
  },
  botoes: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10
  },
  vazio: {
    textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999'
  },
  listContainer: { paddingBottom: 80 },
  fixedBottom: { position: 'absolute', bottom: 16, left: 16, right: 16 },
});
