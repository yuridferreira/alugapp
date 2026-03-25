import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { db } from '../db/db';

export default function CadastroImovelScreen({ route, navigation }) {
  const [id, setId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tipo, setTipo] = useState('');
  const [andar, setAndar] = useState('');
  const [completo, setCompleto] = useState('');
  const [torre, setTorre] = useState('');
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (route.params?.editar) {
      const imovel = route.params.editar;
      setId(imovel.id);
      setEndereco(imovel.endereco);
      setTipo(imovel.tipo);
      setAndar(imovel.andar || '');
      setCompleto(imovel.completo || '');
      setTorre(imovel.torre || '');
      setEditando(true);
    }
  }, [route.params]);

  const handleSalvar = async () => {
    if (!endereco || !tipo || !andar || !completo || !torre) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    const imovel = {
      ...(editando ? { id } : {}),
      endereco,
      tipo,
      andar,
      completo,
      torre
    };

    try {
      await db.saveImovel(imovel);
      Alert.alert(editando ? 'Imóvel atualizado!' : 'Imóvel cadastrado com sucesso!');
      navigation.navigate('ListaImoveis');
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      Alert.alert('Erro ao salvar o imóvel.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{editando ? 'Editar Imóvel' : 'Cadastro de Imóvel'}</Text>

        <TextInput style={styles.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
        <TextInput style={styles.input} placeholder="Tipo (Casa, Apto...)" value={tipo} onChangeText={setTipo} />
        <TextInput style={styles.input} placeholder="Andar" value={andar} onChangeText={setAndar} />
        <TextInput style={styles.input} placeholder="Completo" value={completo} onChangeText={setCompleto} />
        <TextInput style={styles.input} placeholder="Torre" value={torre} onChangeText={setTorre} />

        <Button title={editando ? 'Salvar Alterações' : 'Cadastrar'} onPress={handleSalvar} />
        <View style={{ marginTop: 12 }}>
          <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20, backgroundColor: colors.background, justifyContent: 'center' },
  title: commonStyles.title,
  input: commonStyles.input,
});
