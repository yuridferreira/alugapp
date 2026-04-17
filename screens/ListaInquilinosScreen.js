import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';

export default function ListaInquilinosScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);

  useEffect(() => {
    const carregarInquilinos = async () => {
      try {
        await db.init();
        const lista = await db.getTodosInquilinos();
        const mapped = lista.map(i => ({
          nome: i.nome || i.name || '',
          cpf: i.cpf || String(i.id || ''),
          telefone: i.telefone || i.phone || '',
          email: i.email || '',
        }));
        setInquilinos(mapped);
      } catch (error) {
        console.error('Erro ao carregar inquilinos:', error);
      }
    };
    carregarInquilinos();
  }, []);

  const renderItem = ({ item }) => (
    <View style={commonStyles.card}>
      <Text style={styles.name}>{item.nome}</Text>
      <Text style={commonStyles.textSecondary}>CPF: {item.cpf}</Text>
      <Text style={commonStyles.textSecondary}>Telefone: {item.telefone}</Text>
      <Text style={commonStyles.textSecondary}>Email: {item.email}</Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader title="Lista de Inquilinos" />
        <FlatList
          data={inquilinos}
          keyExtractor={(item) => item.cpf || Math.random().toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum inquilino cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />
        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={styles.bottomButton} />
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
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
