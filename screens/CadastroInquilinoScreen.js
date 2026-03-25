import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, SafeAreaView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import db from '../db/db';

export default function CadastroInquilinoScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      try { await db.init(); } catch (e) { console.warn(e); }
    };
    init();
  }, []);

  const handleSalvar = async () => {
    if (!nome || !cpf || !telefone || !email) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    const inquilino = {
      name: nome,
      cpf,
      phone: telefone,
      email,
    };

    try {
      const id = await db.saveInquilino(inquilino);
      console.log('Inquilino salvo com id', id);
      Alert.alert('Inquilino cadastrado com sucesso!');
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
    } catch (error) {
      console.error('Erro ao salvar inquilino:', error);
      Alert.alert('Erro ao salvar o inquilino', error.message || error.toString());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Cadastro de Inquilino</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Button title="Salvar" onPress={handleSalvar} />
          <View style={{ marginTop: 12 }}>
            <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: commonStyles.safeArea,
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: commonStyles.title,
  input: commonStyles.input,
});
