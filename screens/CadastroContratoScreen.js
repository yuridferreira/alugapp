import React, { useEffect, useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, TextInput, Text, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { commonStyles } from '../styles/commonStyles';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true }) });

export default function CadastroContratoScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [selectedInquilino, setSelectedInquilino] = useState('');
  const [selectedImovel, setSelectedImovel] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [valor, setValor] = useState('');

  useEffect(() => {
    async function carregarDados() {
      await db.init();
      const inquilinosRaw = await db.getTodosInquilinos();
      const imoveisRaw = await db.getTodosImoveis();
      setInquilinos(inquilinosRaw.map(i => ({ nome: i.nome || i.name || '', cpf: i.cpf || String(i.id || '') })));
      setImoveis(imoveisRaw.map(i => ({ id: i.id, endereco: i.endereco || i.address || '', tipo: i.tipo || '' })));
    }
    carregarDados();
  }, []);

  const formatarData = (value) => {
    const numeros = value.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  const converterDataParaBanco = (data) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const agendarNotificacao = async (contrato) => {
    if (!contrato.fim) return;
    const [dia, mes, ano] = contrato.fim.split('/');
    const vencimento = new Date(`${ano}-${mes}-${dia}`);
    const dataNotificacao = new Date(vencimento);
    dataNotificacao.setDate(dataNotificacao.getDate() - 3);
    let imovel = null;
    try {
      imovel = await db.getImovelById(contrato.imovel);
    } catch (e) {
      console.warn('Erro ao buscar imóvel para notificação:', e);
      imovel = imoveis.find(i => String(i.id) === String(contrato.imovel));
    }
    const endereco = imovel?.endereco || contrato.imovel;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Aluguel próximo do vencimento!',
        body: `O aluguel do imóvel em ${endereco} vence em breve.`,
        sound: true,
      },
      trigger: dataNotificacao,
    });
  };

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
    if (!selectedInquilino || !selectedImovel || !inicio || !fim || !valor) {
      showAlert('Preencha todos os campos!');
      return;
    }
    const dataInicioFormatada = converterDataParaBanco(inicio);
    const dataFimFormatada = converterDataParaBanco(fim);
    const contrato = {
      inquilino: selectedInquilino,
      imovel: selectedImovel,
      valor,
      dataInicio: dataInicioFormatada,
      dataTermino: dataFimFormatada,
      status: 'ativo',
      property_id: selectedImovel,
      tenant_id: selectedInquilino,
      start_date: dataInicioFormatada,
      end_date: dataFimFormatada,
      rent_value: Number(valor) || 0,
    };

    try {
      const savedId = await db.saveContrato(contrato);
      let saved = null;
      try { saved = await db.getContratoById(savedId); } catch (e) { saved = { ...contrato, id: savedId }; }
      await agendarNotificacao(saved);
      showAlert('Contrato cadastrado com sucesso!');
      navigation.navigate('ListaContratos');
    } catch (err) {
      showAlert('Erro ao salvar contrato.');
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <PageContainer scrollable>
          <PageHeader title="Cadastro de Contrato" />
          <Text style={commonStyles.text}>Inquilino:</Text>
          <Picker selectedValue={selectedInquilino} onValueChange={setSelectedInquilino} style={commonStyles.input}>
            <Picker.Item label="Selecione..." value="" />
            {inquilinos.map(i => <Picker.Item key={i.cpf} label={i.nome} value={i.cpf} />)}
          </Picker>
          <Text style={commonStyles.text}>Imóvel:</Text>
          <Picker selectedValue={selectedImovel} onValueChange={setSelectedImovel} style={commonStyles.input}>
            <Picker.Item label="Selecione..." value="" />
            {imoveis.map(i => <Picker.Item key={String(i.id)} label={i.endereco} value={i.id} />)}
          </Picker>
          <TextInput style={commonStyles.input} placeholder="Data de Início (DD/MM/AAAA)" value={inicio} onChangeText={t => setInicio(formatarData(t))} keyboardType="numeric" />
          <TextInput style={commonStyles.input} placeholder="Data de Fim (DD/MM/AAAA)" value={fim} onChangeText={t => setFim(formatarData(t))} keyboardType="numeric" />
          <TextInput style={commonStyles.input} placeholder="Valor (R$)" value={valor} onChangeText={setValor} keyboardType="numeric" />
          <PrimaryButton title="Salvar Contrato" onPress={handleSalvar} />
          <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }} />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
