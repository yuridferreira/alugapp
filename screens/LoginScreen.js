import React, { useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, TextInput } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles } from '../styles/commonStyles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      alert('Preencha o email e a senha');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      alert(`Erro no login: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <PageContainer scrollable>
          <PageHeader title="Login" />
          <TextInput
            style={commonStyles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <PrimaryButton title="Entrar" onPress={handleLogin} />
          <SecondaryButton title="Criar conta" onPress={() => navigation.navigate('CadastroUsuario')} style={{ marginTop: 16 }} />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
