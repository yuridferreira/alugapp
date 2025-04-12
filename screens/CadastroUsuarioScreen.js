import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastroUsuarioScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSalvar = async () => {
    if (!email || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    const key = 'usuario_' + email.toLowerCase();

    try {
      const existente = await AsyncStorage.getItem(key);
      if (existente) {
        Alert.alert('Erro', 'Usuário já existe.');
        return;
      }

      await AsyncStorage.setItem(key, JSON.stringify({ email, senha }));
      Alert.alert('Usuário cadastrado com sucesso!');
      setEmail('');
      setSenha('');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      Alert.alert('Erro ao cadastrar usuário');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <Button title="Cadastrar" onPress={handleSalvar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', backgroundColor: '#fff', padding: 20,
  },
  title: {
    fontSize: 24, marginBottom: 20, textAlign: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 10, marginBottom: 12,
  },
});
