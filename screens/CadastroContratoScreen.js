import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      const keys = await AsyncStorage.getAllKeys();
      const inq = keys.filter(k => k.startsWith('inquilino_'));
      const imo = keys.filter(k => k.startsWith('imovel_'));

      const inquilinosRaw = await AsyncStorage.multiGet(inq);
      const imoveisRaw = await AsyncStorage.multiGet(imo);

      setInquilinos(inquilinosRaw.map(([_, v]) => JSON.parse(v)));
      setImoveis(imoveisRaw.map(([_, v]) => JSON.parse(v)));
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

    const imovelRaw = await AsyncStorage.getItem(`imovel_${contrato.imovel}`);
    const imovel = imovelRaw ? JSON.parse(imovelRaw) : null;
    const endereco = imovel?.endereco ?? contrato.imovel;

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
      id: Date.now().toString(),
      inquilino: selectedInquilino,
      imovel: selectedImovel,
      valor,
      status: 'ativo', // ou "finalizado" conforme o seu caso
      dataInicio: dataInicioFormatada,
      dataTermino: dataFimFormatada,
    };

    try {
      await AsyncStorage.setItem(`contrato_${contrato.id}`, JSON.stringify(contrato));
      await agendarNotificacao(contrato);
      Alert.alert('Contrato cadastrado com sucesso!');
      navigation.navigate('ListaContratos');
    } catch (err) {
      Alert.alert('Erro ao salvar contrato.');
      console.error(err);
    }
  };

  return (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});