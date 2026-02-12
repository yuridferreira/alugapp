import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Criação do usuário admin padrão, se ainda não existir
  useEffect(() => {
    const criarUsuarioAdmin = async () => {
      const user = await AsyncStorage.getItem('usuario_admin');
      if (!user) {
        await AsyncStorage.setItem('usuario_admin', JSON.stringify({
          email: 'admin',
          senha: 'admin'
        }));        
        console.log('✅ Usuário admin criado');
      }
    };
    criarUsuarioAdmin();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha o email e a senha');
      return;
    }

    const key = 'usuario_' + email.toLowerCase();

    try {
      const userData = await AsyncStorage.getItem(key);
      if (!userData) {
        Alert.alert('Usuário não encontrado');
        return;
      }

      const user = JSON.parse(userData);

      if (user.senha === senha) {
        Alert.alert('Login bem-sucedido!');
        navigation.navigate('Home');
      } else {
        Alert.alert('Senha incorreta');
      }
    } catch (error) {
      console.error('Erro ao verificar login:', error);
      Alert.alert('Erro ao verificar login');
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
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20,
  },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
