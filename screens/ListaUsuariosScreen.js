import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';

export default function ListaUsuariosScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const usuarioKeys = keys.filter(k => k.startsWith('usuario_'));
        const entries = await AsyncStorage.multiGet(usuarioKeys);
        const lista = entries.map(([key, value]) => JSON.parse(value));
        setUsuarios(lista);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };
    carregarUsuarios();
  }, []);

  const renderItem = ({ item }) => (
    <View style={[commonStyles.card, styles.item]}>
      <Text style={styles.email}>Email: {item.email}</Text>
      <Text style={styles.detail}>Senha: {item.senha}</Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader icon={Users} title="Lista de Usuários" />
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.email}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum usuário cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />
        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={styles.bottomButton} />
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: 14,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  listContainer: {
    paddingBottom: 20,
  },
  bottomButton: {
    marginTop: 18,
  },
});
