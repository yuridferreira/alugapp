import React, { useState, useEffect } from 'react';
import { SafeAreaView, KeyboardAvoidingView, TextInput, Alert, Platform } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

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

  const handleSalvar = async () => {
    if (!nome || !cpf || !telefone || !email) {
      showAlert('Preencha todos os campos!');
      return;
    }

    const inquilino = { name: nome, cpf, phone: telefone, email };

    try {
      await db.saveInquilino(inquilino);
      showAlert('Inquilino cadastrado com sucesso!');
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
    } catch (error) {
      console.error('Erro ao salvar inquilino:', error);
      showAlert('Erro ao salvar o inquilino', error.message || error.toString());
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <PageContainer scrollable>
          <PageHeader title="Cadastro de Inquilino" />
          <TextInput style={commonStyles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInput style={commonStyles.input} placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
          <TextInput style={commonStyles.input} placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
          <TextInput style={commonStyles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <PrimaryButton title="Salvar" onPress={handleSalvar} />
          <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }} />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
