import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import db from '../db/db';

export default function CadastroInquilinoScreen() {
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
      await db.saveInquilino(inquilino);
      Alert.alert('Inquilino cadastrado com sucesso!');
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
    } catch (error) {
      console.error('Erro ao salvar inquilino:', error);
      Alert.alert('Erro ao salvar o inquilino.');
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff',
  },
  title: {
    fontSize: 24, marginBottom: 20, textAlign: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 10, marginBottom: 12,
  },
});
