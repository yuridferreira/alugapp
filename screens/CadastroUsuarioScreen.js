import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db } from '../db/db'; // ajuste conforme a localização real
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    try {
      const usuario = await db.authUsuario(email, senha);
      Alert.alert('Bem-vindo', `Login bem-sucedido para ${usuario.email}`);
      setEmail('');
      setSenha('');
      navigation.navigate('Home'); // ou 'Dashboard', ou outro nome da sua tela principal
    } catch (err) {
      Alert.alert('Erro no login', err.message);
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

      <Button title="Entrar" onPress={handleLogin} />
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
