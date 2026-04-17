import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import { House } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';

export default function ListaImoveisScreen({ navigation }) {
  const [imoveis, setImoveis] = useState([]);

  const carregarImoveis = async () => {
    try {
      await db.init();
      const lista = await db.getTodosImoveis();
      const mapped = lista.map(i => ({
        ...i,
        tipo: i.tipo || i.meta?.tipo || i.title,
        endereco: i.endereco || i.address || i.endereco || '',
      }));
      setImoveis(mapped);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    }
  };

  const excluirImovel = async (id) => {
    const confirmar = async () => {
      try {
        await db.deleteImovel(id);
        setImoveis(prev => prev.filter(i => i.id !== id));
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja excluir este imóvel?')) {
        await confirmar();
      }
      return;
    }

    Alert.alert('Confirmação', 'Deseja excluir este imóvel?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: confirmar },
    ]);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarImoveis);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={[commonStyles.card, styles.item]}>
      <Text style={styles.title}>{item.tipo}</Text>
      <Text style={commonStyles.text}>Endereço: {item.endereco}</Text>
      <Text style={commonStyles.text}>Andar: {item.andar}</Text>
      <Text style={commonStyles.text}>Completo: {item.completo}</Text>
      <Text style={commonStyles.text}>Torre: {item.torre}</Text>
      <View style={styles.rowButtons}>
        <PrimaryButton title="Editar" onPress={() => navigation.navigate('CadastroImovel', { editar: item })} style={styles.smallButton} textStyle={styles.smallButtonText} />
        <SecondaryButton title="Excluir" onPress={() => excluirImovel(item.id)} style={[styles.smallButton, styles.deleteButton]} textStyle={styles.deleteText} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader icon={House} title="Lista de Imóveis" />
        <FlatList
          data={imoveis}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum imóvel cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />
        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={styles.bottomButton} />
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: colors.text,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginTop: 14,
  },
  smallButton: {
    flex: 1,
    minWidth: 120,
  },
  smallButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  deleteText: {
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  bottomButton: {
    marginTop: 18,
  },
});
