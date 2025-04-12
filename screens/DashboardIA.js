
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function DashboardIA() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState('');

  const handlePerguntar = () => {
    // Aqui você pode integrar com uma IA de verdade no futuro
    setResposta('Simulação de resposta da IA para: "' + input + '"');
    setInput('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🤖 Assistente de Inteligência Artificial</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite sua pergunta..."
        value={input}
        onChangeText={setInput}
      />

      <TouchableOpacity style={styles.button} onPress={handlePerguntar}>
        <Text style={styles.buttonText}>Perguntar</Text>
      </TouchableOpacity>

      {resposta !== '' && (
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{resposta}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20,
  },
  title: {
    fontSize: 22, marginBottom: 20, textAlign: 'center',
  },
  input: {
    width: '100%', borderColor: '#ccc', borderWidth: 1, padding: 10,
    borderRadius: 6, marginBottom: 15,
  },
  button: {
    backgroundColor: '#0066cc', paddingVertical: 12, paddingHorizontal: 30,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff', fontSize: 16,
  },
  responseBox: {
    marginTop: 30, padding: 15, backgroundColor: '#f1f1f1',
    borderRadius: 6, width: '100%',
  },
  responseText: {
    fontSize: 16,
  },
});
