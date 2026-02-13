import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import db from '../db/db';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    const setup = async () => {
      try {
        await db.init();
        // cria usuário admin padrão (upsert)
        await db.saveUsuario({ name: 'Admin', email: 'admin', password: 'admin', role: 'admin' });
      } catch (err) {
        console.warn('Erro inicializando DB:', err);
      }
    };
    setup();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha o email e a senha');
      return;
    }

    try {
      const user = await db.authUsuario(email, senha);
      Alert.alert('Login bem-sucedido!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao verificar login:', error);
      Alert.alert('Erro no login', error.message || 'Erro ao verificar login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '100%', borderColor: '#ccc', borderWidth: 1, marginBottom: 15, padding: 10, borderRadius: 6 },
  button: { backgroundColor: '#0066cc', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 6 },
  buttonText: { color: '#fff', fontSize: 16 },
});
