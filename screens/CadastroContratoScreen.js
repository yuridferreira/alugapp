import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import db from '../db/db';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';

// Garante que notificações agendadas mostrem alerta e som
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
  }),
});

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
      setInquilinos(inquilinosRaw.map(i => ({ nome: i.nome || i.name || '', cpf: i.cpf || i.cpf || (i.id ? String(i.id) : '') })));
      setImoveis(imoveisRaw.map(i => ({ id: i.id, endereco: i.endereco || i.address || i.address || '', tipo: i.tipo || i.meta?.tipo || '' })));
    }
    carregarDados();
  }, []);

  // Função para formatar a data para o formato DD/MM/YYYY
  const formatarData = (value) => {
    const numeros = value.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  // Função para converter data DD/MM/YYYY para YYYY-MM-DD
  const converterDataParaBanco = (data) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  // Agenda notificação 3 dias antes do 'fim' do contrato, buscando o endereço do imóvel
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
    // fallback para state
    imovel = imoveis.find(i => String(i.id) === String(contrato.imovel));
  }
  const endereco = imovel?.endereco || imovel?.address || contrato.imovel;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Aluguel próximo do vencimento!',
        body: `O aluguel do imóvel em ${endereco} vence em breve.`,
        sound: true,
      },
      trigger: dataNotificacao,
    });
  };

  const handleSalvar = async () => {
    if (!selectedInquilino || !selectedImovel || !inicio || !fim || !valor) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    // Converter as datas para o formato YYYY-MM-DD
    const dataInicioFormatada = converterDataParaBanco(inicio);
    const dataFimFormatada = converterDataParaBanco(fim);

    const contrato = {
      // legacy fields used by web AsyncStorage
      inquilino: selectedInquilino,
      imovel: selectedImovel,
      valor,
      dataInicio: dataInicioFormatada,
      dataTermino: dataFimFormatada,
      status: 'ativo',
      // fields used by SQLite
      property_id: selectedImovel,
      tenant_id: selectedInquilino,
      start_date: dataInicioFormatada,
      end_date: dataFimFormatada,
      rent_value: Number(valor) || 0,
    };

    try {
      const savedId = await db.saveContrato(contrato);
      // fetch canonical saved contract (normalize fields) and use it for notification scheduling
      let saved = null;
      try {
        saved = await db.getContratoById(savedId);
      } catch (e) {
        console.warn('Erro ao buscar contrato salvo, usando objeto local:', e);
        saved = { ...contrato, id: savedId };
      }
      await agendarNotificacao(saved);
      Alert.alert('Contrato cadastrado com sucesso!');
      navigation.navigate('ListaContratos');
    } catch (err) {
      Alert.alert('Erro ao salvar contrato.');
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastro de Contrato</Text>

        <Text>Inquilino:</Text>
        <Picker
          selectedValue={selectedInquilino}
          onValueChange={setSelectedInquilino}
          style={styles.input}
        >
          <Picker.Item label="Selecione..." value="" />
          {inquilinos.map(i => (
            <Picker.Item key={i.cpf} label={i.nome} value={i.cpf} />
          ))}
        </Picker>

        <Text>Imóvel:</Text>
        <Picker
          selectedValue={selectedImovel}
          onValueChange={setSelectedImovel}
          style={styles.input}
        >
          <Picker.Item label="Selecione..." value="" />
          {imoveis.map(i => (
            <Picker.Item key={i.id} label={i.endereco} value={i.id} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Data de Início (DD/MM/AAAA)"
          value={inicio}
          onChangeText={t => setInicio(formatarData(t))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de Fim (DD/MM/AAAA)"
          value={fim}
          onChangeText={t => setFim(formatarData(t))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Valor (R$)"
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
        />

        <Button title="Salvar Contrato" onPress={handleSalvar} />
        <View style={{ marginTop: 12 }}>
          <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background },
  title: commonStyles.title,
  input: commonStyles.input,
});