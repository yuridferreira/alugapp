import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ContratoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Contrato de Aluguel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22 },
});
