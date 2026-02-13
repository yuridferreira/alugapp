import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import db from '../db/db';

export default function CadastroUsuarioScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        await db.init();
      } catch (e) {
        console.warn('Erro ao inicializar DB:', e);
      }
    };
    init();
  }, []);

  const handleCadastro = async () => {
    if (!email || !senha || !name) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    try {
      // Verifica se usuário já existe
      const existing = await db.getUsuarioByEmail(email.toLowerCase());
      if (existing) {
        Alert.alert('Erro', 'Já existe um usuário com este email');
        return;
      }

      await db.saveUsuario({ name, email: email.toLowerCase(), password: senha, role: 'user' });
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso');
      setName(''); setEmail(''); setSenha('');
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      Alert.alert('Erro', err.message || 'Não foi possível cadastrar o usuário');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 12 },
  button: { backgroundColor: '#0066cc', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
