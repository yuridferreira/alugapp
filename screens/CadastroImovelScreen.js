import React, { useState, useEffect } from 'react';
import { SafeAreaView, KeyboardAvoidingView, TextInput, Alert, Platform } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

export default function CadastroImovelScreen({ route, navigation }) {
  const [id, setId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tipo, setTipo] = useState('');
  const [andar, setAndar] = useState('');
  const [completo, setCompleto] = useState('');
  const [torre, setTorre] = useState('');
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (route.params?.editar) {
      const imovel = route.params.editar;
      setId(imovel.id);
      setEndereco(imovel.endereco);
      setTipo(imovel.tipo);
      setAndar(imovel.andar || '');
      setCompleto(imovel.completo || '');
      setTorre(imovel.torre || '');
      setEditando(true);
    }
  }, [route.params]);

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
    if (!endereco || !tipo || !andar || !completo || !torre) {
      showAlert('Preencha todos os campos!');
      return;
    }

    const imovel = { ...(editando ? { id } : {}), endereco, tipo, andar, completo, torre };

    try {
      await db.saveImovel(imovel);
      Alert.alert(editando ? 'Imóvel atualizado!' : 'Imóvel cadastrado com sucesso!');
      navigation.navigate('ListaImoveis');
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      showAlert('Erro ao salvar o imóvel.');
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <PageContainer scrollable>
          <PageHeader title={editando ? 'Editar Imóvel' : 'Cadastro de Imóvel'} />
          <TextInput style={commonStyles.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
          <TextInput style={commonStyles.input} placeholder="Tipo (Casa, Apto...)" value={tipo} onChangeText={setTipo} />
          <TextInput style={commonStyles.input} placeholder="Andar" value={andar} onChangeText={setAndar} />
          <TextInput style={commonStyles.input} placeholder="Completo" value={completo} onChangeText={setCompleto} />
          <TextInput style={commonStyles.input} placeholder="Torre" value={torre} onChangeText={setTorre} />
          <PrimaryButton title={editando ? 'Salvar Alterações' : 'Cadastrar'} onPress={handleSalvar} />
          <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }} />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
