import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, SafeAreaView } from 'react-native';
import db from '../db/db';
import { commonStyles, colors } from '../styles/commonStyles';

export default function ListaInquilinosScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);

  useEffect(() => {
    const carregarInquilinos = async () => {
      try {
        await db.init();
        const lista = await db.getTodosInquilinos();
        // compatibilidade com chaves antigas
        const mapped = lista.map(i => ({
          nome: i.nome || i.name || '',
          cpf: i.cpf || i.cpf || (i.id ? String(i.id) : ''),
          telefone: i.telefone || i.phone || '',
          email: i.email || ''
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
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={commonStyles.textSecondary}>CPF: {item.cpf}</Text>
      <Text style={commonStyles.textSecondary}>Telefone: {item.telefone}</Text>
      <Text style={commonStyles.textSecondary}>Email: {item.email}</Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        <Text style={commonStyles.title}>Lista de Inquilinos</Text>

        <FlatList
          data={inquilinos}
          keyExtractor={(item) => item.cpf || Math.random().toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum inquilino cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.fixedBottom}>
          <View style={commonStyles.button}>
            <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} color="#fff" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: commonStyles.container,
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: { paddingBottom: 80 },
  fixedBottom: { position: 'absolute', bottom: 16, left: 16, right: 16 },
});
