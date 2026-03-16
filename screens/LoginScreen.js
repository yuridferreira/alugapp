import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha o email e a senha');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // Não precisa navegar manualmente
      // AuthContext vai redirecionar automaticamente
    } catch (error) {
      Alert.alert('Erro no login', error.message);
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

      <TouchableOpacity onPress={() => navigation.navigate('CadastroUsuario')}>
        <Text style={{ marginTop: 15 }}>Criar conta</Text>
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