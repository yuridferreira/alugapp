import React, { useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, TextInput, Alert, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles } from '../styles/commonStyles';

export default function CadastroUsuarioScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const showAlert = (title, message, buttons, options) => {
    if (Platform.OS === 'web') {
      if (!message) {
        window.alert(title);
        return;
      }
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message, buttons, options);
  };

  const handleCadastro = async () => {
    if (!email || !senha || !name) {
      showAlert('Erro', 'Preencha todos os campos!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), senha);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'usuarios', uid), {
        nome: name,
        email: email.toLowerCase(),
        role: 'user',
        criadoEm: new Date(),
      });

      showAlert('Sucesso', 'Usuário cadastrado com sucesso');
      setName('');
      setEmail('');
      setSenha('');
      navigation.goBack();
    } catch (error) {
      showAlert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <PageContainer scrollable>
          <PageHeader title="Cadastro de Usuário" />
          <TextInput style={commonStyles.input} placeholder="Nome" value={name} onChangeText={setName} />
          <TextInput style={commonStyles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={commonStyles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
          <PrimaryButton title="Cadastrar" onPress={handleCadastro} />
          <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }} />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
