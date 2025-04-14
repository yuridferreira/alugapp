import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Linking, Alert } from 'react-native';
import axios from 'axios';

export default function PagamentosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Pagamentos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22 },
});


export default function PagamentosScreen() {
  const [carregando, setCarregando] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState(null);

  const gerarBoleto = async () => {
    setCarregando(true);
    try {
      const response = await axios.post('http://SEU_BACKEND/api/pagamentos/gerar-boleto', {
        nome: 'Yuri Ferreira',
        cpfCnpj: '13997525960',
        email: 'yuridferreira@gmail.com',
        telefone: '48984641505',
        valor: 1450,
        vencimento: '2025-04-15',
      });

      setBoletoUrl(response.data.linkBoleto);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível gerar o boleto.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento do mês</Text>
      <View style={styles.infoBox}>
        <Text>Aluguel: R$ 1450,00</Text>
        <Text>Água: R$ 00,00</Text>
        <Text>Luz: R$ 100,00</Text>
        <Text style={styles.total}>Total: R$ 1.550,00</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : boletoUrl ? (
        <Button title="Abrir Boleto" onPress={() => Linking.openURL(boletoUrl)} />
      ) : (
        <Button title="Gerar Boleto" onPress={gerarBoleto} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  infoBox: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  total: { marginTop: 10, fontWeight: 'bold' },

});
