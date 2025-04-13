import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Picker, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      const inquilinos = await AsyncStorage.multiGet(inq);
      const imoveis = await AsyncStorage.multiGet(imo);

      setInquilinos(inquilinos.map(([_, v]) => JSON.parse(v)));
      setImoveis(imoveis.map(([_, v]) => JSON.parse(v)));
    }
    carregarDados();
  }, []);

  const handleSalvar = async () => {
    if (!selectedInquilino || !selectedImovel || !inicio || !fim || !valor) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    const contrato = {
      id: Date.now().toString(),
      inquilino: selectedInquilino,
      imovel: selectedImovel,
      inicio,
      fim,
      valor
    };

    try {
      await AsyncStorage.setItem(`contrato_${contrato.id}`, JSON.stringify(contrato));
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
      <Picker selectedValue={selectedInquilino} onValueChange={setSelectedInquilino} style={styles.input}>
        <Picker.Item label="Selecione..." value="" />
        {inquilinos.map(i => (
          <Picker.Item key={i.cpf} label={i.nome} value={i.cpf} />
        ))}
      </Picker>

      <Text>Imóvel:</Text>
      <Picker selectedValue={selectedImovel} onValueChange={setSelectedImovel} style={styles.input}>
        <Picker.Item label="Selecione..." value="" />
        {imoveis.map(i => (
          <Picker.Item key={i.id} label={i.endereco} value={i.id} />
        ))}
      </Picker>

      <TextInput style={styles.input} placeholder="Data de Início (DD/MM/AAAA)" value={inicio} onChangeText={setInicio} />
      <TextInput style={styles.input} placeholder="Data de Fim (DD/MM/AAAA)" value={fim} onChangeText={setFim} />
      <TextInput style={styles.input} placeholder="Valor (R$)" value={valor} onChangeText={setValor} keyboardType="numeric" />

      <Button title="Salvar Contrato" onPress={handleSalvar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 10, marginBottom: 12
  }
});
