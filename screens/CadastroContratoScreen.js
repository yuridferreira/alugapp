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

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true })
  });
}

export default function CadastroContratoScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [selectedInquilino, setSelectedInquilino] = useState('');
  const [selectedImovel, setSelectedImovel] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [valor, setValor] = useState('');
  const [emailInquilino, setEmailInquilino] = useState(''); // ✨ Novo campo para vinculação
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      await db.init();
      const inquilinosRaw = await db.getTodosInquilinos();
      const imoveisRaw = await db.getTodosImoveis();
      setInquilinos(inquilinosRaw.map(i => ({
        id: i.id || '',
        nome: i.nome || i.name || '',
        cpf: i.cpf || String(i.id || ''),
        email: (i.email || '').toLowerCase()
      })));
      setImoveis(imoveisRaw.map(i => ({ id: i.id, endereco: i.endereco || i.address || '', tipo: i.tipo || '' })));
    }
    carregarDados();
  }, []);

  useEffect(() => {
    if (!selectedInquilino) return;
    const inquilinoSelecionado = inquilinos.find(i => String(i.cpf) === String(selectedInquilino) || String(i.id) === String(selectedInquilino));
    if (inquilinoSelecionado?.email) {
      setEmailInquilino(inquilinoSelecionado.email);
    }
  }, [selectedInquilino, inquilinos]);

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
    if (Platform.OS === 'web') return;
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
    if (!selectedInquilino || !selectedImovel || !inicio || !fim || !valor || !emailInquilino.trim()) {
      showAlert('Preencha todos os campos, incluindo o email do inquilino.');
      return;
    }

    const inquilinoSelecionado = inquilinos.find(
      (inquilino) => String(inquilino.cpf) === String(selectedInquilino) || String(inquilino.id) === String(selectedInquilino)
    );
    const normalizedEmail = emailInquilino.trim().toLowerCase();

    if (inquilinoSelecionado?.email && inquilinoSelecionado.email !== normalizedEmail) {
      showAlert('O email informado deve ser o mesmo email cadastrado para o inquilino selecionado.');
      return;
    }

    const valorNumerico = Number(String(valor).replace(',', '.'));
    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      showAlert('Informe um valor de aluguel válido.');
      return;
    }

    const dataInicioFormatada = converterDataParaBanco(inicio);
    const dataFimFormatada = converterDataParaBanco(fim);
    const contrato = {
      inquilino: selectedInquilino,
      imovel: selectedImovel,
      valor: valorNumerico,
      dataInicio: dataInicioFormatada,
      dataTermino: dataFimFormatada,
      status: 'ativo',
      property_id: selectedImovel,
      tenant_id: selectedInquilino,
      tenantEmail: normalizedEmail,
      start_date: dataInicioFormatada,
      end_date: dataFimFormatada,
      rent_value: valorNumerico,
    };

    try {
      setLoading(true);
      const resultado = await db.criarContratoComPagamentosAutomaticos(
        contrato,
        normalizedEmail
      );
      let saved = null;
      try { saved = await db.getContratoById(resultado.contrato.id); } catch (e) { saved = { ...contrato, id: resultado.contrato.id }; }
      try {
        await agendarNotificacao({ ...saved, fim });
      } catch (notificationError) {
        console.warn('Contrato salvo, mas não foi possível agendar a notificação:', notificationError);
      }
      showAlert(
        'Contrato cadastrado com sucesso!',
        `Contrato vinculado ao usuário ${resultado.contrato.email} e ${resultado.pagamentos.length} pagamento(s) foram gerados automaticamente.`
      );
      navigation.navigate('ListaContratos');
    } catch (err) {
      showAlert('Erro ao salvar contrato.', err.message);
      console.error(err);
    } finally {
      setLoading(false);
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
          <TextInput
            style={commonStyles.input}
            placeholder="Email do inquilino"
            value={emailInquilino}
            onChangeText={setEmailInquilino}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton title={loading ? 'Salvando...' : 'Salvar Contrato'} onPress={handleSalvar} disabled={loading} />
          <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }} />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
